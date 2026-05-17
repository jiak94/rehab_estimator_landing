#!/usr/bin/env ruby
# frozen_string_literal: true

site_dir = File.expand_path("../_site", __dir__)
fallback_path = File.join(site_dir, "404.html")

abort("Build the site before running this test: bundle exec jekyll build --quiet") unless Dir.exist?(site_dir)
abort("Missing #{fallback_path}") unless File.file?(fallback_path)

fallback = File.read(fallback_path)

def assert_includes_html(html, expected)
  abort("Expected import fallback to include #{expected.inspect}") unless html.include?(expected)
end

assert_includes_html(fallback, "<meta name=\"robots\" content=\"noindex, follow\"")
assert_includes_html(fallback, "id=\"import-link-fallback\"")
assert_includes_html(fallback, "data-import-path-prefix=\"/import/\"")
assert_includes_html(fallback, "https://apps.apple.com/us/app/rehab-estimator/id1569047553")
assert_includes_html(fallback, "https://play.google.com/store/apps/details?id=app.estimator.rehab")
assert_includes_html(fallback, "Install Rehab Estimator, then reopen this link or scan the QR again.")
assert_includes_html(fallback, "app-argument=\" + currentUrl")
assert_includes_html(fallback, "id=\"import-open-link\"")
assert_includes_html(fallback, "id=\"import-app-store-link\"")
assert_includes_html(fallback, "id=\"import-play-store-link\"")
assert_includes_html(fallback, "var isAndroid = /Android/i.test(userAgent);")
assert_includes_html(fallback, "var isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent);")
assert_includes_html(fallback, "appStoreLink.hidden = isAndroid;")
assert_includes_html(fallback, "playStoreLink.hidden = isAppleMobile;")

puts "import fallback test passed"
