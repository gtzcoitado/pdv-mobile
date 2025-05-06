FROM node:18-alpine
WORKDIR /app

# instala deps
COPY package*.json ./
RUN npm ci --omit=dev

# copia código e builda
COPY . .
RUN npm run build

# instala um servidor estático
RUN npm install -g serve

# instrui o container a usar qualquer PORT que o Railway passar
# (o shell vai expandir $PORT na hora do runtime)
EXPOSE $PORT
CMD ["sh","-c","serve -s build -l $PORT"]
