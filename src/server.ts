import express from "express";
import path from "path";
import mongoose from "mongoose";
import Product from "./models/Product";
import PriceHistory from "./models/PriceHistory";
import { ENVIRONMENT } from "./environment";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Produtos ──────────────────────────────────────────────

// Lista todos os produtos com o último preço registrado
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const productsWithPrice = await Promise.all(
      products.map(async (product) => {
        const latest = await PriceHistory.findOne({
          productId: product._id,
        }).sort({ scrapedAt: -1 });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const previous = await PriceHistory.findOne({
          productId: product._id,
          scrapedAt: { $lte: yesterday },
        }).sort({ scrapedAt: -1 });

        const currentPrice = latest?.price ?? null;
        const previousPrice = previous?.price ?? null;
        const priceChange =
          currentPrice && previousPrice
            ? ((currentPrice - previousPrice) / previousPrice) * 100
            : null;

        return {
          _id: product._id,
          name: product.name,
          url: product.url,
          targetPrice: product.targetPrice,
          createdAt: product.createdAt,
          currentPrice,
          available: latest?.available ?? false,
          lastChecked: latest?.scrapedAt ?? null,
          priceChange: priceChange ? parseFloat(priceChange.toFixed(1)) : null,
          belowTarget:
            currentPrice !== null && currentPrice <= product.targetPrice,
          site: getSiteFromUrl(product.url),
        };
      }),
    );

    res.json(productsWithPrice);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar produtos: " + (err as Error).message });
  }
});

// Histórico de preços de um produto (últimos 30 registros)
app.get("/api/products/:id/history", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const history = await PriceHistory.find({ productId: id })
      .sort({ scrapedAt: -1 })
      .limit(30);

    res.json(history);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar histórico: " + (err as Error).message });
  }
});

// Cadastrar novo produto
app.post("/api/products", async (req, res) => {
  try {
    const { name, url, targetPrice } = req.body;

    if (!name || !url || !targetPrice) {
      return res
        .status(400)
        .json({ error: "name, url e targetPrice são obrigatórios" });
    }

    const existing = await Product.findOne({ url });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Produto com essa URL já cadastrado" });
    }

    const product = await Product.create({ name, url, targetPrice });
    res.status(201).json(product);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao cadastrar produto: " + (err as Error).message });
  }
});

// Remover produto
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await Product.findByIdAndDelete(id);
    await PriceHistory.deleteMany({ productId: id });

    res.json({ message: "Produto removido com sucesso" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao remover produto: " + (err as Error).message });
  }
});

// ── Stats ──────────────────────────────────────────────────

app.get("/api/stats", async (req, res) => {
  try {
    const total = await Product.countDocuments();

    const products = await Product.find();
    let belowTarget = 0;

    for (const product of products) {
      const latest = await PriceHistory.findOne({
        productId: product._id,
      }).sort({ scrapedAt: -1 });
      if (latest && latest.price <= product.targetPrice) belowTarget++;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alertsToday = await PriceHistory.countDocuments({
      scrapedAt: { $gte: today },
      price: { $exists: true },
    });

    res.json({ total, belowTarget, alertsToday });
  } catch (err) {
    res.status(500).json({
      error: `Erro ao buscar estatísticas: ${(err as Error).message}`,
    });
  }
});

// ── Helpers ────────────────────────────────────────────────

function getSiteFromUrl(url: string): string {
  if (url.includes("mercadolivre")) return "Mercado Livre";
  if (url.includes("amazon")) return "Amazon";
  if (url.includes("kabum")) return "KaBuM";
  return "Outro";
}

// ── Start ──────────────────────────────────────────────────

export async function startServer() {
  const uri = ENVIRONMENT.mongoose.uri;
  if (!uri) throw new Error("MONGO_URI não definido");

  await mongoose.connect(uri);
  console.log("MongoDB conectado.");

  app.listen(PORT, () => {
    console.log(`Dashboard rodando em http://localhost:${PORT}`);
  });
}
