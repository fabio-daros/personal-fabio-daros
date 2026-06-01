# CV / Resume PDFs

## Opção A — Google Drive (pasta compartilhada)

Pasta padrão: [Drive folder](https://drive.google.com/drive/folders/1bJCtxUvKqcBN3RusNny1vc9pUe7iTW3e)

1. Coloque os PDFs na pasta com estes nomes (exatamente como no Drive, ou ajuste em `.env.local`):
   - `CV Fabio Daros.pdf` (português)
   - `Resume_Fabio_Daros.pdf` (inglês) — ou defina `GOOGLE_DRIVE_FILE_ID_EN` (padrão: [link direto](https://drive.google.com/file/d/1Xpnldj1iiPXvPUueS6VPYemPXagUHEfJ/view))
2. Compartilhe a pasta e os arquivos: **Qualquer pessoa com o link** → Leitor.
3. Em [Google Cloud Console](https://console.cloud.google.com/), crie uma **API Key** e ative a **Google Drive API**.
4. Copie `.env.example` → `.env.local` e preencha `GOOGLE_DRIVE_API_KEY`.

Para trocar o CV: substitua o PDF no Drive (mesmo nome) ou altere `CV_DRIVE_FILENAME_PT` / `CV_DRIVE_FILENAME_EN` no `.env.local`.

O site busca o arquivo pelo nome via `/api/cv?locale=pt|en` (cache ~5 min).

## Opção B — Arquivos locais (fallback)

Se a API do Drive não estiver configurada, use:

| Arquivo | Idioma |
|---------|--------|
| `fabio-daros-cv-pt.pdf` | Português |
| `fabio-daros-cv-en.pdf` | Inglês |

## Opção C — URL fixa por idioma

```env
NEXT_PUBLIC_CV_URL_PT=https://drive.google.com/uc?export=download&id=FILE_ID
NEXT_PUBLIC_CV_URL_EN=https://drive.google.com/uc?export=download&id=FILE_ID
```

Usado só se a busca na pasta falhar ou não houver API key.
