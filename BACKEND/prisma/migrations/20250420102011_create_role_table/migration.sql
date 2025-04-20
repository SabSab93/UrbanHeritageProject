/*
  Warnings:

  - You are about to drop the column `role` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "role";

-- DropEnum
DROP TYPE "role_enum";

-- CreateTable
CREATE TABLE "Role" (
    "id_role" SERIAL NOT NULL,
    "nom_role" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "_ClientToRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClientToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_nom_role_key" ON "Role"("nom_role");

-- CreateIndex
CREATE INDEX "_ClientToRole_B_index" ON "_ClientToRole"("B");

-- AddForeignKey
ALTER TABLE "_ClientToRole" ADD CONSTRAINT "_ClientToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Client"("id_client") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToRole" ADD CONSTRAINT "_ClientToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id_role") ON DELETE CASCADE ON UPDATE CASCADE;
