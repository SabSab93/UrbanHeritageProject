/*
  Warnings:

  - You are about to drop the `_ClientToRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClientToRole" DROP CONSTRAINT "_ClientToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClientToRole" DROP CONSTRAINT "_ClientToRole_B_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "id_role" INTEGER;

-- DropTable
DROP TABLE "_ClientToRole";

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "Role"("id_role") ON DELETE SET NULL ON UPDATE CASCADE;
