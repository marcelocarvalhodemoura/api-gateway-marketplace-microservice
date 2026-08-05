type ServiceEntry = {
  url: string;
  timeout: number;
};

export const serviceConfig: Record<
  'users' | 'products' | 'checkout' | 'payments',
  ServiceEntry
> = {
  users: {
    url: process.env.USERS_SERVICE_URL ?? 'http://localhost:3005',
    timeout: Number(process.env.SERVICE_TIMEOUT ?? 5000),
  },
  products: {
    url: process.env.PRODUCTS_SERVICE_URL ?? 'http://localhost:3001',
    timeout: Number(process.env.SERVICE_TIMEOUT ?? 5000),
  },
  checkout: {
    url: process.env.CHECKOUT_SERVICE_URL ?? 'http://localhost:3002',
    timeout: Number(process.env.SERVICE_TIMEOUT ?? 5000),
  },
  payments: {
    url: process.env.PAYMENTS_SERVICE_URL ?? 'http://localhost:3004',
    timeout: Number(process.env.SERVICE_TIMEOUT ?? 5000),
  },
}; // configuração dos serviços
