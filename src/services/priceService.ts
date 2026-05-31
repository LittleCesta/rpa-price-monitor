import Product, { IProduct } from "../models/Product";
import PriceHistory from "../models/PriceHistory";
import { MercadoLivreScraper } from "../scrapers/mercadoLivreScraper";
import { sendPriceAlert } from "./alertService";
import LoggerHelper from "../utils/logger";
import { ENVIRONMENT } from "../environment";
import { IScraper } from "../types/scraper-types";

export async function checkAllProducts(logger: LoggerHelper): Promise<void> {
  const products = await Product.find();

  if (products.length === 0) {
    logger.log("WARN", "Nenhum produto cadastrado para monitorar.");
    return;
  }

  logger.log(
    "INFO",
    `Iniciando monitoramento de ${products.length} produto(s)...`,
  );

  for (const product of products) {
    await checkProduct(product, logger);
  }
}

async function checkProduct(
  product: IProduct,
  logger: LoggerHelper,
): Promise<void> {
  const scraper = getScraperByUrl(product.url);
  logger.log("INFO", `Validando scrapping do produto`);
  const result = await scraper.scrape(product.url, product.name, logger);

  if (!result.price) {
    logger.log("WARN", `Produto não retornou preço: ${product.name}`);
    return;
  }

  // Salva histórico
  await PriceHistory.create({
    productId: product._id,
    productName: product.name,
    price: result.price,
    productUrl: product.url,
    available: result.available,
  });

  logger.log(
    "INFO",
    `[${product.name}] Preço atual: R$ ${result.price.toFixed(2)}`,
  );

  const droppedEnough = result.price <= product.targetPrice;

  if (droppedEnough && result.available) {
    logger.log(
      "INFO",
      `Preço abaixo do alvo! Enviando alerta do produto ${product.name}`,
    );
    await sendPriceAlert(
      {
        productName: product.name,
        currentPrice: result.price,
        targetPrice: product.targetPrice,
        url: product.url,
      },
      logger,
    );
  } else {
    logger.log("INFO", `Preço não baixou o suficiente`);
  }
}

export async function addProduct(
  name: string,
  urlSufix: string,
  targetPrice: number,
  logger: LoggerHelper,
): Promise<IProduct> {
  const productExists = await findProduct(name, targetPrice, urlSufix, logger);
  if (productExists) {
    logger.log("WARN", `Produto já existe`);
    return productExists;
  } else {
    const product = await Product.create({
      name,
      url: `${ENVIRONMENT.mercadoLivreBaseUrl}${urlSufix}`,
      targetPrice,
    });
    logger.log("INFO", `Produto cadastrado: ${name}`);
    return product;
  }
}

export async function getPriceHistory(productId: string) {
  return PriceHistory.find({ productId }).sort({ scrapedAt: -1 }).limit(30);
}

export async function findProduct(
  productName: string,
  targetPrice: number,
  urlSufix: string,
  logger: LoggerHelper,
) {
  try {
    const product = await Product.findOne({ name: productName });
    if (product) {
      logger.log(
        "INFO",
        `Produto encontrado: ${product.name}. Atualizando dados do produto`,
      );
      await Product.updateOne(
        { name: productName },
        {
          $set: {
            url: `${ENVIRONMENT.mercadoLivreBaseUrl}${urlSufix}`,
            targetPrice: targetPrice,
          },
        },
      );
      return product;
    } else {
      logger.log("WARN", `Produto não encontrado: ${productName}`);
      return false;
    }
  } catch (e) {
    const err = e as Error;
    logger.log("ERROR", `Erro ao buscar produto: ${err.message}`);
    return false;
  }
}

function getScraperByUrl(url: string): IScraper {
  if (url.includes("mercadolivre")) return new MercadoLivreScraper();
  // if (url.includes("amazon")) return new AmazonScraper();
  throw new Error(`Site não suportado: ${url}`);
}
