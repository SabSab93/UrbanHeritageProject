/*
  Warnings:

  - You are about to drop the column `id_typelivraison` on the `Livraison` table. All the data in the column will be lost.
  - You are about to drop the `TypeLivraison` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_lieu_livraison` to the `Livraison` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_livreur` to the `Livraison` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_methode_livraison` to the `Livraison` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Livraison" DROP CONSTRAINT "Livraison_id_typelivraison_fkey";

-- AlterTable
ALTER TABLE "Livraison" DROP COLUMN "id_typelivraison",
ADD COLUMN     "id_lieu_livraison" INTEGER NOT NULL,
ADD COLUMN     "id_livreur" INTEGER NOT NULL,
ADD COLUMN     "id_methode_livraison" INTEGER NOT NULL;

-- DropTable
DROP TABLE "TypeLivraison";

-- DropEnum
DROP TYPE "choix_livraison_enum";

-- DropEnum
DROP TYPE "choix_livreur_enum";

-- DropEnum
DROP TYPE "methode_livraison_enum";

-- CreateTable
CREATE TABLE "MethodeLivraison" (
    "id_methode_livraison" SERIAL NOT NULL,
    "nom_methode" VARCHAR(50) NOT NULL,
    "prix_methode" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MethodeLivraison_pkey" PRIMARY KEY ("id_methode_livraison")
);

-- CreateTable
CREATE TABLE "LieuLivraison" (
    "id_lieu_livraison" SERIAL NOT NULL,
    "nom_lieu" VARCHAR(50) NOT NULL,
    "prix_lieu" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LieuLivraison_pkey" PRIMARY KEY ("id_lieu_livraison")
);

-- CreateTable
CREATE TABLE "Livreur" (
    "id_livreur" SERIAL NOT NULL,
    "nom_livreur" VARCHAR(50) NOT NULL,

    CONSTRAINT "Livreur_pkey" PRIMARY KEY ("id_livreur")
);

-- CreateIndex
CREATE UNIQUE INDEX "MethodeLivraison_nom_methode_key" ON "MethodeLivraison"("nom_methode");

-- CreateIndex
CREATE UNIQUE INDEX "LieuLivraison_nom_lieu_key" ON "LieuLivraison"("nom_lieu");

-- CreateIndex
CREATE UNIQUE INDEX "Livreur_nom_livreur_key" ON "Livreur"("nom_livreur");

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_id_methode_livraison_fkey" FOREIGN KEY ("id_methode_livraison") REFERENCES "MethodeLivraison"("id_methode_livraison") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_id_lieu_livraison_fkey" FOREIGN KEY ("id_lieu_livraison") REFERENCES "LieuLivraison"("id_lieu_livraison") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_id_livreur_fkey" FOREIGN KEY ("id_livreur") REFERENCES "Livreur"("id_livreur") ON DELETE RESTRICT ON UPDATE CASCADE;
