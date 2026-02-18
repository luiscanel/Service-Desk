import { NestFactory } from '@nestjs/core'  
import { AppModule } from './app.module'  
import { ValidationPipe } from '@nestjs/common'  
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger' 
  
async function bootstrap() {  
  const app = await NestFactory.create(AppModule)  
  app.enableCors()  
  app.useGlobalPipes(new ValidationPipe({ transform: true })) 
  
  const config = new DocumentBuilder()  
    .setTitle('Service Desk API')  
    .setDescription('Enterprise Service Desk API Documentation')  
    .setVersion('1.0')  
    .addBearerAuth()  
    .build()  
  const document = SwaggerModule.createDocument(app, config)  
  SwaggerModule.setup('api/docs', app, document) 
  
  await app.listen(3000)  
  console.log('Service Desk API running on http://localhost:3000')  
}  
bootstrap() 
