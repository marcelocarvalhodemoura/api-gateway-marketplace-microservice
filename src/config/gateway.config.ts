export const serviceConfig = {
  users: {
    url: process.env.USERS_SERVICE_URL ?? 'http://localhost:3000',
  },
  products: {
    url: process.env.PRODUCTS_SERVICE_URL ?? 'http://localhost:3001',
  },
  checkout: {
    url: process.env.CHECKOUT_SERVICE_URL ?? 'http://localhost:3002',
  },
} as const; // configuração dos serviços
