import { LaunchOptions } from "playwright";

export const ENVIRONMENT = {
  headlessMode: process.env.NODE_ENVIRONMENT != "production" ? false : true,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  alertEmail: process.env.ALERT_EMAIL,
  mongoose: {
    uri: process.env.MONGO_URI,
  },
  threshold: Number(process.env.THRESHOLD),
  mercadoLivreBaseUrl: "https://www.mercadolivre.com.br/",
  mercadolivre: {
    appId: process.env.ML_APP_ID,
    secret: process.env.ML_SECRET,
    accessToken: process.env.ML_ACCESS_TOKEN,
  },
};

export const browserConfig: LaunchOptions = {
  headless: ENVIRONMENT.headlessMode,
  devtools: false,
} as LaunchOptions;
