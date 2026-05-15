import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module'; // Assurez-vous que le chemin est correct
import { UsersModule } from './users/users.module'; // Assurez-vous que le chemin est correct
import { EventsModule } from './events/events.module';
import { Event } from './events/event.entity';
import { User } from './users/user.entity'; // Assurez-vous que le chemin est correct

@Module({
  imports: [
    // 1. Configuration pour les variables d'environnement (.env)
    ConfigModule.forRoot({
      isGlobal: true, // Rend le module de config disponible partout
    }),

    // 2. Configuration de la connexion à la base de données
    TypeOrmModule.forRoot({
      type: 'sqlite', // Type de base de données
      database: 'db.sqlite', // Nom du fichier de la base de données
      entities: [Event, User], // Liste de toutes vos entités
      synchronize: true, // IMPORTANT: Crée/met à jour le schéma de la BDD automatiquement. Uniquement pour le développement !
    }),

    // 3. Import des modules de votre application
    AuthModule,
    UsersModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
