import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // BetterAuth がリクエストボディを自前で処理するため必須
  });

  const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',') || [
    'http://localhost:5173',
  ];

  app.enableCors({
    origin: trustedOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
