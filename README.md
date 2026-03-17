# Atria AI

Plataforma de Inteligência Artificial para o profissional brasileiro.

## Estrutura

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Landing page + modal de login/cadastro |
| `chat.html` | Interface do chat |
| `admin.html` | Painel administrativo |
| `redefinir_senha.html` | Página de redefinição de senha |
| `sw.js` | Service Worker (PWA) |
| `worker.js` | Backend Cloudflare Workers |
| `wrangler.toml` | Config do Workers |

## Deploy

### Frontend (Cloudflare Pages)
Conecte este repositório no Cloudflare Pages.
- Build command: (deixe vazio)
- Output directory: `/` (raiz)
- Arquivos de frontend: index.html, chat.html, admin.html, redefinir_senha.html, sw.js

### Backend (Cloudflare Workers)
```bash
npx wrangler deploy worker.js
```

## Variáveis de Ambiente (Workers)

Configure em Workers → atria-ai-backend → Settings → Environment Variables:

| Variável | Descrição |
|----------|-----------|
| `ANTHROPIC_API_KEY` | Chave da API Anthropic |
| `MP_ACCESS_TOKEN` | Token do Mercado Pago |
| `KIWIFY_WEBHOOK_TOKEN` | Token webhook Kiwify |
| `RESEND_API_KEY` | Chave da API Resend (emails) |
| `MP_WEBHOOK_SECRET` | Secret HMAC do webhook MP (opcional) |
