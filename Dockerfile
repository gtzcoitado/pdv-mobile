FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# 🔥 impede que CRA trate warnings como erros
ENV CI=false

# gera o build
RUN npm run build

# instala servidor estático
RUN npm install -g serve

# expõe a porta que o Railway injetar
EXPOSE $PORT

# usa a porta dinâmica na hora de servir
CMD ["sh","-c","serve -s build -l $PORT"]
