# Backend - API REST Spring Boot

## Description

Le backend est une API REST développée avec Spring Boot qui gère l'authentification, les signalements de voirie, la synchronisation avec Firebase et les notifications temps réel.

## Technologies Utilisées

| Technologie | Version | Description |
|-------------|---------|-------------|
| Spring Boot | 3.2.5 | Framework Java |
| Java | 17 | Langage de programmation |
| PostgreSQL | 14 | Base de données relationnelle |
| Firebase Admin SDK | 9.2.0 | Gestion Firebase |
| Swagger/OpenAPI | 2.3.0 | Documentation API |
| Spring WebSocket | - | STOMP pour temps réel |
| Lombok | - | Réduction du boilerplate |
| JPA/Hibernate | - | ORM |

## Structure du Projet

```
backend/
├── src/main/java/itu/cloud/roadworks/
│   ├── api/                        # Contrôleurs REST
│   │   ├── AuthApi.java           # Endpoints authentification
│   │   ├── SignalementApi.java    # Endpoints signalements
│   │   └── CompanyApi.java        # Endpoints entreprises
│   ├── config/                     # Configuration
│   │   ├── CorsConfig.java        # Configuration CORS
│   │   ├── FirebaseConfig.java    # Configuration Firebase
│   │   ├── OpenApiConfig.java     # Configuration Swagger
│   │   └── WebSocketConfig.java   # Configuration WebSocket
│   ├── model/                      # Entités JPA
│   │   ├── Account.java           # Comptes utilisateurs
│   │   ├── Company.java           # Entreprises
│   │   ├── Signalement.java       # Signalements
│   │   ├── SignalementWork.java   # Travaux de réparation
│   │   ├── SignalementStatus.java # Historique statuts
│   │   ├── Role.java              # Rôles utilisateurs
│   │   ├── Session.java           # Sessions actives
│   │   ├── SecurityLog.java       # Journaux de sécurité
│   │   ├── TypeProblem.java       # Types de problèmes
│   │   └── Config.java            # Configuration système
│   ├── dto/                        # Objets de transfert
│   │   ├── AuthResponse.java
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── SignalementDto.java
│   │   └── SignalementNotification.java
│   ├── service/                    # Logique métier
│   │   ├── AuthService.java       # Authentification
│   │   ├── SignalementService.java # Gestion signalements
│   │   ├── FirebaseService.java   # Intégration Firebase
│   │   ├── FirebaseListenerService.java
│   │   ├── SecurityLogService.java # Journalisation
│   │   └── NotificationService.java # Notifications
│   ├── repository/                 # Accès données
│   │   └── [Interfaces Repository]
│   └── RoadworksApplication.java   # Point d'entrée
├── src/main/resources/
│   ├── application.properties      # Configuration
│   └── firebase-key.json           # Clé Firebase
└── pom.xml
```

## Endpoints API

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/login` | Connexion utilisateur | Non |
| POST | `/register` | Inscription | Non |
| POST | `/logout` | Déconnexion | Oui |
| GET | `/validate` | Valider token JWT | Oui |
| GET | `/roles` | Liste des rôles | Non |
| GET | `/users` | Liste utilisateurs Firebase | Oui |
| POST | `/import-firebase` | Importer utilisateurs Firebase | Oui |
| PUT | `/users/{userId}` | Modifier utilisateur | Oui |
| POST | `/users/{uid}/unlock` | Débloquer compte | Oui |

### Signalements (`/api/signalements`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Tous les signalements | Oui |
| GET | `/{id}` | Signalement par ID | Oui |
| GET | `/status/{status}` | Filtrer par statut | Oui |
| PUT | `/{id}/status` | Mettre à jour statut | Oui |
| POST | `/{id}/work` | Ajouter travaux | Oui |
| POST | `/sync/firebase` | Synchroniser depuis Firebase | Oui |
| POST | `/{id}/sync/firebase` | Sync un signalement vers Firebase | Oui |

### Entreprises (`/api/companies`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste entreprises | Oui |
| GET | `/{id}` | Détail entreprise | Oui |
| POST | `/` | Créer entreprise | Oui |
| PUT | `/{id}` | Modifier entreprise | Oui |
| DELETE | `/{id}` | Supprimer entreprise | Oui |

## Installation

### Prérequis

- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Firebase Project avec clé de service

### Configuration

1. **Base de données PostgreSQL**

```sql
CREATE DATABASE roadworks_tracker;
```

2. **Fichier application.properties**

```properties
# Base de données
spring.datasource.url=jdbc:postgresql://localhost:5432/roadworks_tracker
spring.datasource.username=postgres
spring.datasource.password=votre_mot_de_passe

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

# Firebase
firebase.credentials.path=src/main/resources/firebase-key.json

# Server
server.port=8080
```

3. **Clé Firebase**

Placer le fichier `firebase-key.json` dans `src/main/resources/`

### Démarrage

```bash
# Avec Maven
mvn spring-boot:run

# Ou compiler et exécuter
mvn clean package
java -jar target/roadworks-0.0.1-SNAPSHOT.jar
```

## Schéma de Base de Données

### Tables Principales

| Table | Description |
|-------|-------------|
| `role` | Rôles (manager, utilisateur, visiteur) |
| `account` | Comptes utilisateurs |
| `session` | Sessions JWT actives |
| `account_status` | Statut des comptes |
| `company` | Entreprises de travaux |
| `signalement` | Signalements de problèmes |
| `signalement_work` | Travaux effectués |
| `signalement_status` | Historique des statuts |
| `status_signalement` | Enum des statuts |
| `type_problem` | Types de problèmes |
| `security_log` | Journaux de sécurité |
| `config` | Configuration système |

### Comptes par Défaut

| Username | Password | Rôle |
|----------|----------|------|
| manager | admin123 | manager |
| admin | admin123 | manager |

## Sécurité

### Authentification JWT

- Tokens signés avec clé secrète
- Expiration configurable
- Stockage en base de données

### Verrouillage de Compte

- Compte verrouillé après 5 tentatives échouées
- Déblocage manuel par administrateur

### Journalisation

Toutes les actions sont enregistrées avec :
- Adresse IP
- User-Agent
- Timestamp
- Type d'action
- Résultat

## WebSocket

### Configuration STOMP

```
Endpoint: /api/ws
Fallback: SockJS
```

### Topics

| Topic | Description |
|-------|-------------|
| `/topic/signalements` | Nouveaux signalements |
| `/topic/notifications` | Notifications générales |

## Documentation API

Swagger UI disponible à : `http://localhost:8080/swagger-ui.html`

## Docker

### Dockerfile

```dockerfile
FROM maven:3.8-openjdk-17
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/roadworks-0.0.1-SNAPSHOT.jar"]
```

### Docker Compose

```yaml
backend:
  build: ./backend
  ports:
    - "8080:8080"
  environment:
    - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/roadworks_tracker
    - SPRING_DATASOURCE_USERNAME=postgres
    - SPRING_DATASOURCE_PASSWORD=password
  depends_on:
    - postgres
  volumes:
    - ./firebase-key.json:/app/firebase-key.json
```

## Tests

```bash
# Exécuter les tests
mvn test

# Tests avec couverture
mvn test jacoco:report
```

## Services Principaux

### AuthService

- Authentification utilisateurs
- Gestion des sessions
- Verrouillage/déblocage de comptes
- Intégration Firebase Auth

### SignalementService

- CRUD signalements
- Gestion des statuts
- Synchronisation Firebase
- Assignation des travaux

### FirebaseService

- Gestion utilisateurs Firebase
- Synchronisation Firestore
- Notifications push

### NotificationService

- Envoi notifications temps réel
- Alertes WebSocket

## Statuts des Signalements

| Statut | Description |
|--------|-------------|
| `nouveau` | Signalement créé |
| `en_cours` | Pris en charge |
| `resolu` | Problème résolu |
| `rejete` | Signalement rejeté |

## Types de Problèmes

| ID | Type |
|----|------|
| 1 | Nid de poule |
| 2 | Inondation |
| 3 | Fissure |
| 4 | Effondrement |
| 5 | Signalisation endommagée |
| 6 | Éclairage défectueux |
| 7 | Débris sur la route |
| 8 | Autre |

## Logs

Les logs sont configurés pour afficher :
- Requêtes HTTP
- Requêtes SQL
- Erreurs de sécurité
- Actions utilisateur
