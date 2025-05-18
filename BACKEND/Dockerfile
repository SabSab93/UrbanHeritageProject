###################  Étape DEV (hot-reload)  ###################
FROM node:20-alpine AS dev
WORKDIR /app
FROM node:20-alpine

WORKDIR /app

# 1) on copie et installe uniquement les dépendances
COPY package*.json ./
RUN npm ci

# 2) on ajoute tout le code source + Prisma
COPY prisma ./prisma
COPY src    ./src
COPY types  ./types
COPY tsconfig*.json ./  

# 3) on génère le client Prisma + on compile TS → dist/
RUN npx prisma generate
RUN npm run build

# 4) copier l’entrypoint et lui donner les droits
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV NODE_ENV=production
EXPOSE 1992

# 5) on démarre via notre script
ENTRYPOINT ["entrypoint.sh"]
