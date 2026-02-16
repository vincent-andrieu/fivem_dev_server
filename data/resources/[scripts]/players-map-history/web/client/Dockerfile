FROM node:20-slim AS builder
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile 2>/dev/null || yarn install
COPY . .
RUN yarn build --configuration=production

FROM nginx:alpine
COPY --from=builder /app/dist/pmh-web-client/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
