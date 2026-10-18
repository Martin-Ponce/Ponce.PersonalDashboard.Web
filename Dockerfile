ARG NODE_VERSION=24.15.0-alpine
ARG NGINX_VERSION=alpine3.22

# ---------- Build ----------
FROM node:${NODE_VERSION} AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build


# ---------- Serve ----------
FROM docker.io/nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runner

USER root

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/*/browser/ /usr/share/nginx/html/

# env.sh rewrites these at start as the nginx user.
RUN mkdir -p /usr/share/nginx/html/assets && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 775 /usr/share/nginx/html

# Entrypoint hook; sed strips Windows line endings.
COPY --chmod=755 env.sh /docker-entrypoint.d/40-env.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-env.sh

USER nginx

EXPOSE 4000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
