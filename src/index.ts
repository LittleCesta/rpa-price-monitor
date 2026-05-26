import "dotenv/config";
import { connectDB } from "./utils/database";
import { startScrapeJob } from "./jobs/scrapeJob";
import { addProduct, checkAllProducts } from "./services/priceService";
import Logger from "./utils/logger";

(async function main() {
  const logger = new Logger("./price-monitor.log", "price-monitor");
  await connectDB(logger);

  await addProduct(
    "Morte Subita - Mascara Capilar",
    "mascara-de-hidrataco-morte-subita-450g-lola-cosmetics/p/MLB19485497?pdp_filters=item_id%3AMLB2752028221",
    30,
    logger,
  );

  await checkAllProducts(logger);

  startScrapeJob(logger);

  logger.log("INFO", "RPA Price Monitor rodando. Aguardando próximo ciclo...");
})();
