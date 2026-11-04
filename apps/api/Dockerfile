# Build from the repo root:  docker build -f apps/api/Dockerfile .
FROM node:22-alpine AS base
RUN apk add --no-cache openssl && corepack enable
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @aparts/shared build && pnpm --filter api build
# Copy the api package + production deps (incl. @aparts/shared) into /out
RUN pnpm --filter api deploy --prod /out && cd /out && npx prisma generate

FROM node:22-alpine AS runtime
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /out .
EXPOSE 3000
# Apply pending migrations, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
