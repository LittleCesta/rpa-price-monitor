import { chromium } from "playwright";
import logger from "../utils/logger";
import { browserConfig } from "../environment";

export interface ScrapeResult {
  price: number | null;
  available: boolean;
  title: string;
}

export async function scrapeMercadoLivre(url: string): Promise<ScrapeResult> {
  const browser = await chromium.launch(browserConfig);
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    logger.info(`Scraping: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

    await page.pause();

    // Título do produto
    const title = await page
      .locator("h1.ui-pdp-title")
      .first()
      .textContent()
      .catch(() => "Título não encontrado");

    // Preço principal
    const priceText = await page
      .locator(".andes-money-amount__fraction")
      .first()
      .textContent()
      .catch(() => null);

    const price = priceText
      ? parseFloat(priceText.replace(/\./g, "").replace(",", "."))
      : null;

    // Disponibilidade
    const unavailable = await page
      .locator("text=indisponível")
      .count()
      .then((n) => n > 0)
      .catch(() => false);

    return {
      title: title?.trim() ?? "N/A",
      price,
      available: !unavailable && price !== null,
    };
  } catch (error) {
    logger.error(`Erro ao fazer scraping de ${url}:`, error);
    return { title: "Erro", price: null, available: false };
  } finally {
    await browser.close();
  }
}
