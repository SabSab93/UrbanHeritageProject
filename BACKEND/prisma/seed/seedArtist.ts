// prisma/seed/seedArtistes.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedArtistes() {
  console.log('Seeding artistes…');
  await prisma.artiste.deleteMany(); 
  await prisma.artiste.createMany({
    data: [
      {
        id_artiste: 1,
        nom_artiste: 'Senna',
        prenom_artiste: 'Alex',
        pays_artiste: 'Bresil',
        date_naissance_artiste: '1982-07-01',
        site_web_artiste: 'https://www.alexsenna.com.br/',
        url_image_artiste_1: 'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748619957/00723a22-f463-4ad7-ae32-7f27ac6295a6_kjktld.jpg',
        url_image_artiste_2: 'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748619963/3da8edeb-339f-4c69-96be-87fe15376d39_mqmpit.jpg',
        url_image_artiste_3: 'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748619958/2ff90e1a-8705-4f59-8b31-a7509d17c7e2_xd3wjm.jpg',
        description_artiste_1: 'Alex Senna est un street artist brésilien connu pour ses illustrations en noir et blanc remplies de tendresse, souvent centrées sur les émotions, l’enfance, et les relations humaines au cœur des villes.',
        description_artiste_2: 'À travers des scènes minimalistes et expressives, Senna fait résonner la simplicité de l’enfance, l’amour et la nostalgie dans un contexte urbain souvent dur. Il humanise les murs et donne une âme aux paysages de béton.',
        description_artiste_3: 'Senna dessine des silhouettes universelles qui touchent le cœur. Dans ses œuvres, un simple oiseau sur le doigt d’un enfant devient un symbole puissant de liberté, d’innocence, et d’espoir face aux injustices sociales.',
        url_instagram_reseau_social: '@alexsenna',
        url_tiktok_reseau_social: '@alexsenna',
      },
      {
        id_artiste: 2,
        nom_artiste: ' Francesco Camillo',
        prenom_artiste: 'Giorgino alias Millo',
        pays_artiste: 'Italie',
        date_naissance_artiste: '1979-12-13',
        site_web_artiste: 'https://www.millo.biz/',
        url_image_artiste_1: 'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620015/5ddb9e11-0943-449a-a390-188717478b42_ctde89.jpg',
        url_image_artiste_2: 'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620013/c98553ff-fac5-40cd-89a3-77365fc3f0b1_hic2ak.jpg',
        url_image_artiste_3: 'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620017/ef437e84-0996-4de8-b334-684aa5cc5991_ls22te.jpg',
        description_artiste_1: 'Millo est un artiste muraliste italien reconnu pour ses fresques monochromes géantes mêlant tendresse, urbanité et engagement. Il s’approprie les espaces publics pour parler d’amour, de société et de lien humain.',
        description_artiste_2: 'À travers des dessins stylisés aux traits doux, Millo dépeint les vulnérabilités du monde moderne. Son art contraste par sa simplicité visuelle et la puissance des messages qu’il transmet.',
        description_artiste_3: 'Qu’il aborde des thèmes sociaux, environnementaux ou intimes, Millo utilise l’illustration comme un langage universel. Son style accessible et poétique touche un large public, en particulier dans les contextes éducatifs et humanitaires.',
        url_instagram_reseau_social: '@_millo_',
        url_tiktok_reseau_social: '@_millo_',
      },
      {
        id_artiste: 3,
        nom_artiste: 'Baroud',
        prenom_artiste: 'Maisara',
        pays_artiste: 'Palestine',
        date_naissance_artiste: '1976-04-21',
        site_web_artiste: 'https://www.instagram.com/maisarart/?hl=fr',
        url_image_artiste_1: 'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748619987/1c5b22e0-a604-46c1-b7e2-d22576dacd3f_z3tilm.jpg',
        url_image_artiste_2: 'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748619989/40fcbaba-5df5-438f-95cd-4779ec6875fa_kkdsoz.jpg',
        url_image_artiste_3: 'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748619991/be5f395e-7385-4ada-8df6-57e7dae72ffa_blvyuu.jpg',
        description_artiste_1: 'Maisara Baroud est un artiste palestinien dont les œuvres incarnent la lutte, l’espoir et la résilience de son peuple. À travers des symboles puissants comme la clé du retour ou l’olivier, il immortalise les blessures de l’exil et les rêves de liberté.',
        description_artiste_2: 'Son art dépasse l’esthétique : il est un outil de dénonciation, un acte de résistance face à l’occupation. Chaque trait est un cri silencieux pour la justice, chaque œuvre un hommage à ceux qui refusent l’effacement.',
        description_artiste_3: 'Enraciné dans l’histoire de la Palestine, Maisara Baroud mêle tradition visuelle et engagement militant. Il conçoit des visuels qui mobilisent et rassemblent, donnant un nouveau souffle à la cause à travers des supports contemporains comme le textile.',
        url_instagram_reseau_social: '@maisarart',
        url_tiktok_reseau_social: '@maisarart',
      },
    ],
    skipDuplicates: true,
  });
}
