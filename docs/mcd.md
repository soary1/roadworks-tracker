# Modèle Conceptuel de Données (MCD)
## Roadworks Tracker - Suivi des travaux routiers

```mermaid
erDiagram
    ROLE {
        bigint id PK
        varchar libelle UK
    }

    STATUS_ACCOUNT {
        bigint id PK
        varchar libelle UK
    }

    STATUS_SIGNALEMENT {
        bigint id PK
        varchar libelle UK
    }

    CONFIG {
        bigint id PK
        int max_attempts
        int session_duration
    }

    TYPE_PROBLEM {
        bigint id PK
        text icone
        varchar libelle
    }

    COMPANY {
        bigint id PK
        varchar name
        varchar siret UK
        varchar address
        varchar phone
        varchar email
        timestamp created_at
    }

    ACCOUNT {
        bigint id PK
        varchar username UK
        varchar pwd
        bigint id_role FK
        timestamp created_at
        timestamp last_login
        boolean is_active
        boolean is_locked
        int attempts
        timestamp last_failed_login
    }

    ACCOUNT_STATUS {
        bigint id PK
        bigint id_account FK
        bigint id_status_account FK
        timestamp updated_at
    }

    SESSION {
        uuid id PK
        bigint id_account FK
        text token UK
        timestamp created_at
        timestamp expires_at
        varchar ip_address
        text user_agent
    }

    SIGNALEMENT {
        bigint id PK
        bigint id_account FK
        text descriptions
        timestamp created_at
        varchar location
        text picture
        numeric surface
        bigint id_type_problem FK
        varchar firebase_id UK
    }

    SIGNALEMENT_STATUS {
        bigint id PK
        bigint id_signalement FK
        bigint id_status_signalement FK
        timestamp updated_at
    }

    SIGNALEMENT_WORK {
        bigint id PK
        bigint id_signalement FK
        bigint id_company FK
        date start_date
        date end_date_estimation
        numeric price
        date real_end_date
    }

    SECURITY_LOG {
        bigint id PK
        varchar action
        bigint id_account FK
        varchar username
        varchar ip_address
        text user_agent
        timestamp created_at
        text details
    }

    %% Relations
    ROLE ||--o{ ACCOUNT : "possède"
    ACCOUNT ||--o{ SESSION : "a"
    ACCOUNT ||--o{ ACCOUNT_STATUS : "a historique"
    ACCOUNT ||--o{ SIGNALEMENT : "crée"
    ACCOUNT ||--o{ SECURITY_LOG : "génère"
    STATUS_ACCOUNT ||--o{ ACCOUNT_STATUS : "définit"
    TYPE_PROBLEM ||--o{ SIGNALEMENT : "catégorise"
    SIGNALEMENT ||--o{ SIGNALEMENT_STATUS : "a historique"
    SIGNALEMENT ||--o| SIGNALEMENT_WORK : "a travaux"
    STATUS_SIGNALEMENT ||--o{ SIGNALEMENT_STATUS : "définit"
    COMPANY ||--o{ SIGNALEMENT_WORK : "effectue"
```

## Légende des relations

| Relation | Description |
|----------|-------------|
| ROLE → ACCOUNT | Un rôle peut avoir plusieurs comptes (1:N) |
| ACCOUNT → SESSION | Un compte peut avoir plusieurs sessions actives (1:N) |
| ACCOUNT → SIGNALEMENT | Un compte peut créer plusieurs signalements (1:N) |
| SIGNALEMENT → SIGNALEMENT_STATUS | Un signalement a un historique de statuts (1:N) |
| SIGNALEMENT → SIGNALEMENT_WORK | Un signalement peut avoir des travaux associés (1:0..1) |
| COMPANY → SIGNALEMENT_WORK | Une entreprise peut effectuer plusieurs travaux (1:N) |

## Valeurs par défaut

### Rôles
- manager
- utilisateur
- visiteur

### Statuts de compte
- actif
- inactif
- suspendu

### Statuts de signalement
- nouveau
- en_cours
- resolu
- rejete

### Types de problèmes
- Nid de poule ⚠️
- Glissement de terrain 🚨
- Inondation 💧
- Effondrement de route 💥
- Travaux routiers 🚧
- Obstacle sur la route 🚷
- Marquage usé ❌
- Danger général ⚠️
