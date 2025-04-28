/*
  Warnings:

  - You are about to drop the `LigneCommandeReduction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LigneCommandeReduction" DROP CONSTRAINT "LigneCommandeReduction_id_lignecommande_fkey";

-- DropForeignKey
ALTER TABLE "LigneCommandeReduction" DROP CONSTRAINT "LigneCommandeReduction_id_reduction_fkey";

-- DropTable
DROP TABLE "LigneCommandeReduction";

-- CreateTable
CREATE TABLE "CommandeReduction" (
    "id_commande" INTEGER NOT NULL,
    "id_reduction" INTEGER NOT NULL,

    CONSTRAINT "CommandeReduction_pkey" PRIMARY KEY ("id_commande","id_reduction")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommandeReduction_id_commande_key" ON "CommandeReduction"("id_commande");

-- AddForeignKey
ALTER TABLE "CommandeReduction" ADD CONSTRAINT "CommandeReduction_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "Commande"("id_commande") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandeReduction" ADD CONSTRAINT "CommandeReduction_id_reduction_fkey" FOREIGN KEY ("id_reduction") REFERENCES "Reduction"("id_reduction") ON DELETE CASCADE ON UPDATE CASCADE;
