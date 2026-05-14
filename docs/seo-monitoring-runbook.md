# SEO Monitoring Runbook

## Baseline

Recorded from Google Search Console on May 15, 2026:

- Property: `rehabestimator.app`
- Page indexing last update: May 11, 2026
- Indexed pages: 0
- Not indexed pages: 6
- Current not indexed reason: `Crawled - currently not indexed`
- Validation status: `Not Started`
- Performance, last 3 months: 0 clicks, 0 impressions
- Query data: none
- Page data: none
- Sitemap: `https://app.rehabestimator.app/sitemap.xml`
- Sitemap status after submission: `Success`
- Sitemap last read: May 15, 2026
- Sitemap discovered pages before Spanish launch: 10
- Expected sitemap pages after Spanish launch: 19

## Weekly Check

Run this check once per week after sitemap or calculator page changes deploy.

1. Open Search Console for `rehabestimator.app`.
2. Record Page indexing:
   - Indexed pages count
   - Not indexed pages count
   - Top not indexed reason
   - Validation state
   - Last update date
3. Open Sitemaps:
   - Submitted sitemap URL
   - Status
   - Last read date
   - Discovered pages
4. Open Performance, Search results, last 3 months:
   - Total clicks
   - Total impressions
   - Average CTR
   - Average position
   - Top queries
   - Top pages
5. Compare calculator pages:
   - `/es/`
   - `/rehab-cost-calculator/`
   - `/fix-and-flip-calculator/`
   - `/rental-cashflow-calculator/`
   - `/kitchen-remodel-cost-estimator/`
   - `/bathroom-remodel-cost-estimator/`
   - `/es/calculadora-costos-remodelacion/`
   - `/es/calculadora-fix-and-flip/`
   - `/es/calculadora-flujo-renta/`
6. Record changes in the active SEO issue or a dated note in this file.

## GA Events

Google Analytics is configured with `G-CW74KH0YSC`.

Tracked landing-page conversion events:

| Event | Trigger | Required parameters |
| --- | --- | --- |
| `app_store_cta_click` | App Store CTA click | `page_path`, `store`, `cta_location`, `link_url` |
| `play_store_cta_click` | Play Store CTA click | `page_path`, `store`, `cta_location`, `link_url` |
| `calculator_result_generated` | First valid calculator result per page load | `page_path`, `calculator_name` |
| `calculator_page_cta_click` | App Store or Play Store CTA click from a calculator page | `page_path`, `calculator_name`, `store`, `cta_location`, `link_url` |

Do not send user-entered calculator values to GA. The event only records that a result was generated and which calculator page was used.

CTA locations currently used:

- `header`
- `download_cta`
- `calculator_result`

## Search Console Response

### URL is unknown to Google

1. Confirm the URL returns 200.
2. Confirm the page has a self-referencing canonical tag.
3. Confirm the page is included in `sitemap.xml` when it is index-worthy.
4. Submit the sitemap again if the sitemap was missing or stale.
5. Request indexing for the canonical URL.

### Crawled - currently not indexed

1. Export or record the exact URLs.
2. Classify each URL as a primary SEO page, support/legal page, or duplicate tracking URL.
3. For primary SEO pages, improve visible content, internal links, and supported structured data.
4. For duplicate tracking URLs, keep the canonical target clean and request indexing only for the canonical URL.
5. For support pages, decide whether to leave indexable or add `noindex`.
6. Start validation only after relevant fixes are deployed.

### Sitemap read errors

1. Open `https://app.rehabestimator.app/sitemap.xml`.
2. Confirm it returns 200 XML.
3. Confirm `robots.txt` points to the canonical sitemap URL.
4. Confirm sitemap entries are canonical and indexable.
5. Re-submit the sitemap after the deployed file is fixed.

### Zero impressions after indexing

1. Confirm target pages are indexed with URL Inspection.
2. Check whether impressions are filtered by date range, country, or search type.
3. Improve page intent coverage, FAQs, internal links, and visible tool value.
4. Compare each calculator page in Performance by page path.
5. If indexed pages still have no impressions after two to four weeks, add more specific long-tail pages or improve snippets and internal links.
