import cron from "node-cron";
import { checkAllProducts } from "../services/priceService";
import LoggerHelper from "../utils/logger";
import { ENVIRONMENT } from "../environment";

export function startScrapeJob(logger: LoggerHelper): void {
  if (!cron.validate(ENVIRONMENT.executionSchedule!)) {
    logger.log(
      "ERROR",
      `CRON_SCHEDULE inválido: "${ENVIRONMENT.executionSchedule!}"`,
    );
    process.exit(1);
  }

  logger.log(
    "INFO",
    `Job de scraping agendado: "${ENVIRONMENT.executionSchedule!}"`,
  );

  cron.schedule(ENVIRONMENT.executionSchedule!, async () => {
    logger.log("INFO", "Executando job de scraping...");
    try {
      await checkAllProducts(logger);
      logger.log("INFO", "Job finalizado com sucesso.");
      return true;
    } catch (err) {
      logger.log("ERROR", "Erro no job de scraping:" + err);
      return false;
    }
  });
}
