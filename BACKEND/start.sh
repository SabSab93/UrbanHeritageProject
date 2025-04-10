#!/bin/sh

echo "📦 Prisma generate"
npx prisma generate

echo "⚙️ Prisma migrate deploy"
npx prisma migrate deploy

echo "🚀 Starting backend"
npm run dev
