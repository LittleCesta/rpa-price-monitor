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

    await addProduct(
      "Kit com 36 Envelopes Cromos Copa do Mundo FIFA 2026",
      "kit-c-36-envelopes-252-cromos--copa-do-mundo-fifa-2026/up/MLBU3881327409",
      300,
      logger,
    );

    await addProduct(
      "Notebook Multi Ultra Celeron N4020C 4GB 128GB W11 14 Cinza",
      "notebook-multi-ultra-celeron-n4020c-4gb-128gb-w11-14-cinza/p/MLB32101651#polycard_client=recommendations_home_trend-function-recommendations&reco_backend=trend_function&wid=MLB3988106227&reco_client=home_trend-function-recommendations&reco_item_pos=2&reco_backend_type=function&reco_id=331a1dd8-29d9-4728-a5e5-195d9000f045&sid=recos&c_id=/home/trend-recommendations/element&c_uid=ff0c202a-368c-4c21-8394-67cb4cc0fe65",
      300,
      logger,
    );

    await checkAllProducts(logger);

    logger.log("INFO", "Scraping finalizado.");
  } catch (e) {
    const err = e as Error;
    logger.log("ERROR", `Erro ao iniciar o scraping: ${err.message}`);
  }
}
