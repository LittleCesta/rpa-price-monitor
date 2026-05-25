import nodemailer from "nodemailer";
import logger from "../utils/logger";
import { ENVIRONMENT } from "../environment";

interface AlertPayload {
  productName: string;
  currentPrice: number;
  targetPrice: number;
  url: string;
}

const transporter = nodemailer.createTransport({
  host: ENVIRONMENT.smtpHost,
  port: Number(ENVIRONMENT.smtpPort),
  auth: {
    user: ENVIRONMENT.smtpUser,
    pass: ENVIRONMENT.smtpPass,
  },
});

export async function sendPriceAlert(payload: AlertPayload): Promise<void> {
  const { productName, currentPrice, targetPrice, url } = payload;

  if (ENVIRONMENT.smtpUser) {
    logger.warn("ALERT_EMAIL não configurado — alerta não enviado.");
    return;
  }

  const discount = (((targetPrice - currentPrice) / targetPrice) * 100).toFixed(
    1,
  );

  await transporter.sendMail({
    from: ENVIRONMENT.smtpUser,
    to: ENVIRONMENT.smtpUser,
    subject: `Alerta de preço: ${productName}`,
    html: `
      <h2>Preço baixou!</h2>
      <p><strong>Produto:</strong> ${productName}</p>
      <p><strong>Preço atual:</strong> R$ ${currentPrice.toFixed(2)}</p>
      <p><strong>Seu preço alvo:</strong> R$ ${targetPrice.toFixed(2)}</p>
      <p><strong>Desconto:</strong> ${discount}%</p>
      <p><a href="${url}">Ver produto no Mercado Livre</a></p>
    `,
  });

  logger.info(`Alerta enviado para ${ENVIRONMENT.alertEmail} — ${productName}`);
}
