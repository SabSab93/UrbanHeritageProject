#!/bin/sh

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
sleep 5

# Générer le client Prisma dans le container
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Exécuter les migrations (optionnel si tu veux)
# npx prisma migrate deploy

# Lancer le serveur Node (à adapter selon ton projet)
echo "🚀 Lancement de l'application..."
npm run start
