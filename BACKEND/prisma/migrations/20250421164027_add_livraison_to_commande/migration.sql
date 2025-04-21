-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "Commande"("id_commande") ON DELETE RESTRICT ON UPDATE CASCADE;
