import "dotenv/config";
import { connectDB } from "./utils/database";
import { startScrapeJob } from "./jobs/scrapeJob";
import { addProduct, checkAllProducts } from "./services/priceService";
import logger from "./utils/logger";

(async function main() {
  await connectDB();

  await addProduct(
    "Morte Subita - Mascara Capilar",
    "https://lista.mercadolivre.com.br/morte-subita",
    30,
  ).catch(() => {});

  await checkAllProducts();

  startScrapeJob();

  logger.info("RPA Price Monitor rodando. Aguardando próximo ciclo...");
})();
