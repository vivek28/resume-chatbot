# Out-of-Stock ASIN De-indexing Pipeline

**Where:** Amazon, Business Intelligence & Data Engineer
**Stack:** Spark SQL, AWS Redshift, R

## Problem
Permanently out-of-stock ASINs (product listings) remained indexed and discoverable via search
engines, creating dead-end product pages for customers who clicked through from Google or other
search results only to find an unavailable product — a poor customer experience and wasted
search-engine crawl budget.

## Approach
Vivek architected and engineered automated experimentation pipelines to identify **10,000+**
permanently out-of-stock ASINs — distinguishing them from normal restocking cycles — and fed
that list into Amazon's de-indexing process to remove them from search engine results, designing
scalable data workflows end-to-end rather than a one-off script.

## Outcome
Reduced customer friction on unavailable products and improved overall search experience quality
by **15%** — a concrete, measurable reduction in a specific class of broken customer journeys, at
real scale (10,000+ listings, not a small pilot).
