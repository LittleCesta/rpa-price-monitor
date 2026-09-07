import { chromium } from "playwright";
import LoggerHelper from "../utils/logger";
import { browserConfig } from "../environment";
import { IScraper, ScrapeResult } from "../types/scraper-types";

export function parsePrice(text: string | null): number | null {
  if (!text) return null;
  const cleaned = text.replace(/\./g, "").replace(",", ".").trim();
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

export class MercadoLivreScraper implements IScraper {
  async scrape(
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
      let error = { happened: false, errorMessage: "" };

      logger.log("INFO", `Scraping: ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded" });

      await page.pause();
      // Verifica captcha
      try {
        const captchaCheck = page.getByRole("heading", {
          name: "Por segurança, complete esta",
        });
        await captchaCheck.waitFor({ state: "visible", timeout: 7000 });
        logger.log("INFO", "Captcha encontrado. Finalizando processo.");
        error = {
          happened: true,
          errorMessage: "Captcha interrompeu o processo",
        };
      } catch {
        logger.log("INFO", "Captcha não encontrado. Prosseguindo.");
      }

      if (error.happened) throw new Error(error.errorMessage);

      // Verifica login
      try {
        const loginCheck = page.getByText("Olá! Para continuar,");
        await loginCheck.waitFor({ state: "visible", timeout: 7000 });
        logger.log("INFO", "Login solicitado. Finalizando processo.");
        error = {
          happened: true,
          errorMessage: "Solicitação de login interrompeu o processo",
        };
      } catch {
        logger.log(
          "INFO",
          "Solicitação de login não encontrada. Prosseguindo.",
        );
      }

      if (error.happened) throw new Error(error.errorMessage);

      const title = await page
        .locator("h1.ui-pdp-title")
        .first()
        .textContent()
        .catch(() => "Título não encontrado");

      let price: number | null = null;

      try {
        const priceArea = page.locator(
          "div.ui-pdp-container__row.ui-pdp-container__row--price",
        );
        await priceArea.waitFor({ state: "visible", timeout: 7000 });
        const priceAreaText = await priceArea.textContent();
        logger.log("INFO", `Conteúdo da área de preço: ${priceAreaText}`);

        // const debugMatches = [
        //   ...(priceAreaText?.matchAll(/R\$(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g) ??
        //     []),
        // ];
        // logger.log(
        //   "INFO",
        //   `Matches encontrados: ${JSON.stringify(debugMatches.map((m) => m[1]))}`,
        // );

        if (priceAreaText?.includes("OFF")) {
          // Pega todos os preços no formato R$X.XXX,XX ou R$XXX,XX ou R$XXX
          const allPrices = [
            ...(priceAreaText?.matchAll(
              /R\$(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g,
            ) ?? []),
          ];

          // O preço com desconto é sempre o segundo (o primeiro é o original riscado)
          if (allPrices.length >= 2) {
            const discountRaw = allPrices[1][1]; // pega o grupo de captura sem o R$
            logger.log("INFO", `Preço com desconto encontrado: ${discountRaw}`);
            price = parsePrice(discountRaw);
          }
        } else {
          // Sem desconto — pega o primeiro preço
          const match = priceAreaText?.match(
            /R\$(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/,
          );
          price = parsePrice(match?.[1] ?? null);
        }

        logger.log("INFO", `Preço: ${price}`);
      } catch (e) {
        logger.log("ERROR", `Erro ao encontrar preço: ${(e as Error).message}`);
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
}
