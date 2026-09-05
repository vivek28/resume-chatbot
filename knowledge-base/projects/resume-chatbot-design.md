# This Chatbot — RAG Architecture on AWS Bedrock

**Stack:** AWS Bedrock Knowledge Bases, S3 Vectors, Qwen3-32B (Bedrock), Lambda, API Gateway,
DynamoDB, S3, CloudFront

You're using it right now. This chatbot is itself a hands-on demonstration of Vivek's AI/cloud
engineering skills, built as a portfolio piece alongside serving its practical purpose — letting
recruiters ask natural-language questions about his background instead of reading a static PDF.

## Problem
A resume is a static, one-size-fits-all document. Recruiters often want answers to specific
questions ("does he have Redshift experience?", "how does his background fit this JD?") faster
than reading through a full PDF — and Vivek wanted a live, working example of RAG architecture
to show alongside his AI/LLM skill claims, not just describe them.

## Approach
- **Retrieval-Augmented Generation (RAG)** via **AWS Bedrock Knowledge Bases** — this entire
  knowledge base (career history, project write-ups, skills, education, contact — the very
  content you're reading right now) lives as markdown files in S3, auto-chunked and embedded by
  Bedrock using **Titan Text Embeddings**, and indexed into **S3 Vectors**
- **S3 Vectors over OpenSearch Serverless** — a deliberate cost decision: OpenSearch Serverless
  has a $345–700/month minimum (OCU-based pricing) regardless of usage, which doesn't make sense
  for a low-traffic personal chatbot. S3 Vectors costs pennies at this scale instead
- **Generation via Bedrock, not a direct provider API** — so the whole system stays inside AWS
  with one bill. Currently running on **Qwen3-32B**, chosen after a structured 10-question A/B
  test against Claude Sonnet 4.6: both were equally accurate and equally reliable at strict
  instruction-following (exact-string guardrail responses, exact JD-fit table formatting), but
  Qwen3-32B runs at roughly 1/35th to 1/50th the per-token cost — a meaningful difference for a
  cost-conscious personal chatbot. Claude Sonnet 4.6 stays available as an internal comparison
  option, not used in production by default
- **Serverless request handling** — API Gateway → Lambda (Python), which retrieves from the
  Knowledge Base, calls the model for generation, and logs every question/answer pair to DynamoDB
- **Guardrails** — the system prompt restricts answers to Vivek's professional background; any
  off-topic question gets a fixed, non-generated answer ("Ask only about Vivekanandhan") rather
  than an LLM-improvised redirect
- **Cost controls, layered**: an AWS Budget with a hard-stop action (not just an alert) as an
  account-wide safety net, API Gateway throttling against abusive traffic, and a $2-per-session
  cost cap tracked in DynamoDB from actual Bedrock token usage — so no single visitor can run up
  unbounded generation cost
- **A "JD fit" workflow** — visitors can paste a job description or share a link to one for a
  grounded fit assessment (see `projects/jd-fit-workflow.md` for the full detail)
- **FAQ tracking** — every question is normalized and frequency-counted in DynamoDB, surfaced
  above the chat window so common questions are visible without typing
- **Frontend** — a single-page, framework-free HTML/JS/CSS app hosted on S3 behind CloudFront
  for HTTPS and caching

## Outcome
A working RAG chatbot built end-to-end — knowledge base content, retrieval, generation,
guardrails, layered cost controls, and a purpose-built JD-fit workflow — demonstrating practical
skill in Bedrock Knowledge Bases, serverless AWS architecture, prompt engineering, and cost-aware
infrastructure design, not just familiarity with the concepts.
