# Étape 1 : Utiliser une image Node.js officielle
FROM node:18-alpine

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Étape 3 : Copier les fichiers nécessaires pour l'installation
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install
RUN npm install prisma --save-dev

# Étape 5 : Copier le reste du code source
COPY . .

# Étape 6 : Donner les droits d’exécution au script de démarrage
RUN chmod +x ./start.sh

# Étape 7 : Exposer le port sur lequel ton backend écoute
EXPOSE 4000

# Étape 8 : Lancer le script de démarrage
CMD ["sh", "start.sh"]
