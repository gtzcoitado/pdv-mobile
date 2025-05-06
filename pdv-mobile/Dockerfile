# Usando Node oficial
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Desliga o CI-mode para CRA não falhar em warnings
ENV CI=false

# Gera o build
RUN npm run build

# Serve a pasta build
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
