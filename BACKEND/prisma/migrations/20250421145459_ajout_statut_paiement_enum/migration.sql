-- CreateEnum
CREATE TYPE "statut_paiement_enum" AS ENUM ('en_attente', 'paye', 'echec');

-- AlterTable
ALTER TABLE "Commande" ADD COLUMN     "statut_paiement" "statut_paiement_enum" NOT NULL DEFAULT 'en_attente';
