/*
  Warnings:

  - The values [XS] on the enum `taille_maillot_enum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "taille_maillot_enum_new" AS ENUM ('S', 'M', 'L', 'XL');
ALTER TABLE "LigneCommande" ALTER COLUMN "taille_maillot" TYPE "taille_maillot_enum_new" USING ("taille_maillot"::text::"taille_maillot_enum_new");
ALTER TABLE "Stock" ALTER COLUMN "taille_maillot" TYPE "taille_maillot_enum_new" USING ("taille_maillot"::text::"taille_maillot_enum_new");
ALTER TYPE "taille_maillot_enum" RENAME TO "taille_maillot_enum_old";
ALTER TYPE "taille_maillot_enum_new" RENAME TO "taille_maillot_enum";
DROP TYPE "taille_maillot_enum_old";
COMMIT;
