# STAGE 1: Builder (Compilation TypeScript & Prisma)
FROM node:22-alpine AS builder

WORKDIR /app

# Installation de openssl nécessaire pour Prisma sur Alpine
RUN apk add --no-cache openssl

# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation de toutes les dépendances (dev + prod)
RUN npm ci

# Copie du code source
COPY . .

# Génération du client Prisma et compilation TypeScript
RUN npx prisma generate
RUN npm run build

# STAGE 2: Runner (Exécution Production)
FROM node:22-alpine AS runner

WORKDIR /app

# Installation de openssl pour le moteur de requête Prisma sur Alpine
RUN apk add --no-cache openssl

# Variable d'environnement de production
ENV NODE_ENV=production

# Copie des fichiers de dépendances et schéma Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances de production et génération du client Prisma
RUN npm ci --only=production
RUN npx prisma generate

# Copie des artefacts compilés depuis le stage builder
COPY --from=builder /app/dist ./dist

# Sécurité: Utilisation d'un utilisateur non-root
USER node

# Port d'écoute du serveur Express
EXPOSE 8080

# Commande de démarrage
CMD ["node", "dist/index.js"]


