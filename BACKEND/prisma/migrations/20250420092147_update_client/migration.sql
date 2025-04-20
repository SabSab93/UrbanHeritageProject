/*
  Warnings:

  - The values [systeme] on the enum `role_enum` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `nom_client` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `adresse_client` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `code_postal_client` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ville_client` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pays_client` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mot_de_passe` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `adresse_mail_client` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "role_enum_new" AS ENUM ('client', 'admin');
ALTER TABLE "Client" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Client" ALTER COLUMN "role" TYPE "role_enum_new" USING ("role"::text::"role_enum_new");
ALTER TYPE "role_enum" RENAME TO "role_enum_old";
ALTER TYPE "role_enum_new" RENAME TO "role_enum";
DROP TYPE "role_enum_old";
ALTER TABLE "Client" ALTER COLUMN "role" SET DEFAULT 'client';
COMMIT;

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "nom_client" SET NOT NULL,
ALTER COLUMN "adresse_client" SET NOT NULL,
ALTER COLUMN "code_postal_client" SET NOT NULL,
ALTER COLUMN "ville_client" SET NOT NULL,
ALTER COLUMN "pays_client" SET NOT NULL,
ALTER COLUMN "mot_de_passe" SET NOT NULL,
ALTER COLUMN "adresse_mail_client" SET NOT NULL;
