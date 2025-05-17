#!/usr/bin/env sh
set -e

echo "▶️  Appliquer les migrations…"
npm run migrate:deploy     

echo "▶️  Lancer les seeds (idempotent)…"
npm run seed:prod       

echo "▶️  Démarrage de l’API…"
exec npm run start