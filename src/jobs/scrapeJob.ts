import LoggerHelper from "../utils/logger";
import { addProduct, checkAllProducts } from "../services/priceService";

export async function startScrapeJob(logger: LoggerHelper): Promise<void> {
  try {
    await addProduct(
      "Morte Subita - Mascara Capilar",
      "mascara-de-hidrataco-morte-subita-450g-lola-cosmetics/p/MLB19485497?pdp_filters=item_id%3AMLB2752028221",
      40,
      logger,
    );

    await checkAllProducts(logger);

    logger.log("INFO", "Scraping finalizado.");
  } catch (e) {
    const err = e as Error;
    logger.log("ERROR", `Erro ao iniciar o scraping: ${err.message}`);
  }
}
