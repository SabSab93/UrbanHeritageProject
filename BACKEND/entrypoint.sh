#!/usr/bin/env sh
set -e

echo "▶️  Appliquer les migrations…"
npm run migrate:deploy:prod  
   

echo "▶️  Démarrage de l’API…"
exec npm run start