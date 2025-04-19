/*
  Warnings:

  - Added the required column `id_client` to the `LigneCommande` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LigneCommande" DROP CONSTRAINT "LigneCommande_id_commande_fkey";

-- DropForeignKey
ALTER TABLE "LigneCommande" DROP CONSTRAINT "LigneCommande_id_maillot_fkey";

-- AlterTable
ALTER TABLE "LigneCommande" ADD COLUMN     "id_client" INTEGER NOT NULL,
ALTER COLUMN "id_commande" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Maillot" ALTER COLUMN "id_tva" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_maillot_fkey" FOREIGN KEY ("id_maillot") REFERENCES "Maillot"("id_maillot") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "Commande"("id_commande") ON DELETE CASCADE ON UPDATE CASCADE;
