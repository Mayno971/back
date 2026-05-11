import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS (dev)
  app.enableCors({
    origin: 'http://localhost:3000', // adapte si besoin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3050;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const server = await app.listen(port);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} déjà utilisé.`);
      process.exit(1);
    }
    throw error;
  });

  console.log(`✅ Server started on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Erreur au démarrage de l’application', err);
  process.exit(1);
});
