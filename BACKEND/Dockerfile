# Dockerfile

FROM node:20-alpine

WORKDIR /app

# 1) Dépendances
COPY package*.json ./
RUN npm ci

# 2) Code source
COPY prisma ./prisma
COPY src ./src
COPY types ./types
COPY tsconfig*.json ./

# 3) Prisma + build
RUN npx prisma generate
RUN npm run build

# 4) Entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# ✅ Le port DOIT correspondre à process.env.PORT (Render impose 10000)
ENV NODE_ENV=production
EXPOSE 10000

ENTRYPOINT ["entrypoint.sh"]