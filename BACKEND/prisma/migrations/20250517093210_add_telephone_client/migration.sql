/*
  Warnings:

  - The values [color] on the enum `type_personnalisation_enum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `LigneCommandePersonnalisation` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "couleur_personnalisation_enum" AS ENUM ('ROUGE', 'VERT', 'NOIR', 'BLANC');

-- AlterEnum
BEGIN;
CREATE TYPE "type_personnalisation_enum_new" AS ENUM ('name', 'name_color');
ALTER TABLE "Personnalisation" ALTER COLUMN "type_personnalisation" TYPE "type_personnalisation_enum_new" USING ("type_personnalisation"::text::"type_personnalisation_enum_new");
ALTER TYPE "type_personnalisation_enum" RENAME TO "type_personnalisation_enum_old";
ALTER TYPE "type_personnalisation_enum_new" RENAME TO "type_personnalisation_enum";
DROP TYPE "type_personnalisation_enum_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "LigneCommandePersonnalisation" DROP CONSTRAINT "LigneCommandePersonnalisation_id_lignecommande_fkey";

-- DropForeignKey
ALTER TABLE "LigneCommandePersonnalisation" DROP CONSTRAINT "LigneCommandePersonnalisation_id_personnalisation_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "telephone_client" VARCHAR(20);

-- AlterTable
ALTER TABLE "LigneCommande" ADD COLUMN     "couleur_personnalisation" VARCHAR(10),
ADD COLUMN     "id_personnalisation" INTEGER,
ADD COLUMN     "ligne_commande_personnalisee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "valeur_personnalisation" VARCHAR(20);

-- DropTable
DROP TABLE "LigneCommandePersonnalisation";

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_personnalisation_fkey" FOREIGN KEY ("id_personnalisation") REFERENCES "Personnalisation"("id_personnalisation") ON DELETE CASCADE ON UPDATE CASCADE;
