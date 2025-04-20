/*
  Warnings:

  - You are about to drop the `ApplicationReduction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Panier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PanierLigne` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApplicationReduction" DROP CONSTRAINT "ApplicationReduction_id_reduction_fkey";

-- DropForeignKey
ALTER TABLE "Panier" DROP CONSTRAINT "Panier_id_client_fkey";

-- DropForeignKey
ALTER TABLE "PanierLigne" DROP CONSTRAINT "PanierLigne_id_maillot_fkey";

-- DropForeignKey
ALTER TABLE "PanierLigne" DROP CONSTRAINT "PanierLigne_id_panier_fkey";

-- DropTable
DROP TABLE "ApplicationReduction";

-- DropTable
DROP TABLE "Panier";

-- DropTable
DROP TABLE "PanierLigne";

-- DropTable
DROP TABLE "test";

-- DropEnum
DROP TYPE "statut_panier_enum";

-- CreateTable
CREATE TABLE "LigneCommandeReduction" (
    "id_lignecommande" INTEGER NOT NULL,
    "id_reduction" INTEGER NOT NULL,

    CONSTRAINT "LigneCommandeReduction_pkey" PRIMARY KEY ("id_lignecommande","id_reduction")
);

-- AddForeignKey
ALTER TABLE "LigneCommandeReduction" ADD CONSTRAINT "LigneCommandeReduction_id_reduction_fkey" FOREIGN KEY ("id_reduction") REFERENCES "Reduction"("id_reduction") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommandeReduction" ADD CONSTRAINT "LigneCommandeReduction_id_lignecommande_fkey" FOREIGN KEY ("id_lignecommande") REFERENCES "LigneCommande"("id_lignecommande") ON DELETE CASCADE ON UPDATE CASCADE;
