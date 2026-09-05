# Python, PySpark & Data Engineering

Python and PySpark are core to Vivek's data engineering work — his role has grown from
BI/analytics scripting into real distributed data processing.

## Core usage
- **Python (Pandas)** — data cleaning, transformation, statistical analysis, and predictive
  modelling work at Amazon
- **PySpark** — distributed data processing at real scale, most notably processing battery
  telemetry from 1M+ active Ring IoT devices (see `projects/ring-iot-battery-analytics.md`)
- **Apache Airflow** — building and scheduling automated data pipelines, used alongside PySpark
  for both the Ring IoT platform and general pipeline orchestration; a natural extension of his
  broader pattern of automating manual reporting processes (see `career/` for examples at
  Maersk, SCIO Health, and Amazon)
- **AWS Glue** — ETL pipeline development as part of his AWS data engineering stack
- **Data Warehouse Architecture** — including Snowflake-compatible architecture design,
  alongside his primary Redshift work
- **R / R Shiny** — used for the Keyword Ranking SOP Tool and the Ring IoT self-service
  analytics tool at Amazon; also SAS earlier in his career at Mu Sigma and SCIO Health

## Depth beyond dashboarding
Two things demonstrate real engineering depth beyond BI reporting:
- The **Ring IoT Battery Analytics** platform — PySpark/Airflow ETL at genuine IoT scale (1M+
  devices, 15+ metrics), not just dashboard queries
- This **resume chatbot itself** (`projects/resume-chatbot-design.md`) — a serverless Lambda
  backend handling retrieval, generation, guardrails, and cost tracking end-to-end
