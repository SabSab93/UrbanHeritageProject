#!/usr/bin/env sh
set -e

echo "▶️  Appliquer les migrations…"
npm run migrate:deploy     
   

echo "▶️  Démarrage de l’API…"
exec npm run start