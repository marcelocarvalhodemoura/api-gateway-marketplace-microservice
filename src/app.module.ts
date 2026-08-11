import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProxyModule } from './proxy/proxy.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { LoggingMiddleware } from './middleware/logging/logging.middleware';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      // carrega as variaveis de ambiente do arquivo .env
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 10000, // 10 segundos
        limit: 10, // 10 requisições por 10 segundos
      },
      // configura o throttler para limitar o numero de requisições por minuto
      {
        name: 'medium',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requisições por minuto
      },
      {
        name: 'long',
        ttl: 9000000, // 90 minutos
        limit: 1000, // 1000 requisições por hora
      },
    ]),
    ProxyModule,
    MiddlewareModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
