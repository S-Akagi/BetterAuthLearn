import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // BetterAuth がリクエストボディを自前で処理するため必須
  });

  await app.listen(3001);
}
void bootstrap();
