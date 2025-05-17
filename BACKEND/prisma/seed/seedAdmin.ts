import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdmin() {
  console.log('Seeding admin…');

  // 1. Récupère l'id du rôle "admin" (créé dans seedRoles)
  const adminRole = await prisma.role.findFirst({
    where: { nom_role: 'admin' },
  });

  if (!adminRole) {
    console.error('❌  Rôle "admin" introuvable — lance d’abord seedRoles()');
    return;
  }

  // 2. Hash du mot de passe
  const hashed = await bcrypt.hash('kiwi', 10); // SALT_ROUNDS = 10

  // 3. Création (ou ignore si déjà présent)
  await prisma.client.upsert({
    where: { adresse_mail_client: 'urbanheritage.project.mds@gmail.com' },
    update: {},            // rien à mettre si déjà présent
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
      id_role: adminRole.id_role,
    },
  });
}
