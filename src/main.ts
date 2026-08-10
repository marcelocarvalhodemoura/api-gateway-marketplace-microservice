import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        // HTTP Strict Transport Security
        maxAge: 31536000, // 1 ano em segundos
        includeSubDomains: true, // inclui subdomínios no HSTS
        preload: true, // precarrega o HSTS no navegador
      },
    }),
  ); // protege a aplicação contra ataques de injeção de codigo

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = process.env.CORS_ORIGIN?.split(',') ?? ['*'];

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true, // permite que a aplicação seja acessada por outras aplicações
    maxAge: 86400, // define o tempo de cache do CORS em segundos
  }); // permite que a aplicação seja acessada por outras aplicações

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove os campos que não estão no DTO
      forbidNonWhitelisted: true, // retorna um erro se o campo não estiver no DTO
    }),
  ); // valida os dados da requisição e retorna um erro se o campo não estiver no DTO

  const config = new DocumentBuilder()
    .setTitle('API Gateway Microservice') // define o titulo da API
    .setDescription('API Gateway Microservice Marketplace for the application') // define a descrição da API
    .setVersion('1.0') // define a versão da API
    .addBearerAuth() // adiciona o token de autenticação ao swagger
    .build(); // cria a configuração do swagger como um objeto

  const document = SwaggerModule.createDocument(app, config); // cria o documento do swagger
  SwaggerModule.setup('api', app, document); // define a rota do swagger e o documento do swagger

  const port = process.env.PORT ?? 3005; // define a porta do servidor
  await app.listen(port); // inicia o servidor

  console.log(`🚀API Gateway is running on port ${port}`); // loga a porta do servidor
  console.log(`📘Swagger is running on http://localhost:${port}/api`); // loga a url do swagger
}
void bootstrap(); // inicia o servidor
