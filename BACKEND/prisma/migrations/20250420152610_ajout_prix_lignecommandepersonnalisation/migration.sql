/*
  Warnings:

  - Added the required column `prix_personnalisation_ht` to the `LigneCommandePersonnalisation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LigneCommandePersonnalisation" ADD COLUMN     "prix_personnalisation_ht" DECIMAL(10,2) NOT NULL;
