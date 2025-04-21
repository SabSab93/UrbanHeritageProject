/*
  Warnings:

  - You are about to alter the column `prix_ht` on the `Personnalisation` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(10,2)`.
  - You are about to drop the `MaillotPersonnalisation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MaillotPersonnalisation" DROP CONSTRAINT "MaillotPersonnalisation_id_maillot_fkey";

-- DropForeignKey
ALTER TABLE "MaillotPersonnalisation" DROP CONSTRAINT "MaillotPersonnalisation_id_personnalisation_fkey";

-- AlterTable
ALTER TABLE "Personnalisation" ALTER COLUMN "prix_ht" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "description" SET DEFAULT '';

-- DropTable
DROP TABLE "MaillotPersonnalisation";

-- CreateTable
CREATE TABLE "LigneCommandePersonnalisation" (
    "id_lignecommande" INTEGER NOT NULL,
    "id_personnalisation" INTEGER NOT NULL,

    CONSTRAINT "LigneCommandePersonnalisation_pkey" PRIMARY KEY ("id_lignecommande","id_personnalisation")
);

-- AddForeignKey
ALTER TABLE "LigneCommandePersonnalisation" ADD CONSTRAINT "LigneCommandePersonnalisation_id_lignecommande_fkey" FOREIGN KEY ("id_lignecommande") REFERENCES "LigneCommande"("id_lignecommande") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneCommandePersonnalisation" ADD CONSTRAINT "LigneCommandePersonnalisation_id_personnalisation_fkey" FOREIGN KEY ("id_personnalisation") REFERENCES "Personnalisation"("id_personnalisation") ON DELETE CASCADE ON UPDATE CASCADE;
