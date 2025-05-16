# Dockerfile
FROM node:20-alpine


WORKDIR /app


COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 1992  

# 5. Démarrer le serveur en mode dev
CMD ["npm", "run", "dev"]
