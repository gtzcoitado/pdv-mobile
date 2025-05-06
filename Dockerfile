FROM node:18-alpine
WORKDIR /app

# instala dependências (produção)
COPY package*.json ./
RUN npm ci --omit=dev

# copia todo o código
COPY . .

# desliga o CI-mode do CRA (warnings não viram erro)
ENV CI=false
# desativa totalmente o ESLint plugin do CRA
ENV DISABLE_ESLINT_PLUGIN=true

# gera o build (sem breaking por lint)
RUN npm run build

# instala servidor estático
RUN npm install -g serve

# expõe a porta dinâmica que o Railway vai injetar
EXPOSE $PORT

# serve o build na porta certa
CMD ["sh","-c","serve -s build -l $PORT"]
