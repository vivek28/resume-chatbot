# AI & LLM Work

Vivek's most recent area of skill growth — applying LLMs and AI agents to both his day job and
personal projects.

## At Amazon: production AI-agent-driven automation
Pioneered adoption of AI agents and Amazon's internal MCP (Model Context Protocol) servers to
automate data pipeline monitoring and incident management — not a prototype, a production system
handling live pipeline failures. It monitors pipeline completion status with real-time Slack
updates, and automatically re-triggers failed jobs and updates tickets on resolution. Result:
60% reduction in manual oversight effort, 40% reduction in mean time to resolution (MTTR), and
80% of routine failures now handled with zero manual intervention. See
`projects/ai-pipeline-agent.md` for the full detail.

## This chatbot: full RAG system design
This resume chatbot itself is his most complete, hands-on demonstration of AI/LLM engineering:
a full Retrieval-Augmented Generation (RAG) system built on AWS Bedrock Knowledge Bases —
including knowledge base design, embeddings and vector retrieval (S3 Vectors), prompt
engineering and guardrails for the generation layer, and a purpose-built "JD fit" workflow that
compares a job description against his background. See `projects/resume-chatbot-design.md` for
the full architecture.

## What this shows
Practitioner-level experience with LLM-powered systems across two different angles: applying AI
agents to automate real production infrastructure at Amazon (MCP servers, not just a chat
interface), and designing a full RAG system from scratch (this chatbot) — knowledge base design,
retrieval pipelines, grounded/guardrailed prompts, and the cost/security implications of running
an LLM behind a public-facing endpoint.
