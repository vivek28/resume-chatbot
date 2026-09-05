# AWS & Cloud

## Services used
- **Redshift** — primary data warehouse for BI reporting and data engineering at Amazon
- **S3** — object storage, used across data pipelines
- **Athena** — serverless querying alongside Redshift
- **Glue** — data pipeline/ETL tooling
- **IAM** — access management
- **Lambda** — serverless compute, used in production for the MCP-server pipeline automation
  system and the Ring IoT automated metrics delivery system (see `career/amazon.md`), plus this
  resume chatbot's own backend
- **IoT Core** — used in personal projects (e.g. sensor/IoT work)
- **Snowflake-compatible data warehouse architectures** — designed alongside his primary
  Redshift work

## Context
Most of this AWS experience comes from building and maintaining BI/data engineering
infrastructure at Amazon — Redshift-backed pipelines feeding Tableau and R Shiny tools, plus two
production Lambda-based automation systems (see `career/amazon.md` and `projects/`). He's also
applied AWS services (including Lambda and IoT Core) in personal projects outside of work.

This resume chatbot itself — Bedrock Knowledge Bases, S3 Vectors, Lambda, API Gateway, DynamoDB,
CloudFront — is a current, hands-on demonstration of AWS serverless architecture design, built
from scratch as a portfolio piece.
