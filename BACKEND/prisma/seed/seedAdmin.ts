// src/prisma/seedAdmin.ts (ou là où tu as mis ton seed)
import { PrismaClient, provider_enum } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdmin() {
  console.log('Seeding admin…');

  const adminRole = await prisma.role.findFirst({
    where: { nom_role: 'admin' },
  });
  if (!adminRole) {
    console.error('❌  Rôle "admin" introuvable — lance d’abord seedRoles()');
    return;
  }

  const hashed = await bcrypt.hash('kiwi', 10);

  await prisma.client.upsert({
    where: { adresse_mail_client: 'urbanheritage.project.mds@gmail.com' },
    update: {
      // Si l’admin existe, mets à jour aussi le mdp + statut + provider
      mot_de_passe: hashed,
      provider: provider_enum.local,
      statut_compte: 'actif',
      id_role: adminRole.id_role,
    },
    create: {
      nom_client: 'Hammadi',
      prenom_client: 'Sabrina',
      civilite: 'femme',
      date_naissance_client: new Date('1980-01-01'),
      adresse_client: '99 rue des Admins',
      code_postal_client: '75001',
      ville_client: 'Paris',
      pays_client: 'France',
      adresse_mail_client: 'urbanheritage.project.mds@gmail.com',
      mot_de_passe: hashed,
      provider: provider_enum.local,
      statut_compte: 'actif',
      id_role: adminRole.id_role,
    },
  });

  console.log('✅  Admin seedé avec succès');
  await prisma.$disconnect();
}
