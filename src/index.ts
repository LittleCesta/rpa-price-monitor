import "dotenv/config";
import { startScrapeJob } from "./jobs/scrapeJob";
import Logger from "./utils/logger";
import schedule from "node-schedule";
import { connectDB } from "./utils/database";

(async function main() {
  const logger = new Logger("./price-monitor.log", "price-monitor");

  const job = schedule.scheduleJob(
    {
      dayOfWeek: [new schedule.Range(0, 6)],
      hour: new schedule.Range(7, 20),
      minute: 0,
      tz: "America/Sao_Paulo",
    },
    async () => {
      await connectDB(logger);

      startScrapeJob(logger);

      logger.log(
        "INFO",
        "Próxima execução: " +
          job
            .nextInvocation()
            .toLocaleString("pt-br", { timeZone: "America/Sao_Paulo" }),
      );
    },
  );
  logger.log(
    "INFO",
    "Scraping iniciado. Próxima execução: " +
      job
        .nextInvocation()
        .toLocaleString("pt-br", { timeZone: "America/Sao_Paulo" }),
  );
  job.invoke();
})();
