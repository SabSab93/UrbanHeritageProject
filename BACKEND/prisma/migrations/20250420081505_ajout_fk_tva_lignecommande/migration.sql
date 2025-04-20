/*
  Warnings:

  - You are about to alter the column `prix_ht` on the `LigneCommande` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(10,2)`.

*/
-- DropForeignKey
ALTER TABLE "Maillot" DROP CONSTRAINT "Maillot_id_tva_fkey";

-- AlterTable
ALTER TABLE "LigneCommande" ADD COLUMN     "id_tva" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "prix_ht" SET DATA TYPE DECIMAL(10,2);

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_tva_fkey" FOREIGN KEY ("id_tva") REFERENCES "TVA"("id_tva") ON DELETE RESTRICT ON UPDATE CASCADE;
