import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3000;
  const isDev = config.get<string>('nodeEnv') !== 'production';

  app.enableCors({
    origin: isDev ? '*' : ['https://expensemanager.vercel.app'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  if (isDev) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ExpenseManager API')
      .setDescription('API de gestión de gastos personales, tarjetas de crédito, MSI, adeudos e inversiones')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.log(`🚀 ExpenseManager API corriendo en http://localhost:${port}/api/v1`);
  if (isDev) console.log(`📚 Swagger docs en http://localhost:${port}/api/docs`);
}
bootstrap();
