# MiniMax API Relay Worker

Forwards requests from European Cloudflare edge nodes to MiniMax China servers, reducing latency for users outside China.

## Architecture

```
User (EU) → Cloudflare Workers (EU edge) → api.minimaxi.com (China)
```

## Deploy

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler deploy
```

## Configure Environment Variable

In Cloudflare Dashboard → Workers & Pages → your Worker → Settings → Variables:

| Variable | Value |
|----------|-------|
| `MINIMAX_API_KEY` | Your MiniMax API key |

## Client Configuration

### Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-minimax-api-key",
    "ANTHROPIC_BASE_URL": "https://your-worker.your-subdomain.workers.dev"
  }
}
```

### OpenAI Compatible

```bash
export OPENAI_API_KEY="your-minimax-api-key"
export OPENAI_BASE_URL="https://your-worker.your-subdomain.workers.dev/v1"
```

## Test

```bash
curl -X POST "https://your-worker.your-subdomain.workers.dev/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "model": "MiniMax-M2.7",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```
