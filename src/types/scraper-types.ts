import LoggerHelper from "../utils/logger";

export interface ScrapeResult {
  price: number | null;
  available: boolean;
  title: string;
}

export interface IScraper {
  scrape(
    url: string,
    productName: string,
    logger: LoggerHelper,
  ): Promise<ScrapeResult>;
}
