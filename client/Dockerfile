# STAGE 1: Builder (Compilation React avec Vite)
FROM node:22-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY . .

# Compilation du Front-end pour la production (dossier dist/)
RUN npm run build

# STAGE 2: Runner (Serveur Web Nginx Production)

FROM nginx:1.27-alpine AS runner

# Copie des fichiers statiques compilés depuis le builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie de la configuration Nginx personnalisée pour SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposition du port web HTTP standard
EXPOSE 80

# Lancement du serveur Nginx en mode premier plan
CMD ["nginx", "-g", "daemon off;"]

