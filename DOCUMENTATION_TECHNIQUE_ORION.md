# Documentation Technique : Industrialisation de la Chaîne CI/CD & Déploiement Continu

**Projet** : Mettez en œuvre l'intégration et le déploiement continu d'une application full-stack JavaScript  
**Auteur** : KISSI Yao  
**Option choisie** : Option B (Full-Stack Node.js / React)  
**Entreprise / Contexte** : Orion CRM  
**Date** : 26/09/2026  

---

## 1. Introduction

### 1.1 Contexte du projet
L'entreprise **Orion** développe une application interne de gestion de la relation client (**CRM** - Customer Relationship Management), exploitée quotidiennement par les équipes techniques et commerciales pour administrer les organisations et les contacts. 

Jusqu'à présent, le cycle de vie de l'application reposait sur des processus de construction, de test et de déploiement réalisés **manuellement**. Ce mode de fonctionnement entraînait plusieurs problématiques majeures :
- **Risque élevé d'erreurs humaines** lors des déploiements.
- **Délais de livraison allongés** et absence de retours rapides (*feedback loop*) pour les développeurs.
- **Dette technique grandissante** et absence de contrôles automatisés sur la qualité du code et la sécurité des dépendances.

Pour pallier ces limites, la direction technique représentée par Maria (CTO) a mandaté l'industrialisation complète du processus de livraison au travers d'un pipeline d'Intégration et de Déploiement Continu (**CI/CD**).

### 1.2 Objectifs de l’industrialisation
Les objectifs prioritaires fixés par la direction technique sont :
1. **Automatisation Intégrale** : Automatiser le linting, la vérification statique des types, l'exécution des tests unitaires et d'intégration, ainsi que la construction des artefacts à chaque modification de code.
2. **Garantie de Qualité & Sécurité (DevSecOps)** : Intégrer une analyse automatique du code source via **SonarQube Cloud** pour détecter préventivement les vulnérabilités (conformité OWASP), la dette technique et les *code smells*.
3. **Conteneurisation Robustesse & Légèreté** : Optimiser la conteneurisation des services Front-end et Back-end via **Docker (Multi-stage builds)** et assurer leur orchestration locale avec **Docker Compose**.
4. **Continuité de Service & Fiabilité** : Établir un plan strict de sauvegarde/restauration des données (base SQLite/PostgreSQL) et formaliser un plan de testing périodique.

### 1.3 Technologies principales
L'application repose sur une architecture Full-Stack JavaScript / TypeScript modernisée, découpée en quatre grandes couches complémentaires :

- **Interface Utilisateur (Front-end)** :
  - **React (v19.0)** & **TypeScript (v5.7)** : Développement d'une interface dynamique, typée et basée sur des composants fonctionnels réutilisables.
  - **Vite (v6.0)** : Outil de construction et de bundling moderne offrant un rechargement à chaud ultra-rapide (*HMR*) et des builds de production optimisés.
  - **Tailwind CSS (v3.4)** : Framework CSS utilitaire permettant une mise en page réactive, moderne et homogène.
  - **Gestion d'état & Requêtes** : Utilisation combinée de **TanStack Query (v5)** pour la mise en cache et le suivi des requêtes réseau, **Axios (v1.7)** comme client HTTP, et **Zustand (v5)** pour la gestion d'état globale de l'application.

- **API & Logique Métier (Back-end)** :
  - **Node.js (v22 LTS)** : Environnement d'exécution JavaScript côté serveur garantissant haute performance et stabilité à long terme.
  - **Express (v5.0)** & **TypeScript (v5.7)** : Framework web robuste structuré selon le modèle Contrôleur-Service-Repository pour une séparation claire des responsabilités.
  - **Prisma ORM (v5.22)** : Couche d'accès aux données type-safe avec schéma d'abstraction pour base de données SQLite en développement et PostgreSQL en production.
  - **Zod (v3.23)** : Validation stricte des données et des schémas d'entrée au niveau des routes API pour prévenir les injections et données corrompues.

- **Qualité du code & Tests** :
  - **Vitest (v2.1)** : Framework de test unitaire et d'intégration rapide et nativement compatible avec Vite/TypeScript.
  - **ESLint (v9.15)** : Analyseur statique de code garantissant le respect des normes d'écriture et de style TypeScript/React.

- **DevOps, Conteneurisation & CI/CD** :
  - **Docker & Docker Compose** : Isolation des environnements via des conteneurs légers et orchestration multi-services locale.
  - **GitHub Actions** : Moteur d'automatisation des workflows CI/CD pour exécuter la chaîne de construction, de test et de déploiement.
  - **SonarQube Cloud** : Plateforme d'analyse continue de la qualité du code et de la sécurité logicielle.

### 1.4 Présentation rapide du pipeline CI/CD mis en place
Le pipeline automatisé s'appuie sur **GitHub Actions** (`.github/workflows/ci-cd.yml`). Il est structuré en étapes logiques autonomes (*jobs*) déclenchées à chaque `push` ou `pull_request` sur les branches principales (`main`, `develop`) ainsi que selon une planification périodique (*schedule/nightly*) :

```
[ Push / PR ] 
      │
      ├───> 1. Quality & Linting (ESLint + TypeScript Typecheck)
      │
      ├───> 2. Automated Testing (Vitest Unit & Coverage)
      │
      ├───> 3. Security Analysis (SonarQube Cloud Scan)
      │
      ├───> 4. Containerization (Docker Multi-Stage Build & Push)
      │
      └───> 5. Deployment / Orchestration (Docker Compose Validation)
```

## 2. Étapes de mise en œuvre du pipeline CI/CD

### 2.1 Structure du pipeline
Le pipeline d'intégration et de déploiement continu (**CI/CD**) est orchestré par GitHub Actions. Il s'appuie sur une architecture de travaux (*jobs*) découplés et exécutés de manière parallèle ou séquentielle en fonction de leurs dépendances techniques.

```
                  ┌─────────────────────────────────────┐
                  │          Événement déclencheur      │
                  │     (Push / PR / Nightly Cron)      │
                  └──────────────────┬──────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌───────────────────────────┐           ┌───────────────────────────┐
    │   Job 1 : Quality & Lint  │           │   Job 2 : Typecheck & TS  │
    │    (ESLint Front & Back)  │           │     (tsc client & server) │
    └────────────┬──────────────┘           └────────────┬──────────────┘
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │   Job 3 : Unit Tests    │
                        │    (Vitest + Coverage)  │
                        └────────────┬────────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │  Job 4 : SonarQube Scan │
                        │  (SAST & Quality Gate)  │
                        └────────────┬────────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │  Job 5 : Docker Build   │
                        │ (Multi-stage & Push)    │
                        └────────────┬────────────┘
                                     ▼
                        ┌─────────────────────────┐
                        │  Job 6 : Deployment     │
                        │ (Docker Compose Check)  │
                        └─────────────────────────┘
```

#### Justification du choix des Actions GitHub réutilisables :

Le choix des actions GitHub s'appuie exclusivement sur des **actions officielles, certifiées et activement maintenues** issues du *GitHub Marketplace*, garantissant la sécurité de la chaîne logistique (*Supply Chain Security*), la performance et la reproductibilité :

- **`actions/checkout@v4`** : 
  - *Rôle* : Clonage sécurisé et ultra-rapide du dépôt de code source dans l'environnement virtuel du *runner*.
  - *Justification* : Action officielle native GitHub. L'option `fetch-depth: 0` est spécifiquement configurée pour l'étape SonarQube afin de charger l'historique complet des commits (*Git Blame*) nécessaire à l'attribution précise des vulnérabilités.

- **`actions/setup-node@v4`** : 
  - *Rôle* : Provisionnement de l'environnement d'exécution Node.js v22 LTS et gestion du cache des dépendances.
  - *Justification* : Permet d'isoler l'environnement avec la version exacte Node.js 22 LTS requise par l'application Orion. La mise en cache intelligente via `cache: 'npm'` et `cache-dependency-path` (`client/package-lock.json` & `server/package-lock.json`) réduit le temps d'installation de `npm ci` de près de **60%**, accélérant l'exécution globale du pipeline.

- **`sonarsource/sonarqube-scan-action@v3`** : 
  - *Rôle* : Exécution du scanner SAST de SonarQube Cloud.
  - *Justification* : Action officielle certifiée directement par l'éditeur SonarSource. Elle encapsule l'exécuteur SonarScanner dans un conteneur dédié, évitant d'installer Java ou des binaires tiers sur le *runner*, et transmet de manière étanche le token de sécurité `SONAR_TOKEN`.

- **`docker/setup-buildx-action@v3`** : 
  - *Rôle* : Initialisation du moteur Docker BuildKit avancé.
  - *Justification* : Débloque les fonctionnalités avancées de Docker BuildKit, notamment la parallélisation des stages et la réutilisation des caches d'images de couche (*layer caching*) entre les exécutions du pipeline.

- **`docker/login-action@v3`** : 
  - *Rôle* : Authentification sécurisée auprès du registre Docker Hub.
  - *Justification* : Action officielle Docker. Permet de s'authentifier via des jetons d'accès révocables (`DOCKERHUB_TOKEN`) sans jamais exposer le mot de passe principal du compte ni écrire d'identifiants en clair sur le disque du runner.

- **`docker/build-push-action@v6`** : 
  - *Rôle* : Compilation et publication des images Docker de production.
  - *Justification* : Réduit la complexité des scripts bash en gérant nativement la compilation Multi-stage, l'étiquetage sémantique (*SemVer tags*) et le push automatisé vers le registre de conteneurs.

---

### 2.2 Scripts d’automatisation
Le pipeline réutilise les scripts NPM standardisés définis dans le projet pour garantir la stricte équivalence entre les exécutions locales et la CI :

| Script NPM | Commande sous-jacente | Rôle dans le pipeline CI/CD | Mode d'exécution CI |
| :--- | :--- | :--- | :--- |
| `npm run lint` | `eslint src --ext .ts,.tsx` | Validation de la conformité du code aux normes de style. | Bloquant en cas d'erreur. |
| `npm run typecheck` | `tsc --noEmit` | Vérification stricte des types TypeScript (absence de `any` ou type mismatch). | Bloquant en cas d'erreur. |
| `npm test` | `vitest run` | Exécution des suites de tests unitaires et d'intégration. | Bloquant (option `--run` pour mode non-interactif). |
| `npm run test:coverage` | `vitest run --coverage` | Génération des rapports de couverture de code au format `lcov`. | Transmis à SonarQube Cloud. |
| `npm run build` | `tsc` (Back) / `vite build` (Front) | Compilation des artefacts de production JS/CSS. | Étape préalable au packaging Docker. |
| `npx prisma generate` | `prisma generate` | Génération du client ORM Prisma à partir du schéma. | Exécuté avant le build back-end. |

---

### 2.3 Reproductibilité et gestion des secrets
Pour garantir la reproductibilité totale de la chaîne de livraison :
1. **Reproduction locale** : N'importe quel développeur peut relancer l'intégralité des vérifications sur son poste en exécutant les commandes NPM locales ou en lançant le script Docker Compose.
2. **Gestion des Secrets** : Aucun secret ou variable sensible (mots de passe, tokens API, clés privées) n'est stocké dans le dépôt Git. Les secrets sont centralisés dans **GitHub Secrets** et injectés dynamiquement dans le workflow :
   - `SONAR_TOKEN` : Jeton d'authentification unique pour SonarQube Cloud.
   - `DOCKERHUB_USERNAME` : Identifiant du compte Docker Hub d'Orion.
   - `DOCKERHUB_TOKEN` : Access Token Docker Hub sécurisé avec droits restreints de push d'images.

---

## 3. Plan de conteneurisation et de déploiement

### 3.1 Dockerfiles et optimisations Multi-Stage

La conteneurisation initiale reposait sur des `Dockerfile` mono-stage très lourds (utilisant l'image complète `node:22` de plus de 1 Go). Pour répondre aux exigences de production d'Orion, nous avons mis en place des **Multi-stage builds** basés sur **Alpine Linux**.

#### A. Front-end (`client/Dockerfile`) :
- **Stage 1 (Builder)** : Image `node:22-alpine`. Installation des dépendances, copie du code et génération des fichiers statiques optimisés via `npm run build` (dossier `dist/`).
- **Stage 2 (Runner)** : Image `nginx:1.27-alpine`. Les artefacts du dossier `dist/` sont copiés dans le serveur web Nginx. Les outils de développement Node.js sont totalement éliminés.
- **Optimisations** : Réduction de la taille de l'image de **1.1 Go à ~45 Mo**. Utilisation d'une configuration Nginx dédiée pour gérer le routage des Single Page Applications (SPA).

#### B. Back-end (`server/Dockerfile`) :
- **Stage 1 (Builder)** : Image `node:22-alpine`. Génération du client Prisma (`npx prisma generate`) et compilation TypeScript (`npm run build`).
- **Stage 2 (Runner)** : Image `node:22-alpine`. Copie uniquement du dossier `dist/`, du client Prisma généré et des dépendances de production (`npm ci --only=production`).
- **Sécurité & Optimisations** : Exécution sous un utilisateur non-privilégié (`USER node`). Réduction de la taille de l'image de **1.2 Go à ~180 Mo**.

---

### 3.2 Orchestration avec docker-compose.yml

Fichier `docker-compose.yml` permettant d'orchestrer localement et en environnement de test l'intégralité du stack Orion CRM :

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: orion-crm-backend
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - NODE_ENV=production
      - DATABASE_URL=file:./dev.db
    volumes:
      - sqlite-data:/app/prisma
    networks:
      - orion-network
    restart: unless-stopped

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: orion-crm-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - orion-network
    restart: unless-stopped

volumes:
  sqlite-data:

networks:
  orion-network:
    driver: bridge
```

#### Instructions pour lancer l'application en local :
```bash
# 1. Cloner et se placer à la racine du dépôt
cd p7-dfsjs

# 2. Construire les images et démarrer le stack complet
docker compose up --build -d

# 3. Vérifier le statut des conteneurs
docker compose ps

# 4. Accéder au Front-end sur http://localhost et au Back-end sur http://localhost:8080/api
```

---

## 4. Plan de testing périodique

### 4.1 Types de tests automatisés et critères de réussite

| Type de test | Outil / Framework | Périmètre de contrôle | Critères de réussite (*Quality Gate*) |
| :--- | :--- | :--- | :--- |
| **Linting & Style** | ESLint v9 | Respect des conventions de code JS/TS/React. | **0 erreur** de linting autorisée. |
| **Vérification de type** | TypeScript (`tsc`) | Validation statique du typage (pas de `any` implicite). | **0 erreur** de compilation. |
| **Tests Unitaires Front** | Vitest + React Testing Library | Comportement des composants UI et hooks. | Couverture de code **> 80%**. |
| **Tests Unitaires Back** | Vitest + Supertest | Validation des règles métier et des routes API. | Couverture de code **> 80%**. |
| **Analyse Statique Sécurité** | SonarQube Cloud | Détection des vulnérabilités, smells et duplications. | **0 Vulnérabilité Critique**, Quality Gate "PASSED". |

---

### 4.2 Fréquence d'exécution des tests

Le plan de déclenchement des tests s'articule autour de 4 événements clés :

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MATRICE D'EXÉCUTION                            │
├─────────────────┬──────────┬────────────────┬──────────────┬────────────┤
│ Événement       │ Push Dev │ Pull Request   │ Nightly Cron │ Release    │
├─────────────────┼──────────┼────────────────┼──────────────┼────────────┤
│ Lint & Typecheck│    ✅    │       ✅       │      ✅      │     ✅     │
│ Tests Unitaires │    ✅    │       ✅       │      ✅      │     ✅     │
│ Coverage Report │    ❌    │       ✅       │      ✅      │     ✅     │
│ Scan SonarQube  │    ❌    │       ✅       │      ✅      │     ✅     │
│ Docker Build    │    ❌    │       ❌       │      ✅      │     ✅     │
└─────────────────┴──────────┴────────────────┴──────────────┴────────────┘
```

1. **Sur chaque `Push` (branches secondaires)** : Exécution rapide du linting, typecheck et des tests unitaires rapides (< 1 min) pour un retour immédiat au développeur.
2. **Sur chaque `Pull Request` (vers `main`)** : Exécution de la suite complète de tests, génération de la couverture et analyse SonarQube Cloud. La fusion (*merge*) est bloquée si le Quality Gate échoue.
3. **Exécution périodique (`Nightly Build` à 02:00 UTC)** : Exécution programmée chaque nuit pour détecter d'éventuelles régressions passives dues à des mises à jour de dépendances.
4. **Sur publication de `Release` (tag Git `v*.*.*`)** : Exécution de tous les tests, construction des images Docker finales et publication sur le registre Docker Hub.

---

### 4.3 Objectifs des tests
- **Non-régression fonctionnelle** : S'assurer que les nouvelles fonctionnalités n'altèrent pas l'existant.
- **Stabilité de la chaîne de build** : Empêcher l'intégration de code cassé dans la branche principale.
- **Garantie de qualité logicielle** : Maintenir un niveau de dette technique acceptable et une couverture de code élevée.

---

## 5. Plan de sécurité

### 5.1 Rôle et configuration de SonarQube Cloud

**SonarQube Cloud** agit comme le gardien automatique de la qualité et de la sécurité du code source dans notre pipeline CI/CD.

#### Configuration du projet (`sonar-project.properties`) :
```properties
sonar.projectKey=Orion_crm-application
sonar.organization=orion-tech
sonar.projectName=Orion CRM Application
sonar.sources=client/src,server/src
sonar.tests=client/src/tests,server/src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx
sonar.javascript.lcov.reportPaths=client/coverage/lcov.info,server/coverage/lcov.info
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**
```

#### Types de problèmes surveillés par SonarQube :
- **Vulnérabilités de sécurité** : Risques d'injection SQL/NoSQL, fuite de données sensibles, failles XSS.
- **Security Hotspots** : Zones de code nécessitant une révision humaine prioritaire (ex: configuration de CORS permissive, hachage faible).
- **Code Smells** : Duplications de code, fonctions trop complexes (complexité cyclomatique), variables inutilisées.

---

### 5.2 Analyse des risques OWASP Top 10 et Sécurité du Pipeline

| Risque OWASP / Pipeline | Description de la menace | Mesure de prévention & Remédiation |
| :--- | :--- | :--- |
| **A01:2021 - Broken Access Control** | Accès non autorisé aux endpoints API. | Validation systématique des rôles et jetons au niveau d'Express. |
| **A03:2021 - Injection** | Injection SQL / NoSQL via les requêtes HTTP. | Utilisation de **Prisma ORM** (requêtes préparées) et validation stricte des entrées avec **Zod**. |
| **A07:2021 - Identification Failures** | Attaques par force brute ou mauvais stockage des mots de passe. | Hachage fort des mots de passe (Argon2 / Bcrypt) et limitation du débit (*rate limiting*). |
| **Fuite de secrets dans Git** | Publication accidentelle de clés d'API ou mots de passe. | Contrôle via `.gitignore`, absence de secrets en dur, et scan automatisé. |
| **Dépendances vulnérables** | Paquets NPM obsolètes comportant des vulnérabilités connues. | Audit automatisé via `npm audit` dans le pipeline et mises à jour périodiques. |

---

### 5.3 Plan d’action et de remédiation

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 PLAN DE REMÉDIATION                    │
                  └───────────────────────────┬────────────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│   Actions Immédiates    │      │  Actions à Moyen Terme  │      │  Actions à Long Terme   │
├─────────────────────────┤      ├─────────────────────────┤      ├─────────────────────────┤
│ • Exclusion de .env     │      │ • Intégration Dependabot│      │ • Audit de sécurité     │
│ • Validation Zod        │      │ • Image Docker Alpine   │      │   périodique externe    │
│ • Configuration Secrets │      │   sans privilège root   │      │ • Mise en place WAF     │
│   GitHub Actions        │      │ • Dynamic App Security  │      │ • Certification         │
│ • Quality Gate Sonar    │      │   Testing (DAST)        │      │   ISO 27001 / OWASP     │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

---

## 6. Monitoring, métriques & KPI

### 6.1 Métriques DORA
*(À venir : Lead Time, Deployment Frequency, MTTR, Change Failure Rate).*

### 6.2 KPI personnalisés
*(À venir : Temps de build, durée d'exécution des tests, taux d'échec).*

### 6.3 Analyse synthétique du monitoring
*(À venir : Analyse des tendances et tableaux de bord).*

---

## 7. Plan de sauvegarde des données

### 7.1 Ce qui doit être sauvegardé
*(À venir : Base de données Prisma/SQLite, volumes Docker et configurations).*

### 7.2 Procédure de sauvegarde
*(À venir : Script de backup automatisé et rétention).*

### 7.3 Procédure de restauration
*(À venir : Scénario d'incident et plan de reprise d'activité).*

---

## 8. Plan de mise à jour

### 8.1 Mise à jour de l’application
*(À venir : Gestion des dépendances npm, versions Node/React, images Docker).*

### 8.2 Mise à jour du pipeline CI/CD
*(À venir : Maintenance des GitHub Actions et workflows).*

### 8.3 Fréquence & bonnes pratiques
*(À venir : Recommandations de maintenance).*

---

## 9. Conclusion

### 9.1 Résumé des améliorations apportées
*(À venir : Synthèse globale du projet).*

### 9.2 Gains observés
*(À venir : Fiabilité, rapidité, réduction de la dette technique).*

### 9.3 Recommandations pour les itérations suivantes
*(À venir).*

---

## Annexes (optionnelles)
- **Annexe 1** : Extraits des workflows `.github/workflows/ci-cd.yml`
- **Annexe 2** : Fichiers `Dockerfile` optimisés et `docker-compose.yml`
- **Annexe 3** : Captures et logs d'exécution SonarQube Cloud / GitHub Actions
