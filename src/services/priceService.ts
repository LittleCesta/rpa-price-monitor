import Product, { IProduct } from "../models/Product";
import PriceHistory from "../models/PriceHistory";
import { scrapeMercadoLivre } from "../scrapers/mercadoLivreScraper";
import { sendPriceAlert } from "./alertService";
import LoggerHelper from "../utils/logger";
import { ENVIRONMENT } from "../environment";

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
  const result = await scrapeMercadoLivre(product.url, logger);

  if (!result.price) {
    logger.log("WARN", `Preço não encontrado para: ${product.name}`);
    return;
  }

  // Salva histórico
  await PriceHistory.create({
    productId: product._id,
    productName: product.name,
    price: result.price,
    available: result.available,
  });

  logger.log(
    "INFO",
    `[${product.name}] Preço atual: R$ ${result.price.toFixed(2)}`,
  );

  const droppedEnough =
    result.price <= product.targetPrice ||
    ((product.targetPrice - result.price) / product.targetPrice) * 100 >=
      ENVIRONMENT.threshold;

  if (droppedEnough && result.available) {
    await sendPriceAlert(
      {
        productName: product.name,
        currentPrice: result.price,
        targetPrice: product.targetPrice,
        url: product.url,
      },
      logger,
    );
  }
}

export async function addProduct(
  name: string,
  url: string,
  targetPrice: number,
  logger: LoggerHelper,
): Promise<IProduct> {
  const product = await Product.create({ name, url, targetPrice });
  logger.log("INFO", `Produto cadastrado: ${name}`);
  return product;
}

export async function getPriceHistory(productId: string) {
  return PriceHistory.find({ productId }).sort({ scrapedAt: -1 }).limit(30);
}
