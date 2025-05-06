# 1. Base image
FROM node:18-alpine

# 2. Diretório de trabalho
WORKDIR /app

# 3. Copiar package.json e lockfile e instalar deps
COPY package*.json ./
RUN npm ci --omit=dev

# 4. Copiar o restante do código
COPY . .

# 5. DESABILITAR CI PARA CRA NÃO TRATAR WARNINGS COMO ERROS
ENV CI=false

# 6. Build da aplicação
RUN npm run build

# 7. Instalar o servidor estático
RUN npm install -g serve

# 8. Expor a PORT dinâmica que o Railway define
EXPOSE $PORT

# 9. Comando de inicialização usando a porta correta
CMD ["sh","-c","serve -s build -l $PORT"]
