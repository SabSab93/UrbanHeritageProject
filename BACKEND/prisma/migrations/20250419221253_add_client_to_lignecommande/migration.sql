-- CreateEnum
CREATE TYPE "role_enum" AS ENUM ('client', 'admin', 'systeme');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "role" "role_enum" NOT NULL DEFAULT 'client';

-- AlterTable
ALTER TABLE "Commande" ALTER COLUMN "statut_commande" SET DEFAULT 'en_cours';
