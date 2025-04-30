/*
  Warnings:

  - You are about to drop the column `quantite` on the `Maillot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Maillot" DROP COLUMN "quantite",
ADD COLUMN     "quantite_vendue" INTEGER NOT NULL DEFAULT 0;
