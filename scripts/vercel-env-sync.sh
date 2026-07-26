#!/usr/bin/env bash
# Syncs resume/contact env vars from .env.local to Vercel (production, preview, development).
# Prerequisites: npm i -g vercel && vercel login && vercel link (in project root)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -x "$ROOT/node_modules/.bin/vercel" ]]; then
  VERCEL=("$ROOT/node_modules/.bin/vercel")
elif command -v vercel >/dev/null 2>&1; then
  VERCEL=(vercel)
elif command -v npx >/dev/null 2>&1; then
  VERCEL=(npx vercel)
else
  echo "Vercel CLI not found. Install: npm i -g vercel"
  exit 1
fi

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local in $ROOT"
  exit 1
fi

# shellcheck disable=SC2016
get_env() {
  local name="$1"
  local line
  line="$(grep -E "^${name}=" .env.local | tail -n 1 || true)"
  if [[ -z "$line" ]]; then
    echo ""
    return
  fi
  echo "${line#*=}"
}

VARS=(
  RESEND_API_KEY
  RESEND_FROM
  CONTACT_EMAIL_OVERRIDE
  CONTACT_CAPTCHA_SECRET
  NEXT_PUBLIC_TURNSTILE_SITE_KEY
  TURNSTILE_SECRET_KEY
  GOOGLE_DRIVE_API_KEY
  GOOGLE_DRIVE_CV_FOLDER_ID
  CV_DRIVE_FILENAME_PT
  CV_DRIVE_FILENAME_EN
  GOOGLE_DRIVE_FILE_ID_PT
  GOOGLE_DRIVE_FILE_ID_EN
)

ENVIRONMENTS=(production preview development)

upsert_env() {
  local name="$1"
  local value="$2"
  local target="$3"

  if [[ -z "$value" ]]; then
    echo "  skip $name ($target): empty in .env.local"
    return
  fi

  if "${VERCEL[@]}" env ls "$target" 2>/dev/null | grep -q "^[[:space:]]*${name}[[:space:]]"; then
    echo "  update $name → $target"
  else
    echo "  add $name → $target"
  fi

  "${VERCEL[@]}" env add "$name" "$target" --value "$value" --yes --force 2>&1 | grep -E '^(Overrode|Added|Saving)' || true
}

echo "Project: $ROOT"
echo "Link check: run 'vercel link' here if this fails."
echo ""

for name in "${VARS[@]}"; do
  value="$(get_env "$name")"
  if [[ -z "$value" ]]; then
    echo "Skip $name (not set in .env.local)"
    continue
  fi
  echo "$name"
  for target in "${ENVIRONMENTS[@]}"; do
    upsert_env "$name" "$value" "$target"
  done
  echo ""
done

echo "Done. Redeploy on Vercel for changes to apply (or push to trigger deploy)."
