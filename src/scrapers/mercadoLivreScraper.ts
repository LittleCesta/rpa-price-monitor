import { chromium } from "playwright";
import LoggerHelper from "../utils/logger";
import { browserConfig } from "../environment";

export interface ScrapeResult {
  price: number | null;
  available: boolean;
  title: string;
}

function parsePrice(text: string | null): number | null {
  if (!text) return null;
  const cleaned = text.replace(/\./g, "").replace(",", ".").trim();
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

export async function scrapeMercadoLivre(
  url: string,
  logger: LoggerHelper,
): Promise<ScrapeResult> {
  const browser = await chromium.launch(browserConfig);
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    logger.log("INFO", `Scraping: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const title = await page
      .locator("h1.ui-pdp-title")
      .first()
      .textContent()
      .catch(() => "Título não encontrado");

    let price: number | null = null;

    // Tenta pegar o preço com desconto primeiro
    try {
      const discountLocator = page
        .locator(".ui-pdp-price__second-value .andes-money-amount__fraction")
        .first();
      await discountLocator.waitFor({ state: "visible", timeout: 7000 });
      price = parsePrice(await discountLocator.textContent());
      logger.log("INFO", `Preço com desconto encontrado: ${price}`);
    } catch {
      // Fallback: preço normal
      logger.log(
        "INFO",
        "Preço com desconto não encontrado, usando preço normal.",
      );
      const normalLocator = page
        .locator(".ui-pdp-price__main-value .andes-money-amount__fraction")
        .first();
      price = parsePrice(await normalLocator.textContent().catch(() => null));
    }

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
    logger.log("ERROR", `Erro ao fazer scraping de ${url}: ${error}`);
    return { title: "Erro", price: null, available: false };
  } finally {
    await browser.close();
  }
}
