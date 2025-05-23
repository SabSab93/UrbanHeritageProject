import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 h
  const abandons = await prisma.commande.findMany({
    where: {
      statut_paiement: 'en_attente',
      date_commande: { lt: cutoff }
    },
    include: { LigneCommande: true }
  });

  for (const cmd of abandons) {
    /* Remettre les lignes dans le panier */
    await prisma.ligneCommande.updateMany({
      where: { id_commande: cmd.id_commande },
      data:  { id_commande: null }
    });
    /* Supprimer la commande fantôme */
    await prisma.commande.delete({ where: { id_commande: cmd.id_commande } });
    console.log(`🗑️  Commande ${cmd.id_commande} supprimée (en_attente > 24h)`);
  }
  await prisma.$disconnect();
})();