# 1) imagem base
FROM node:18-alpine

# 2) pasta de trabalho
WORKDIR /app

# 3) instalar só deps de produção
COPY package*.json ./
RUN npm ci --omit=dev

# 4) copiar o restante do código
COPY . .

# 5) desliga o CI-mode do CRA pra warnings não virarem erro
ENV CI=false

# 6) faz o build (aqui o CI=false entra em vigor)
RUN npm run build

# 7) instala o servidor estático
RUN npm install -g serve

# 8) expõe a porta que o Railway injeta
EXPOSE $PORT

# 9) serve o build na porta dinâmica
CMD ["sh","-c","serve -s build -l $PORT"]
