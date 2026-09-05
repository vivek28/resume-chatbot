# Ring IoT Battery Life Analytics

**Where:** Amazon, Business Intelligence & Data Engineer
**Stack:** PySpark, Apache Airflow, AWS Redshift, R Shiny, AWS Lambda

## Problem
Ring IoT security devices (Doorbells & Cameras) needed accurate Battery Life Expectancy
reporting, but the existing calculation had a 2-3% variance, and battery engineers lacked a
self-service way to analyze battery telemetry across the many device metrics that affect
battery life — every ad-hoc analysis required going through the data team directly.

## Approach
Vivek architected and led an end-to-end data platform modernization for this reporting:
- Built scalable ETL workflows using PySpark and Airflow to process battery telemetry data from
  **1M+ active IoT devices**
- Collaborated with the Battery Subject Matter Expert and cross-functional engineering teams to
  design a data architecture integrating **15+ IoT device metrics** that impact battery life
- Implemented a unified self-service analytics tool (R Shiny) so battery engineers could perform
  complex analyses at multiple granularities themselves, without going through the data team
- Built an automated metrics delivery system (AWS Lambda + Redshift) that calculates and
  publishes Alpha trial metrics directly to Slack channels

## Outcome
- Eliminated the 2-3% calculation variance, improving data accuracy
- Reduced battery life impact analysis time during Alpha/Beta trials by **70%**, letting
  engineering teams deliver timely battery life projections before product launches and speeding
  up go-to-market readiness
- Real-time metrics visibility for 20+ cross-functional stakeholders, eliminating manual
  reporting delays
- Also mentored a Business Intelligence Engineer on ETL development best practices, PySpark/Airflow
  pipeline optimization, and self-service tool design as part of this initiative — reducing
  ad-hoc data requests to the team by 40%

This is Vivek's clearest example of IoT-scale data engineering (processing device-level
telemetry from a million-plus active devices), distinct from his more typical BI/dashboarding
work — real ETL/PySpark engineering depth applied to a hardware product's operational data.
