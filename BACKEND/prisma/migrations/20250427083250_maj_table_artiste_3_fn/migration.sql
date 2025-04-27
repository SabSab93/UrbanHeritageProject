/*
  Warnings:

  - The primary key for the `Artiste` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_maillot_artiste` on the `Artiste` table. All the data in the column will be lost.
  - Added the required column `id_artiste` to the `Maillot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Artiste" DROP CONSTRAINT "Artiste_id_maillot_artiste_fkey";

-- AlterTable
ALTER TABLE "Artiste" DROP CONSTRAINT "Artiste_pkey",
DROP COLUMN "id_maillot_artiste",
ADD COLUMN     "id_artiste" SERIAL NOT NULL,
ADD CONSTRAINT "Artiste_pkey" PRIMARY KEY ("id_artiste");

-- AlterTable
ALTER TABLE "Maillot" ADD COLUMN     "id_artiste" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Maillot" ADD CONSTRAINT "Maillot_id_artiste_fkey" FOREIGN KEY ("id_artiste") REFERENCES "Artiste"("id_artiste") ON DELETE RESTRICT ON UPDATE CASCADE;
