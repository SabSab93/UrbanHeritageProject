// prisma/seed/seedMaillots.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedMaillots() {
  console.log('Seeding maillots…');
  await prisma.maillot.createMany({
    data: [
      {
        id_maillot: 3,
        id_tva: 1,
        nom_maillot: 'Maillot USA',
        pays_maillot: 'États-Unis',
        description_maillot:
          'Le Maillot USA puise son inspiration dans l’imaginaire du « rêve américain » en revisitant le drapeau des 50 États avec modernité. Son mélange exclusif coton bio et polyester crée un équilibre parfait entre douceur et résistance : la maille naturellement respirante du coton est renforcée par la robustesse du polyester, pour un porté confortable et durable. La poitrine arbore un imprimé étoilé stylisé, subtilement dégradé, tandis que les bandes horizontales accompagnent les contours de la silhouette sans jamais entraver le confort. Les coutures plates et l’encolure en V renforcée offrent un fit irréprochable, adapté à tous les gabarits. Conçu et fabriqué en Californie avec un processus de production locale, ce maillot mêle authenticité artisanale et innovation, tout en soutenant des programmes associatifs dédiés à l’éducation et au sport.',
        composition_maillot: 'Coton bio et polyester',
        url_image_maillot_1:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690357/usa_front_twita2.webp',
        url_image_maillot_2:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690357/usa_back_rquawr.webp',
        url_image_maillot_3:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690358/usa_model_o00ckz.webp',
        origine: 'États-Unis',
        tracabilite: 'Production locale en Californie',
        entretien: 'Lavage à 40°C, repassage léger',
        prix_ht_maillot: 120,
        id_artiste: 3,
        id_association: 3,
        quantite_vendue: 0,
      },
      {
        id_maillot: 5,
        id_tva: 1,
        nom_maillot: 'Maillot Argentine',
        pays_maillot: 'Argentine',
        description_maillot:
          'Ce Maillot Argentine célèbre l’élégance et la passion du pays à travers un jeu de couleurs bleu azur et blanc éclatant, inspiré des vastes plaines et du ciel patagonien. Confectionné en coton bio certifié et polyester recyclé, il garantit une douceur remarquable au toucher tout en offrant une durabilité accrue et une excellente gestion de l’humidité. Le graphisme dynamique de ses bandes, associé à un col polo finement structuré, apporte une touche sophistiquée, tandis que les surpiqûres contrastantes rappellent l’artisanat traditionnel argentin. L’écusson tissé, orné de détails dorés, témoigne du prestige de la fabrication locale, réalisée selon des normes strictes de traçabilité. En achetant ce maillot, vous contribuez au financement d’initiatives solidaires menées par notre association partenaire en Argentine, alliant ainsi style, confort et engagement social.',
        composition_maillot: 'Coton bio et polyester',
        url_image_maillot_1:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690357/argentina_front_cutj1x.webp',
        url_image_maillot_2:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690357/argentina_back_vqy6vg.webp',
        url_image_maillot_3:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690358/argentina_model_aijskz.webp',
        origine: 'Argentine',
        tracabilite: 'Production locale en Californie',
        entretien: 'Lavage à 40°C, repassage léger',
        prix_ht_maillot: 90,
        id_artiste: 5,
        id_association: 5,
        quantite_vendue: 0,
      },
      {
        id_maillot: 2,
        id_tva: 1,
        nom_maillot: 'Maillot du Mexique',
        pays_maillot: 'Mexique',
        description_maillot:
          'Ce Maillot du Mexique en édition spéciale rend un hommage vibrant aux racines aztèques grâce à un design graphique unique. Réalisé en polyester recyclé de haute performance, il allie respect de l’environnement et sensations de jeu optimales, grâce à une fibre fine et respirante qui sèche rapidement. Les nuances de vert sombre, ponctuées d’accents ocres inspirés des fresques préhispaniques, racontent l’histoire millénaire du Mexique, tandis que les manches à coupe ergonomique offrent une liberté de mouvement totale. Chaque détail, du col rond renforcé aux finitions thermocollées, témoigne d’un savoir-faire local et d’un souci constant de la qualité. Fabriqué à Mexico selon des standards stricts de traçabilité, il soutient également l’association partenaire, faisant de ce maillot un symbole de solidarité et de patrimoine culturel.',
        composition_maillot: 'Polyester recyclé',
        url_image_maillot_1:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690358/mexico_front_ffgyua.webp',
        url_image_maillot_2:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690358/mexico_back_isxuh0.webp',
        url_image_maillot_3:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690358/mexico_model_nqgihv.webp',
        origine: 'Mexique',
        tracabilite: 'Fabriqué à Mexico',
        entretien: 'Lavage à froid, pas de sèche-linge',
        prix_ht_maillot: 75,
        id_artiste: 2,
        id_association: 2,
        quantite_vendue: 0,
      },
      {
        id_maillot: 6,
        id_tva: 1,
        nom_maillot: 'Maillot Italie',
        pays_maillot: 'Italie',
        description_maillot:
          'Le Maillot Italie allie le charme intemporel de la mode italienne à la performance sportive la plus exigeante. Sa palette de vert olive et de blanc cassé s’inspire des collines toscanes et du marbre de Carrare, tandis que la coupe ajustée épouse la silhouette sans jamais compromettre la liberté de mouvement. Conçu en coton bio mélangé à du polyester haute ténacité, il offre à la fois légèreté, respirabilité et résistance à l’usure, pour un maintien optimal sur le terrain comme au quotidien. Les finitions soignées—col en V bord-côtes, empiècements latéraux en mesh—soulignent un design résolument technique. Fabriqué en Italie selon un savoir-faire artisanal hérité de générations de couturiers, ce maillot soutient également une association culturelle locale, renforçant ainsi le lien entre style, tradition et responsabilité.',
        composition_maillot: 'Coton bio et polyester',
        url_image_maillot_1:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690358/italia_front_rya0mn.webp',
        url_image_maillot_2:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690358/italia_back_hm7vmr.webp',
        url_image_maillot_3:
          'https://res.cloudinary.com/dpwuvu0k3/image/upload/v1746690358/italia_model_uxvtgz.webp',
        origine: 'Italie',
        tracabilite: 'Production locale en Italie',
        entretien: 'Lavage à 40°C, repassage léger',
        prix_ht_maillot: 90,
        id_artiste: 6,
        id_association: 1,
        quantite_vendue: 0,
      },
    ],
    skipDuplicates: true,
  });
}
