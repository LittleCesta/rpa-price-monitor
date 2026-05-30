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
  productName: string,
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
    let error = {
      happened: false,
      errorMessage: "",
    };
    logger.log("INFO", `Scraping: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

    try {
      const catpchaCheck = page.getByRole("heading", {
        name: "Por segurança, complete esta",
      });
      await catpchaCheck.waitFor({ state: "visible", timeout: 7000 });
      logger.log("INFO", "Captcha encontrado. Finalizando processo.");
      error = {
        happened: true,
        errorMessage: "Captcha interrompeu o processo",
      };
    } catch (e) {
      logger.log(
        "INFO",
        "Captcha nao encontrado. Prosseguindo com o scrapping.",
      );
    }

    try {
      const loginCheck = page.getByText("Olá! Para continuar,");
      await loginCheck.waitFor({ state: "visible", timeout: 7000 });
      logger.log("INFO", "Login solicitado. Finalizando processo.");

      error = {
        happened: true,
        errorMessage: "Solicitação de login interrompeu o processo",
      };
    } catch (e) {
      logger.log(
        "INFO",
        "Solicitação de login nao encontrado. Prosseguindo com o scrapping.",
      );
    }

    if (error.happened) {
      throw new Error(error.errorMessage);
    }

    const title = await page
      .locator("h1.ui-pdp-title")
      .first()
      .textContent()
      .catch(() => "Título não encontrado");

    let price: number | null = null;

    // Tenta pegar o preço com desconto primeiro
    try {
      await page.pause();
      const priceArea = page.locator(
        "div.ui-pdp-container__row.ui-pdp-container__row--price",
      );
      await priceArea.waitFor({ state: "visible", timeout: 7000 });
      const priceAreaText = await priceArea.textContent();
      logger.log("INFO", `Conteúdo da área de preço: ${priceAreaText}`);

      const [, fullPrice, discountPrice] = priceAreaText
        ? priceAreaText.split("R$")
        : ["", "", ""];
      const discount = discountPrice.slice(5, 8);

      // 'R$49,90Preço por litro: R$110,89Ver os meios de pagamento'
      // R$59,90R$36,9838% OFFPreço por litro: R$82,18Ver os meios de pagamento

      if (priceAreaText?.includes("OFF")) {
        logger.log(
          "INFO",
          `Desconto de ${discount} encontrado, pegando preço com desconto.`,
        );
        price = parsePrice(discountPrice.slice(0, 5));
      } else {
        logger.log("INFO", "Desconto não encontrado, pegando preço normal.");
        price = parsePrice(fullPrice);
      }
      logger.log("INFO", `Preço: ${price}`);
    } catch (e) {
      let error = e as Error;
      logger.log("ERROR", `Erro ao encontrar preço: ${error.message}`);
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
    logger.log("ERROR", `Erro ao fazer scraping de ${productName}: ${error}`);
    return { title: "Erro", price: null, available: false };
  } finally {
    await browser.close();
  }
}
