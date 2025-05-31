import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const seedAssociations = async () => {
  console.log("Seeding associations…");
  await prisma.association.deleteMany();
  await prisma.association.createMany({
    data: [
      {
        id_association: 1,
        nom_association: "Planète Amazone",
        numero_identification_association: "W922005246",
        adresse_siege_social_association: "38, rue Baudin, 92400 Courbevoie",
        pays_association: "Bresil",
        site_web_association: "https://planeteamazone.org/",
        url_image_association_1: "https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620951/association_bresil_1_dvne6o.jpg",
        url_image_association_2: "https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620950/association_bresil_2_sbps8g.png",
        url_image_association_3: "https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620952/association_bresil_3_swo7rz.jpg",
        description_association_1: "Fondée en France, Planète Amazone agit en soutien aux peuples indigènes, notamment au Brésil, pour protéger l’Amazonie et défendre les droits humains et fonciers des communautés ancestrales.",
        description_association_2: "L'association collabore avec des figures emblématiques comme le cacique Raoni. Elle promeut la reconnaissance du crime d’écocide et soutient les actions locales de protection de l’environnement.",
        description_association_3: "Par ses campagnes de sensibilisation, ses projections de documentaires et ses conférences, Planète Amazone crée des ponts entre les peuples autochtones, les citoyens du monde et les décideurs.",
      },
      {
        id_association: 2,
        nom_association: "Fondazione Giulia Cecchettin",
        numero_identification_association: "IT45731",
        adresse_siege_social_association: "Vigonovo, Vénétie (Italie)",
        pays_association: "Italie",
        site_web_association: "https://fondazionegiulia.org/",
        url_image_association_1: "https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748622303/association_italie_1_osmuia.png",
        url_image_association_2: "https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748622302/association_italie_3_pqdraj.jpg",
        url_image_association_3: "https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748622301/association_italie_2_pgtev1.webp",
        description_association_1: "Créée après le féminicide de Giulia Cecchettin en 2023, cette fondation italienne lutte contre les violences sexistes et œuvre pour une société plus respectueuse, plus égalitaire et plus consciente.",
        description_association_2: "La fondation agit dans les écoles, auprès des familles et à travers des campagnes publiques pour changer les mentalités sur le sexisme. Elle transforme un drame personnel en cause collective.",
        description_association_3: "La fondation défend une éducation fondée sur le respect, l’écoute et l’affectif. Elle fait de la mémoire de Giulia un moteur de mobilisation pour la jeunesse et les générations futures.",
      },
      {
        id_association: 3,
        nom_association: "Association France Palestine Solidarité (AFPS) ",
        numero_identification_association: "429746332",
        adresse_siege_social_association: "21 ter Rue Voltaire 75011 Paris",
        pays_association: "Palestine",
        site_web_association: "www.france-palestine.org",
        url_image_association_1: "https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748622326/association_palestine_1_o0gwxs.jpg",
        url_image_association_2: "https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748622327/association_palestine_2_xg51mx.png",
        url_image_association_3: "https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748622329/association_palestine_3_yypqja.jpg",
        description_association_1: "L’AFPS agit depuis plus de 20 ans pour défendre les droits du peuple palestinien. Présente sur le terrain, elle mène des actions concrètes de soutien médical, éducatif et social.",
        description_association_2: "L’AFPS milite pour le respect du droit international et dénonce les violations des droits humains. Elle relaie les voix palestiniennes en France à travers conférences, jumelages et témoignages.",
        description_association_3: "Plus qu’une ONG, l’AFPS est un réseau de solidarité humaine. Elle incarne la résistance pacifique et la transmission des valeurs de justice, de dignité et de coexistence.",
      },
    ],
    skipDuplicates: true,
  });
};
