#!/usr/bin/env ruby
# frozen_string_literal: true

require "net/http"
require "optparse"
require "rexml/document"
require "uri"
require "yaml"

Response = Struct.new(:status, :body, :content_type, :source, keyword_init: true)

options = {
  config: "_config.yml",
  site_dir: nil,
  base_url: nil
}

OptionParser.new do |parser|
  parser.banner = "Usage: ruby scripts/check_seo_crawl.rb [options]"
  parser.on("--config PATH", "Jekyll config file. Default: _config.yml") { |value| options[:config] = value }
  parser.on("--site-dir PATH", "Validate a generated Jekyll site directory instead of live HTTP.") { |value| options[:site_dir] = value }
  parser.on("--base-url URL", "Canonical base URL. Default: url from _config.yml") { |value| options[:base_url] = value }
end.parse!

def fail!(message)
  warn "SEO crawl check failed: #{message}"
  exit 1
end

def normalize_base_url(value)
  value.to_s.sub(%r{/+\z}, "")
end

def absolute_url(base_url, path)
  path = "/#{path}" unless path.start_with?("/")
  "#{base_url}#{path}"
end

def content_type_for(path)
  case File.extname(path)
  when ".html" then "text/html"
  when ".xml" then "application/xml"
  when ".txt" then "text/plain"
  else "application/octet-stream"
  end
end

def local_file_for(site_dir, uri)
  relative_path = if uri.path == "/"
                    "index.html"
                  elsif uri.path.end_with?("/")
                    File.join(uri.path.sub(%r{\A/}, ""), "index.html")
                  else
                    uri.path.sub(%r{\A/}, "")
                  end
  File.join(site_dir, relative_path)
end

def fetch_local(site_dir, url)
  uri = URI(url)
  path = local_file_for(site_dir, uri)
  return Response.new(status: 404, body: "", content_type: nil, source: path) unless File.file?(path)

  Response.new(status: 200, body: File.read(path), content_type: content_type_for(path), source: path)
end

def fetch_http(url, redirect_limit = 3)
  fail!("too many redirects for #{url}") if redirect_limit.negative?

  uri = URI(url)
  response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https", open_timeout: 10, read_timeout: 20) do |http|
    request = Net::HTTP::Get.new(uri)
    request["User-Agent"] = "rehab-estimator-seo-crawl-check/1.0"
    http.request(request)
  end

  if response.is_a?(Net::HTTPRedirection)
    location = URI.join(url, response["location"]).to_s
    return fetch_http(location, redirect_limit - 1)
  end

  Response.new(status: response.code.to_i, body: response.body.to_s, content_type: response["content-type"], source: url)
end

def fetch(url, options)
  if options[:site_dir]
    fetch_local(options[:site_dir], url)
  else
    fetch_http(url)
  end
end

def assert_200!(response, label)
  fail!("#{label} returned #{response.status} from #{response.source}") unless response.status == 200
end

def assert_xml!(response)
  fail!("sitemap.xml is empty") if response.body.strip.empty?
  REXML::Document.new(response.body)
rescue REXML::ParseException => e
  fail!("sitemap.xml is not valid XML: #{e.message}")
end

def sitemap_entries(document)
  entries = []
  document.root.each_element do |url_element|
    next unless url_element.name == "url"

    entry = {}
    url_element.each_element do |child|
      entry[child.name] = child.text.to_s.strip
    end
    entries << entry
  end
  entries
end

def canonical_href(html)
  html.scan(/<link\b[^>]*>/i).each do |tag|
    next unless tag.match?(/\brel=["'][^"']*\bcanonical\b[^"']*["']/i)

    match = tag.match(/\bhref=["']([^"']+)["']/i)
    return match[1] if match
  end
  nil
end

def html_lang(html)
  match = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)
  match && match[1]
end

def hreflang_links(html)
  html.scan(/<link\b[^>]*>/i).each_with_object({}) do |tag, links|
    next unless tag.match?(/\brel=["'][^"']*\balternate\b[^"']*["']/i)

    lang = tag.match(/\bhreflang=["']([^"']+)["']/i)&.[](1)
    href = tag.match(/\bhref=["']([^"']+)["']/i)&.[](1)
    links[lang] = href if lang && href
  end
end

def noindex?(html)
  html.scan(/<meta\b[^>]*>/i).any? do |tag|
    tag.match?(/\bname=["']robots["']/i) && tag.match?(/\bcontent=["'][^"']*\bnoindex\b/i)
  end
end

config = YAML.load_file(options[:config])
base_url = normalize_base_url(options[:base_url] || ENV["SEO_BASE_URL"] || config.fetch("url"))
sitemap_config = config.fetch("sitemap_urls")
localized_page_pairs = config.fetch("localized_page_pairs") { fail!("_config.yml is missing localized_page_pairs") }
fail!("_config.yml localized_page_pairs is empty") if localized_page_pairs.empty?
expected_urls = sitemap_config.map { |entry| absolute_url(base_url, entry.fetch("path")) }
calculator_urls = expected_urls.select { |url| url.include?("calculator") || url.include?("estimator") }
localized_urls = localized_page_pairs.flat_map do |pair|
  [absolute_url(base_url, pair.fetch("en")), absolute_url(base_url, pair.fetch("es"))]
end

homepage = fetch(absolute_url(base_url, "/"), options)
assert_200!(homepage, "homepage")

robots = fetch(absolute_url(base_url, "/robots.txt"), options)
assert_200!(robots, "robots.txt")
fail!("robots.txt does not allow crawling") unless robots.body.match?(/User-agent:\s*\*/i) && robots.body.match?(/Allow:\s*\//i)
fail!("robots.txt does not point to the canonical sitemap URL") unless robots.body.include?(absolute_url(base_url, "/sitemap.xml"))

sitemap = fetch(absolute_url(base_url, "/sitemap.xml"), options)
assert_200!(sitemap, "sitemap.xml")
document = assert_xml!(sitemap)
entries = sitemap_entries(document)
locs = entries.map { |entry| entry.fetch("loc", nil) }.compact

fail!("sitemap.xml has no URLs") if locs.empty?
fail!("sitemap.xml has duplicate URLs") unless locs.uniq.length == locs.length
fail!("sitemap.xml is missing homepage") unless locs.include?(absolute_url(base_url, "/"))
missing_calculators = calculator_urls - locs
fail!("sitemap.xml is missing calculator URLs: #{missing_calculators.join(", ")}") unless missing_calculators.empty?

missing_config_urls = expected_urls - locs
fail!("sitemap.xml is missing configured URLs: #{missing_config_urls.join(", ")}") unless missing_config_urls.empty?

missing_localized_urls = localized_urls.uniq - locs
fail!("sitemap.xml is missing localized URLs: #{missing_localized_urls.join(", ")}") unless missing_localized_urls.empty?

missing_lastmod = entries.select { |entry| entry["loc"].to_s.empty? || entry["lastmod"].to_s.empty? }.map { |entry| entry["loc"] }
fail!("sitemap.xml entries are missing lastmod: #{missing_lastmod.join(", ")}") unless missing_lastmod.empty?

locs.each do |loc|
  page = fetch(loc, options)
  assert_200!(page, loc)
  fail!("#{loc} does not have a matching canonical tag") unless canonical_href(page.body) == loc
  fail!("#{loc} emits noindex") if noindex?(page.body)
end

localized_page_pairs.each do |pair|
  variants = {
    "en" => absolute_url(base_url, pair.fetch("en")),
    "es" => absolute_url(base_url, pair.fetch("es"))
  }

  variants.each do |lang, url|
    page = fetch(url, options)
    assert_200!(page, url)

    expected_html_lang = lang == "es" ? "es" : "en-us"
    fail!("#{url} has html lang #{html_lang(page.body).inspect}, expected #{expected_html_lang.inspect}") unless html_lang(page.body) == expected_html_lang

    links = hreflang_links(page.body)
    variants.each do |alternate_lang, alternate_url|
      next if links[alternate_lang] == alternate_url

      fail!("#{url} is missing hreflang #{alternate_lang} => #{alternate_url}")
    end

    fail!("#{url} is missing hreflang x-default => #{variants.fetch("en")}") unless links["x-default"] == variants.fetch("en")
  end
end

mode = options[:site_dir] ? "local build #{options[:site_dir]}" : "HTTP"
puts "SEO crawl check passed for #{base_url} using #{mode}"
puts "- homepage: 200"
puts "- robots.txt: 200, allows crawling, points to #{absolute_url(base_url, "/sitemap.xml")}"
puts "- sitemap.xml: 200 XML with #{locs.length} URLs and lastmod values"
puts "- sitemap coverage: homepage and calculator pages present"
puts "- localized pages: #{localized_page_pairs.length} English/Spanish hreflang pairs present"
puts "- pages: #{locs.length} URLs returned 200, canonical matched, no noindex"
