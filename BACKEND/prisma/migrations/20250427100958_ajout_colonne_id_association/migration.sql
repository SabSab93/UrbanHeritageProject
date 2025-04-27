/*
  Warnings:

  - The primary key for the `Association` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_maillot_association` on the `Association` table. All the data in the column will be lost.
  - Added the required column `id_association` to the `Maillot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Association" DROP CONSTRAINT "Association_id_maillot_association_fkey";

-- AlterTable
ALTER TABLE "Association" DROP CONSTRAINT "Association_pkey",
DROP COLUMN "id_maillot_association",
ADD COLUMN     "id_association" SERIAL NOT NULL,
ADD CONSTRAINT "Association_pkey" PRIMARY KEY ("id_association");

-- AlterTable
ALTER TABLE "Maillot" ADD COLUMN     "id_association" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "Commande"("id_commande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maillot" ADD CONSTRAINT "Maillot_id_association_fkey" FOREIGN KEY ("id_association") REFERENCES "Association"("id_association") ON DELETE RESTRICT ON UPDATE CASCADE;
