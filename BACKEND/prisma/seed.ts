import { seedRoles } from "./seed/seedRoles";
import { seedTVA } from "./seed/seedTVA";

async function main() {
  await seedRoles();
  await seedTVA();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Seeding terminé !");
  });
