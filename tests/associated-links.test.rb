#!/usr/bin/env ruby

require "json"

site_dir = File.expand_path("../_site", __dir__)
aasa_path = File.join(site_dir, ".well-known", "apple-app-site-association")

abort("Build the site before running this test: bundle exec jekyll build --quiet") unless Dir.exist?(site_dir)
abort("Missing #{aasa_path}") unless File.file?(aasa_path)

aasa = JSON.parse(File.read(aasa_path))
details = aasa.fetch("applinks").fetch("details")
app = details.find { |entry| entry["appID"] == "RLG6KSNL2Y.app.rehabestimator" }

abort("Missing Universal Links appID") unless app
abort("Missing /import/* Universal Links path") unless app.fetch("paths").include?("/import/*")

puts "associated links test passed"
