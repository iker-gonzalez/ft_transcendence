import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { swaggerAsyncConfig, swaggerConfig } from 'config/swagger.config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
// import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';
// import { swaggerAsyncConstants } from 'config/swagger-async.constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());
  app.enableCors();

  // Documentation for REST API
  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .build();
  SwaggerModule.setup(
    swaggerConfig.slug,
    app,
    SwaggerModule.createDocument(app, config),
  );

  // Documentation for sockets
  // const asyncapiDocument = await AsyncApiModule.createDocument(
  //   app,
  //   new AsyncApiDocumentBuilder()
  //     .setTitle(swaggerAsyncConfig.title)
  //     .setDescription(swaggerAsyncConfig.description)
  //     .setVersion(swaggerAsyncConfig.version)
  //     .setDefaultContentType('application/json')
  //     .addSecurity('user-password', { type: 'userPassword' })
  //     .addServer(swaggerAsyncConstants.matchmaking.slug, {
  //       url: `ws://localhost:${process.env.API_PORT}`,
  //       protocol: 'socket.io',
  //       description: swaggerAsyncConstants.matchmaking.description,
  //     })
  //     .addServer(swaggerAsyncConstants.gameData.slug, {
  //       url: `ws://localhost:${process.env.API_PORT}`,
  //       protocol: 'socket.io',
  //       description: swaggerAsyncConstants.gameData.description,
  //     })
  //     .build(),
  // );

  // TODO investigate how to fix this
  // await AsyncApiModule.setup(swaggerAsyncConfig.slug, app, asyncapiDocument);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', '..', 'public'));

  await app.listen(process.env.API_PORT);
}
bootstrap();
