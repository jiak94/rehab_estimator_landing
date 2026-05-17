#!/usr/bin/env ruby

require "json"

site_dir = File.expand_path("../_site", __dir__)
aasa_path = File.join(site_dir, ".well-known", "apple-app-site-association")
assetlinks_path = File.join(site_dir, ".well-known", "assetlinks.json")
workflow_path = File.expand_path("../.github/workflows/pages.yml", __dir__)

abort("Build the site before running this test: bundle exec jekyll build --quiet") unless Dir.exist?(site_dir)
abort("Missing #{aasa_path}") unless File.file?(aasa_path)
abort("Missing #{assetlinks_path}") unless File.file?(assetlinks_path)

aasa = JSON.parse(File.read(aasa_path))
details = aasa.fetch("applinks").fetch("details")
app = details.find { |entry| entry["appID"] == "RLG6KSNL2Y.app.rehabestimator" }

abort("Missing Universal Links appID") unless app
abort("Missing /import/* Universal Links path") unless app.fetch("paths").include?("/import/*")

assetlinks = JSON.parse(File.read(assetlinks_path))
android_app = assetlinks.find do |entry|
  target = entry["target"]
  target &&
    target["namespace"] == "android_app" &&
    target["package_name"] == "app.estimator.rehab"
end

abort("Missing Android App Links package") unless android_app
abort("Missing Android App Links relation") unless android_app.fetch("relation").include?("delegate_permission/common.handle_all_urls")

fingerprints = android_app.fetch("target").fetch("sha256_cert_fingerprints")
expected_fingerprint = "90:F9:61:C1:C8:CD:C8:16:81:01:72:A9:38:C5:0B:F5:0F:12:F6:0C:91:A6:D7:C2:48:A8:CB:F9:51:D0:E3:AF"
abort("Missing Play app signing SHA-256 fingerprint") unless fingerprints.include?(expected_fingerprint)

workflow = File.read(workflow_path)
abort("Pages artifact must include hidden files") unless workflow.include?("include-hidden-files: true")

puts "associated links test passed"
