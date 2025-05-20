-- AlterTable
ALTER TABLE "Livraison" ADD COLUMN     "id_adresse_client" INTEGER;

-- CreateIndex
CREATE INDEX "Livraison_id_adresse_client_idx" ON "Livraison"("id_adresse_client");

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_id_adresse_client_fkey" FOREIGN KEY ("id_adresse_client") REFERENCES "Client"("id_client") ON DELETE SET NULL ON UPDATE CASCADE;
