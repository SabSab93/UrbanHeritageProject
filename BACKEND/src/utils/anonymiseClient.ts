// utils/anonymiseClient.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * Anonymise un client et supprime les lignes de panier encore « en cours ».
 * @param idClient  ID du client à anonymiser
 */
export const anonymiseClient = async (idClient: number) => {
  const placeholder = `deleted_user_${idClient}`;
  const fakeHash    = await bcrypt.hash(crypto.randomUUID(), 10);   // mot-de-passe fantôme

  // 1) anonymisation de la fiche client
  const client = await prisma.client.update({
    where: { id_client: idClient },
    data : {
      deleted_at           : new Date(),
      is_anonymised        : true,
      nom_client           : placeholder,
      prenom_client        : null,
      civilite             : "non_specifie",
      date_naissance_client: null,
      adresse_client       : "",
      code_postal_client   : "",
      ville_client         : "",
      pays_client          : "",
      adresse_mail_client  : `${placeholder}@anon.local`,
      mot_de_passe         : fakeHash,
      activation_token     : null,
      statut_compte        : "bloque"
    },
  });

  // 2) purge éventuelle des lignes de panier non finalisées
  await prisma.ligneCommande.deleteMany({
    where: { id_client: idClient, id_commande: null }
  });

  return client;
};
