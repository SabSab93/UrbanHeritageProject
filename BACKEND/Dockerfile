FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install               

COPY prisma ./prisma
RUN npx prisma generate      

COPY . .
RUN npm run build           

ENV NODE_ENV=production \
    PORT=10000              
EXPOSE 10000

CMD ["sh", "-c", "npm run migrate:deploy:prod && exec npm start"]



