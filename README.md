# 🤖 RPA Price Monitor

![CI](https://github.com/LittleCesta/rpa-price-monitor/actions/workflows/ci.yml/badge.svg)

RPA de monitoramento de preços de produtos no Mercado Livre. O sistema acessa as páginas dos produtos automaticamente, coleta os preços, salva o histórico no banco de dados e envia alertas por e-mail quando o preço atinge o valor desejado.

---

## 💼 Contexto profissional

Este projeto foi desenvolvido como extensão natural do meu trabalho diário como
Software Developer, onde atuo com automação de processos (RPA) usando Playwright,
Puppeteer e TypeScript em ambiente corporativo.

No trabalho, minhas automações rodam em produção via Docker e Docker Compose,
têm impacto direto no SLA do setor e passam por revisão de código e validação
de PRs — a mesma estrutura que adotei aqui.

Como a maior parte dos projetos da empresa são privados, este repositório reflete
a stack e as boas práticas que aplico no dia a dia: arquitetura em camadas,
logging estruturado, containerização completa e separação clara de responsabilidades.

---

## 🧩 Funcionalidades

- Scraping automatizado de páginas de produtos no Mercado Livre com **Playwright**
- Armazenamento do histórico de preços no **MongoDB**
- Alertas por **e-mail** quando o preço cai abaixo do valor alvo
- Agendamento via **cron** configurável por variável de ambiente
- Logs estruturados em arquivo e console
- Ambiente 100% containerizado com **Docker** e **Docker Compose**

---

## 🏗️ Arquitetura

```
src/
├── index.ts               # Ponto de entrada
├── jobs/
│   └── scrapeJob.ts       # Agendamento do cron
├── models/
│   ├── Product.ts         # Model de produto
│   └── PriceHistory.ts    # Model de histórico de preços
├── scrapers/
│   └── mercadoLivreScraper.ts  # Scraper com Playwright
├── services/
│   ├── priceService.ts    # Lógica de negócio
│   └── alertService.ts    # Envio de alertas por e-mail
├── utils/
│   ├── database.ts        # Conexão com MongoDB
│   └── logger.ts          # Logger
└── environment.ts         # Mapeamento das variáveis de ambiente
```

---

## 🚀 Como rodar

### Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/rpa-price-monitor.git
cd rpa-price-monitor
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com suas configurações
```

### 3. Suba os containers

```bash
docker-compose up --build
```

Pronto! O RPA vai rodar uma checagem imediata e depois seguir o agendamento definido no `.env`.

---

## ⚙️ Variáveis de ambiente

| Variável               | Descrição                       | Padrão                                |
| ---------------------- | ------------------------------- | ------------------------------------- |
| `NODE_ENVIRONMENT`     | Ambiente de execução do node    | —                                     |
| `MONGO_URI`            | URI de conexão com o MongoDB    | `mongodb://mongo:27017/price-monitor` |
| `PRICE_DROP_THRESHOLD` | % de queda para disparar alerta | `10`                                  |
| `ALERT_EMAIL`          | E-mail que receberá os alertas  | —                                     |
| `SMTP_HOST`            | Host do servidor SMTP           | —                                     |
| `SMTP_PORT`            | Porta do servidor SMTP          | `587`                                 |
| `SMTP_USER`            | Usuário do SMTP                 | —                                     |
| `SMTP_PASS`            | Senha de app do SMTP            | —                                     |

---

## 🛠️ Tecnologias

- **TypeScript** — tipagem estática
- **Playwright** — automação de browser
- **MongoDB + Mongoose** — banco de dados e ODM
- **node-schedule** — agendamento de tarefas
- **Nodemailer** — envio de e-mails
- **Docker / Docker Compose** — containerização

---

## 📌 Como adicionar produtos para monitorar

No arquivo `src/index.ts`, utilize a função `addProduct`:

```typescript
await addProduct(
  "Nome do Produto",
  "https://www.mercadolivre.com.br/link-do-produto",
  1500, // preço alvo em R$
);
```

---

## 📄 Licença

MIT
