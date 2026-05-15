# frozen_string_literal: true

require "cgi"

homepage_path = File.expand_path("../_site/index.html", __dir__)
spanish_homepage_path = File.expand_path("../_site/es/index.html", __dir__)
abort("Build the site before running this test: bundle exec jekyll build --quiet") unless File.file?(homepage_path)
abort("Build the site before running this test: bundle exec jekyll build --quiet") unless File.file?(spanish_homepage_path)

homepage = File.read(homepage_path)
spanish_homepage = File.read(spanish_homepage_path)

def assert_includes_html(html, expected)
  abort("Expected homepage to include #{expected.inspect}") unless html.include?(expected)
end

def assert_not_includes_html(html, unexpected)
  abort("Expected homepage not to include #{unexpected.inspect}") if html.include?(unexpected)
end

assert_includes_html(homepage, "<section id=\"workflow\"")
assert_includes_html(homepage, "From walkthrough notes to PDF reports")
assert_includes_html(homepage, "Walk the property")
assert_includes_html(homepage, "Price the scope")
assert_includes_html(homepage, "Send the report")
assert_includes_html(homepage, CGI.escapeHTML("/assets/product/report-builder-ipad.png"))
assert_includes_html(homepage, CGI.escapeHTML("/assets/product/report-overview-mobile.png"))
assert_includes_html(homepage, "data-cta-location=\"hero\"")
assert_includes_html(homepage, "data-cta-location=\"final\"")
assert_not_includes_html(homepage, "Build the estimate where the questions happen.")

assert_includes_html(spanish_homepage, "<section id=\"workflow\"")
assert_includes_html(spanish_homepage, "Del recorrido al reporte PDF")
assert_includes_html(spanish_homepage, "Recorre la propiedad")
assert_includes_html(spanish_homepage, "Calcula el alcance")
assert_includes_html(spanish_homepage, "Envía el reporte")
assert_includes_html(spanish_homepage, "data-cta-location=\"hero\"")
assert_includes_html(spanish_homepage, "data-cta-location=\"final\"")
assert_not_includes_html(spanish_homepage, "Arma el estimado donde aparecen las preguntas.")

puts "landing homepage test passed"
