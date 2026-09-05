# Resume Chatbot — RAG on AWS Bedrock

A RAG chatbot that answers recruiter questions about my professional background, grounded in a
structured knowledge base instead of a static PDF. Built as both a practical job-search tool and
a hands-on demonstration of the RAG / serverless AWS skills it talks about.

**Live:** https://d3tfmrfiyp00g2.cloudfront.net/

## What it does

- Answers natural-language questions about my career, projects, and skills — grounded in a
  markdown knowledge base, not the model's general knowledge
- Off-topic questions get a fixed, non-generated refusal rather than an LLM-improvised answer
- **JD-fit workflow** — paste a job description or a link to one, and it returns a grounded
  fit assessment (skill-by-skill table: Strong Fit / Fit / Gap)
- FAQ panel surfaces the most-asked questions, tracked from real usage
- Per-session cost cap so no single visitor can run up unbounded generation cost

## Architecture

```
CloudFront (HTTPS + caching)
   └── S3 — static frontend (HTML/JS/CSS)

API Gateway (HTTP API) — POST /chat, GET /faq, GET /health
   └── Lambda (Python)
         ├── Bedrock Knowledge Base (Retrieve) ── S3 (markdown source) ── S3 Vectors (embeddings)
         ├── Bedrock (generation — Qwen3-32B)
         └── DynamoDB — Q&A log, FAQ counters, per-session cost tracking
```

- **Retrieval**: Bedrock Knowledge Bases, Titan Text Embeddings V2, indexed into **S3 Vectors**
  (chosen over OpenSearch Serverless — no $300+/month OCU floor for a low-traffic personal bot)
- **Generation**: Bedrock, currently **Qwen3-32B** — picked after a structured 10-question A/B
  test against Claude Sonnet 4.6 showed equivalent accuracy and instruction-following at roughly
  1/35th–1/50th the per-token cost
- **Guardrails**: system prompt restricts scope to professional-background questions; off-topic
  input gets a fixed, verbatim refusal string, never a generated one
- **Cost controls**: $-per-session cap tracked from actual Bedrock token usage, plus API Gateway
  throttling against abusive traffic
- **Frontend**: framework-free HTML/JS/CSS, safe client-side Markdown rendering (bold, lists,
  links, tables — always via `createElement`/`textContent`, never `innerHTML` on model output)

## Repo layout

```
knowledge-base/     Markdown source content (career, projects, skills) — the RAG corpus
lambda/handler.py   Request handling: retrieval, generation, guardrails, cost tracking, FAQ
frontend/           Static site — index.html, style.css, app.js, architecture diagram
resume-source/      HTML source for the résumé PDF served from the site
```

Infrastructure (Bedrock KB, S3 Vectors, Lambda, API Gateway, DynamoDB, CloudFront) is provisioned
directly via the AWS CLI rather than as committed IaC.

## Author

**Vivekanandhan S** — Business Intelligence Engineer, Amazon (10+ years, BI/analytics/data
engineering). [LinkedIn](https://linkedin.com/in/vivekanandhan-srinivasan-57713055)
