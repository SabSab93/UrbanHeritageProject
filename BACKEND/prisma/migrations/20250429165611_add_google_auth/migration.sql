/*
  Warnings:

  - A unique constraint covering the columns `[google_sub]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "provider_enum" AS ENUM ('local', 'google');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "google_sub" TEXT,
ADD COLUMN     "provider" "provider_enum" NOT NULL DEFAULT 'local',
ALTER COLUMN "mot_de_passe" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_google_sub_key" ON "Client"("google_sub");
