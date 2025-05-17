#!/usr/bin/env sh
set -e

echo "▶️  Appliquer les migrations…"
npx prisma migrate deploy

echo "▶️  Lancer les seeds (idempotent)…"
npx prisma db seed

echo "▶️  Démarrage de l’API…"
exec node dist/index.js
