import mongoose from "mongoose";
import logger from "../utils/logger";
import { ENVIRONMENT } from "../environment";

export async function connectDB(): Promise<void> {
  if (!ENVIRONMENT.mongoose.uri) {
    logger.error("MONGO_URI não definido no .env");
    process.exit(1);
  }

  try {
    mongoose.connection.on("error", (err) =>
      console.error("Mongoose error:", err),
    );
    await mongoose.connect(ENVIRONMENT.mongoose.uri!, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info("MongoDB conectado.");
  } catch (err: any) {
    console.error("Erro completo:", JSON.stringify(err, null, 2));
    console.error("Mensagem:", err.message);
    console.error("Causa:", err.cause);
    process.exit(1);
  }
}
