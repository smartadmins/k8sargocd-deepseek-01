FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
#################
FROM node:18-alpine
COPY --from=builder /app /app
EXPOSE 3000
CMD ["npm", "start"]
