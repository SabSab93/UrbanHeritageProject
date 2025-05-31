// prisma/seed/seedMaillots.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedMaillots() {
  console.log('Seeding maillots…');
  await prisma.maillot.deleteMany();
  await prisma.maillot.createMany({
    data: [
      {
        id_maillot: 1,
        id_tva: 1,
        nom_maillot: 'Maillot du Bresil',
        pays_maillot: 'Bresil',
        description_maillot:
          'Ce maillot aux teintes jaune et vert représente un enfant accroupi tenant un oiseau, sur fond de favela avec le Christ Rédempteur. Il évoque la vie, l’espoir et la nature dans les quartiers populaires brésiliens. Le contraste entre le paysage urbain dense et la fragilité d’un enfant en communion avec un oiseau illustre parfaitement la philosophie de l’artiste : la douceur comme réponse à la dureté du monde. Orné de motifs traditionnels brésiliens en arrière-plan, ce maillot fait cohabiter culture, nature et urbanité. Il porte un message d’écologie, de paix et de solidarité, fidèle aux valeurs de Planète Amazone.',
        composition_maillot: 'Coton bio et polyester',
        url_image_maillot_1:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620164/6280339c-3b33-46dd-9487-89d6baaaea01-removebg-preview_jkncmj.png',
        url_image_maillot_2:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620164/6280339c-3b33-46dd-9487-89d6baaaea01-removebg-preview_jkncmj.png',
        url_image_maillot_3:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620164/6280339c-3b33-46dd-9487-89d6baaaea01-removebg-preview_jkncmj.png',
        origine: 'France',
        tracabilite: 'Fabriqué en France',
        entretien: 'Lavage à froid, pas de sèche-linge',
        prix_ht_maillot: 110,
        id_artiste: 1,
        id_association: 1,
        quantite_vendue: 0,
      },
      {
        id_maillot: 2,
        id_tva: 1,
        nom_maillot: 'Maillot Italie',
        pays_maillot: 'Italie',
        description_maillot:
          'Sur fond bleu intense, le maillot représente des mains tendues évoquant la Création d’Adam, le Vésuve en toile de fond, et une figure laurée dessinant un avenir nouveau. Il mêle symboles classiques et esprit de résistance. Ce design signé Millo illustre le lien entre culture, héritage et transformation. La main tendue, le fil noir, la jeunesse qui crée : tout évoque le combat contre la violence par l’art, l’éducation et l’union. Plus qu’un vêtement, ce maillot est une narration visuelle. Il rend hommage à Giulia, à l’Italie, à la paix et à l’art comme vecteur de changement. Il invite à réfléchir, à se souvenir, à construire.',
        composition_maillot: 'Coton bio et polyester',
        url_image_maillot_1:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620317/italie_d9w9s6.png',
        url_image_maillot_2:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620317/italie_d9w9s6.png',
        url_image_maillot_3:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620317/italie_d9w9s6.png',
        origine: 'France',
        tracabilite: 'Production locale en France',
        entretien: 'Lavage à 40°C, repassage léger',
        prix_ht_maillot: 120,
        id_artiste: 2,
        id_association: 2,
        quantite_vendue: 0,
      },
      {
        id_maillot: 3,
        id_tva: 1,
        nom_maillot: 'Maillot Palestine',
        pays_maillot: 'Palestine',
        description_maillot:
          'Ce maillot arbore un visuel puissant : un fond en motif de grillage évoquant l’enfermement, contrasté par une colombe et une figure tenant la clé du retour. Le mot "Palestine" en arabe souligne l’identité et la résistance du peuple. En noir et blanc, rehaussé de vert et rouge, le maillot reprend les couleurs symboliques de la Palestine. Il conjugue art et engagement, en collaboration avec Maisara Baroud, pour faire du vêtement un manifeste visuel. Avec l’illustration d’un dôme, d’un olivier et d’un personnage stylisé, ce maillot est bien plus qu’un produit : c’est un support de sensibilisation, une œuvre que l’on porte fièrement pour exprimer sa solidarité avec le peuple palestinien.',
        composition_maillot: 'Polyester recyclé',
        url_image_maillot_1:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620312/palestine_kcuikf.png',
        url_image_maillot_2:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620312/palestine_kcuikf.png',
        url_image_maillot_3:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1748620312/palestine_kcuikf.png',
        origine: 'France',
        tracabilite: 'Fabriqué en France',
        entretien: 'Lavage à froid, pas de sèche-linge',
        prix_ht_maillot: 120,
        id_artiste: 3,
        id_association: 3,
        quantite_vendue: 0,
      },
    ],
    skipDuplicates: true,
  });
}
