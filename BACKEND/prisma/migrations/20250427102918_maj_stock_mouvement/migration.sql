/*
  Warnings:

  - You are about to drop the column `quantite_entree` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `quantite_sortie` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `quantite_total` on the `Stock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "quantite_entree",
DROP COLUMN "quantite_sortie",
DROP COLUMN "quantite_total";
