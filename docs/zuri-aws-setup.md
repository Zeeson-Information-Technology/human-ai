# Zuri AI Interviewer — AWS Setup (v1)

This guide maps the current Next.js app to AWS services and gives you concrete steps, IAM snippets, and env config to enable a human‑like, bias‑aware AI interviewer with A/V, live STT, TTS, resume understanding, anti‑cheat, and automatic reporting.

## Components

- Auth: Cognito (Company pool + Candidate pool or single pool with groups)
- Realtime A/V + screen share + (optional) recording: Amazon Chime SDK
- Live STT + batch STT: Amazon Transcribe (Streaming + Batch)
- TTS: Amazon Polly (Neural voices)
- LLM + Guardrails + Embeddings: Amazon Bedrock
- Vector store: OpenSearch (Serverless) for resumes + job embeddings
- Storage: S3 (resumes, transcripts, recordings, reports) + KMS
- Orchestration: API Gateway (HTTP + WebSocket), Lambda, Step Functions, SQS/SNS
- Analytics: Athena + QuickSight

## Minimal Enablement Checklist

1) Create S3 buckets (KMS‑encrypted):
   - `zuri-media-<env>` (recordings, waveforms, vtt)
   - `zuri-reports-<env>` (JSON, PDF)
   - `zuri-resumes-<env>` (PDFs)

2) Chime SDK
   - Enable meeting create/join via backend Lambda or a temporary Next.js API for dev.
   - (Optional) Recording to S3 with capture Lambda.

3) Transcribe
   - Allow Streaming for live captions; Batch for post‑hoc.
   - Regions: match Chime region to reduce latency.

4) Bedrock
   - Request model access (e.g., `anthropic.claude-3-5-sonnet-20241022-v2:0`) in your region.
   - Create Guardrails (bias/safety) and attach to requests.
   - (Optional) Titan Embeddings for resumes/jobs; store in OpenSearch.

5) API Gateway + Lambda (or Next.js as orchestrator during dev)
   - HTTP API for session CRUD; WebSocket API for live interviewer turns.
   - Lambdas run with least‑privileged IAM for S3, Bedrock, Transcribe, Chime.

6) Step Functions (post‑interview pipeline)
   - Triggered by S3 `ObjectCreated` on recordings and/or session finalize.
   - MediaConvert (optional) → Transcribe Batch → Bedrock summary → S3 report → DDB upsert.

7) Cognito User Pools
   - Company (admin/recruiter/manager) and Candidate (optional) or single pool with role claims.

8) Observability & Security
   - CloudWatch logs/metrics, X‑Ray traces, CloudTrail, WAF on API.

## IAM Policy Sketches

Attach service‑specific permissions to Lambda roles (trim as you go):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {"Effect": "Allow", "Action": ["bedrock:InvokeModel", "bedrock:ApplyGuardrail"], "Resource": "*"},
    {"Effect": "Allow", "Action": ["polly:SynthesizeSpeech"], "Resource": "*"},
    {"Effect": "Allow", "Action": ["transcribe:StartStreamTranscriptionWebSocket", "transcribe:StartTranscriptionJob", "transcribe:GetTranscriptionJob"], "Resource": "*"},
    {"Effect": "Allow", "Action": ["chime:CreateMeeting", "chime:CreateAttendee"], "Resource": "*"},
    {"Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::zuri-media-*", "arn:aws:s3:::zuri-media-*/*", "arn:aws:s3:::zuri-reports-*", "arn:aws:s3:::zuri-reports-*/*", "arn:aws:s3:::zuri-resumes-*", "arn:aws:s3:::zuri-resumes-*/*"]}
  ]
}
```

## Environment Variables (.env)

Add these in `human-intel/.env.local`:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

ZURI_S3_MEDIA_BUCKET=zuri-media-dev
ZURI_S3_REPORTS_BUCKET=zuri-reports-dev
ZURI_S3_RESUMES_BUCKET=zuri-resumes-dev

CHIME_REGION=us-east-1
TRANSCRIBE_LANGUAGE_CODE=en-US

BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_GUARDRAIL_ID=gr-xxxxxxxx
BEDROCK_GUARDRAIL_VERSION=1

OPENSEARCH_ENDPOINT=https://xxx.us-east-1.aoss.amazonaws.com

ZURI_TTS_VOICE=Joanna
```

## Guardrails (Bedrock)

Create a Guardrail with rules covering:
- Bias/sensitive topics policy (hiring fairness) with refusal messages
- Safety thresholds (toxicity/harassment)
- PII redaction on outputs (use at report‑gen time)

Then attach via `guardrailIdentifier` and `guardrailVersion` on each LLM call.

## Interview Flow (Dev baseline)

1) Client joins Zuri session (existing `/api/zuri/sessions/[id]?...`).
2) UI connects to WebSocket (API Gateway) or uses HTTP polling for turns (dev fallback).
3) On candidate answer:
   - Send transcript text to `/api/zuri/bedrock/turn` (new route – see below).
   - Receive next question + optional follow‑ups.
   - Optionally request TTS via `/api/zuri/tts` and play.
4) On end: call existing finalize `/api/zuri/sessions/[id]/finalize`.

## Post‑Interview Pipeline

S3 `interviews/<sessionId>/recording.mp4` → Step Functions → (MediaConvert) → Transcribe Batch → Bedrock summary → `reports/<sessionId>/summary.json|pdf` → DDB upsert → Admin UI.

## Packages to Install (in `human-intel`)

```
npm i @aws-sdk/client-bedrock-runtime @aws-sdk/client-polly @aws-sdk/client-transcribe @aws-sdk/client-chime-sdk-meetings @aws-sdk/credential-providers
```

You can keep credentials in `.env.local` for dev; use roles in prod.

## Security Notes

- Use KMS on all buckets; presign S3 URLs for client access.
- Use Cognito JWTs for API auth (company/candidate) on WS/HTTP.
- Redact transcripts before analytics; honor deletion/retention.

---

For a CDK stack on the next pass, we can codify API GW (HTTP/WS), Lambdas for Chime/turns, Step Functions pipeline, and IAM least‑privilege bindings.

