# Variáveis de ambiente na Vercel

Configure **antes** do deploy para o download do currículo e o formulário de contato funcionarem em produção.

## Variáveis necessárias

| Variável | Sensível | Uso |
|----------|----------|-----|
| `RESEND_API_KEY` | Sim | Envio do formulário de contato |
| `RESEND_FROM` | Não | Remetente Resend (ex.: `Fabio Daros Site <noreply@fabiodaros.com>`) |
| `CONTACT_EMAIL_OVERRIDE` | Não | (Opcional) Redireciona todos os envios para este endereço (útil em testes) |
| `GOOGLE_DRIVE_API_KEY` | Sim | Backup: busca por pasta no Drive |
| `GOOGLE_DRIVE_CV_FOLDER_ID` | Não | ID da pasta do Drive |
| `CV_DRIVE_FILENAME_PT` | Não | Nome do PDF em PT |
| `CV_DRIVE_FILENAME_EN` | Não | Nome do PDF em EN |
| `GOOGLE_DRIVE_FILE_ID_PT` | Não | ID do arquivo PT (recomendado) |
| `GOOGLE_DRIVE_FILE_ID_EN` | Não | ID do arquivo EN (recomendado) |

Os IDs dos PDFs vêm do link `.../file/d/ID/view` no Google Drive.

Marque **Production**, **Preview** e **Development** para cada variável (ou use o script abaixo).

## Opção A — Painel Vercel (manual)

1. [vercel.com](https://vercel.com) → seu projeto → **Settings** → **Environment Variables**
2. Adicione cada variável com os mesmos valores do `.env.local`
3. **Redeploy** o último deployment (Deployments → ⋯ → Redeploy)

## Opção B — CLI (automático a partir do `.env.local`)

```bash
npm install   # inclui vercel como devDependency
vercel login
cd personal-fabio-daros
vercel link
npm run vercel:env
```

O script usa `vercel env add … --value … --yes --force` (CLI local em `node_modules`).

**Preview:** em ambientes não interativos (CI/agent), a CLI pode pedir branch do Git. Nesse caso, use o painel Vercel ou a REST API. Production e Development funcionam via CLI.

Depois faça push ou redeploy.

## Status atual (df-projects/personal-fabio-daros)

As 8 variáveis abaixo estão em **Production**, **Preview** e **Development**:

- `RESEND_API_KEY`, `CONTACT_EMAIL_OVERRIDE`
- `GOOGLE_DRIVE_API_KEY`, `GOOGLE_DRIVE_CV_FOLDER_ID`
- `CV_DRIVE_FILENAME_PT`, `CV_DRIVE_FILENAME_EN`
- `GOOGLE_DRIVE_FILE_ID_PT`, `GOOGLE_DRIVE_FILE_ID_EN`

Pode fazer deploy. Após o deploy, um **Redeploy** garante que o build pegue as variáveis novas (se o último deploy foi antes desta configuração).

## Testar em produção

Após o deploy:

- `https://SEU-DOMINIO/api/cv?locale=pt` → `"source": "drive"` e URL do Google
- Página **Currículo** → botão **Baixar currículo** ativo

## Produção (Vercel)

Não commite `.env.local`. No dashboard da Vercel, use os mesmos nomes de variável; valores sensíveis só no painel ou via CLI.
