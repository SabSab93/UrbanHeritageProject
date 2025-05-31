// src/prisma/seedAdmin.ts

import { PrismaClient, provider_enum } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Charge .env ou .env.prod selon NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? '.env.prod'
    : '.env'
});

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

  // Récupère le mot de passe depuis l'env
  const rawPassword = process.env.ADMIN_PASSWORD;
  if (!rawPassword) {
    console.error('❌  ADMIN_PASSWORD non défini dans .env.prod');
    process.exit(1);
  }

  const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
  const hashed = await bcrypt.hash(rawPassword, saltRounds);

  await prisma.client.upsert({
    where: { adresse_mail_client: 'urbanheritage.project.mds@gmail.com' },
    update: {
      mot_de_passe:  hashed,
      provider:      provider_enum.local,
      statut_compte: 'actif',
      id_role:       adminRole.id_role,
    },
    create: {
      nom_client:           'Hammadi',
      prenom_client:        'Sabrina',
      civilite:             'femme',
      date_naissance_client: new Date('1980-01-01'),
      adresse_client:       '99 rue des Admins',
      code_postal_client:   '75001',
      ville_client:         'Paris',
      pays_client:          'France',
      adresse_mail_client:  'urbanheritage.project.mds@gmail.com',
      mot_de_passe:         hashed,
      provider:             provider_enum.local,
      statut_compte:        'actif',
      id_role:              adminRole.id_role,
    },
  });

  console.log('✅  Admin seedé avec succès');
  await prisma.$disconnect();
}
