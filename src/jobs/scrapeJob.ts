import cron from "node-cron";
import { checkAllProducts } from "../services/priceService";
import logger from "../utils/logger";
import { ENVIRONMENT } from "../environment";

export function startScrapeJob(): void {
  if (!cron.validate(ENVIRONMENT.executionSchedule!)) {
    logger.error(`CRON_SCHEDULE inválido: "${ENVIRONMENT.executionSchedule!}"`);
    process.exit(1);
  }

  logger.info(`Job de scraping agendado: "${ENVIRONMENT.executionSchedule!}"`);

  cron.schedule(ENVIRONMENT.executionSchedule!, async () => {
    logger.info("Executando job de scraping...");
    try {
      await checkAllProducts();
      logger.info("Job finalizado com sucesso.");
    } catch (err) {
      logger.error("Erro no job de scraping:", err);
    }
  });
}
