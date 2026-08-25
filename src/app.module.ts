import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProxyModule } from './proxy/proxy.module';
import { MiddlewareModule } from './middleware/middleware.module';
import { LoggingMiddleware } from './middleware/logging/logging.middleware';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuardGuard } from './guard/throttler-guard.guard';
@Module({
  imports: [
    ConfigModule.forRoot({
      // carrega as variaveis de ambiente do arquivo .env
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000, // 1 segundo
          limit: configService.get<number>('THROTTLE_SHORT_LIMIT', 10),
        },
        {
          name: 'medium',
          ttl: 60000, // 1 minuto
          limit: configService.get<number>('THROTTLE_MEDIUM_LIMIT', 100),
        },
        {
          name: 'long',
          ttl: 900000, // 15 minutos
          limit: configService.get<number>('THROTTLE_LONG_LIMIT', 1000),
        },
      ],
      inject: [ConfigService],
    }),
    ProxyModule,
    MiddlewareModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuardGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
