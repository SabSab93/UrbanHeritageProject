import { seedAdmin } from "./seed/seedAdmin";
import { seedArtistes } from "./seed/seedArtist";
import { seedAssociations } from "./seed/seedAssociations";
import { seedLieuLivraison } from "./seed/seedLieuLivraison";
import { seedLivreurs } from "./seed/seedLivreur";
import { seedMaillots } from "./seed/seedMaillots";
import { seedMethodesLivraison } from "./seed/seedMethodeLivraison";
import { seedPersonnalisations } from "./seed/seedPersonnalisations";
import { seedReduction } from "./seed/seedReduction";
import { seedRoles } from "./seed/seedRoles";
import { seedStocks } from "./seed/seedStocks";
import { seedTVA } from "./seed/seedTVA";

async function main() {
  await seedRoles();
  await seedTVA();
  await seedAssociations();
  await seedArtistes();
  await seedMaillots();
  await seedAdmin();
  await seedReduction();
  await seedPersonnalisations();
  await seedMethodesLivraison();
  await seedLieuLivraison();
  await seedLivreurs();
   await seedStocks(); 
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Seeding terminé !");
  });
