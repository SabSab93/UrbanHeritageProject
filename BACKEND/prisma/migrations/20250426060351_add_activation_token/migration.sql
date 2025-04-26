-- CreateEnum
CREATE TYPE "statut_compte_enum" AS ENUM ('en_attente', 'actif', 'bloque');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "activation_token" TEXT,
ADD COLUMN     "statut_compte" "statut_compte_enum" NOT NULL DEFAULT 'en_attente';
