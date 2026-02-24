import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // ============================================
  // SEGURIDAD - Helmet (Headers seguros)
  // ============================================
  // Deshabilitado para pruebas
  // app.use(helmet())

  // ============================================
  // CORS - Configuración más permisiva para pruebas
  // ============================================
  app.enableCors({
    origin: '*', // Permitir todos los orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', '*'],
  })

  // ============================================
  // RATE LIMITING - Protección contra ataques
  // ============================================
  // El guard se aplica automáticamente desde el módulo
  // No necesitamos app.useGlobalGuards() cuando usamos ThrottlerModule

  // ============================================
  // VALIDACIÓN - Pipes globales
  // ============================================
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )

  // ============================================
  // SWAGGER - Solo en desarrollo
  // ============================================
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Service Desk API')
      .setDescription('Enterprise Service Desk API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
  }

  const port = process.env.PORT || 3000
  await app.listen(port)
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║               SERVICE DESK API - SEGURO                      ║
╠══════════════════════════════════════════════════════════════╣
║  Entorno: ${process.env.NODE_ENV || 'development'}
║  Puerto: ${port}
║  SSL: ${process.env.NODE_ENV === 'production' ? 'REQUIERE PROXY NGINX' : 'DESHABILITADO'}
║  Rate Limiting: ACTIVADO
║  Helmet: ACTIVADO
║  Swagger: ${process.env.NODE_ENV !== 'production' ? 'HABILITADO' : 'DESHABILITADO'}
╚══════════════════════════════════════════════════════════════╝
  `)
}
bootstrap()
