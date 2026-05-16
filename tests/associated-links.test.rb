#!/usr/bin/env ruby

require "json"

site_dir = File.expand_path("../_site", __dir__)
aasa_path = File.join(site_dir, ".well-known", "apple-app-site-association")
workflow_path = File.expand_path("../.github/workflows/pages.yml", __dir__)

abort("Build the site before running this test: bundle exec jekyll build --quiet") unless Dir.exist?(site_dir)
abort("Missing #{aasa_path}") unless File.file?(aasa_path)

aasa = JSON.parse(File.read(aasa_path))
details = aasa.fetch("applinks").fetch("details")
app = details.find { |entry| entry["appID"] == "RLG6KSNL2Y.app.rehabestimator" }

abort("Missing Universal Links appID") unless app
abort("Missing /import/* Universal Links path") unless app.fetch("paths").include?("/import/*")

workflow = File.read(workflow_path)
abort("Pages artifact must include hidden files") unless workflow.include?("include-hidden-files: true")

puts "associated links test passed"
