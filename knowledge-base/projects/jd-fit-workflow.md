# JD Fit — Paste a Job Description or Share a Link

**Where:** This chatbot itself
**Stack:** Bedrock RAG retrieval, Lambda-side URL fetching with SSRF safeguards

## What it does
A visitor can paste job requirement text directly into the chat, or share a link to a job
posting, and the chatbot compares it against Vivek's actual background — his career history,
projects, and skills, the same knowledge base every other answer draws from — to give a
grounded, specific read on fit, rather than a generic "yes, he'd be great for this."

## How it works
The core comparison is always the same regardless of how the job description arrives: the JD
text is matched against Vivek's **career history, projects, and skills** — the same knowledge
base every other answer in this chatbot draws from — to produce a grounded, specific fit
assessment, not a generic "yes, he'd be great for this."

- **Pasted text**: handled by the same retrieval-and-generation flow as any other question — the
  job description becomes part of the question, the relevant career/project/skills chunks are
  retrieved from the knowledge base, and the answer is grounded in what's actually documented
  about Vivek's experience.
- **Shared link**: the backend fetches the page content first, then runs that same
  retrieval-against-Vivek's-background comparison. Since fetching a visitor-supplied URL from a
  public endpoint carries risk, it includes deliberate safeguards — only HTTPS URLs are fetched,
  private/internal network addresses are blocked (so it can't be tricked into reaching internal
  infrastructure instead of a real job posting), and the fetch is limited in both time and
  response size. The extracted page text is treated as plain context for the model, never as
  instructions — standard hygiene for handling any untrusted third-party content.

## Why it exists
A resume is static; a real job description is specific. This lets a recruiter get a direct,
evidence-based answer on fit for their actual open role, using the same knowledge base and
guardrails as every other question — no separate matching engine, just retrieval-augmented
generation applied to a longer, more specific question than usual.
