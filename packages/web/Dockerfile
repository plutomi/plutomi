# # TODO: Add node prune https://x.com/alistaiir/status/1747397250085536097?s=46

FROM node:20.2.0-alpine3.18 as base
FROM base as deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM deps AS prod-deps
WORKDIR /app
RUN npm install --production

FROM base as runner
WORKDIR /app

RUN npm install -g tsx


RUN addgroup --system --gid 1001 remix
RUN adduser --system --uid 1001 remix
USER remix

EXPOSE 3000

COPY --from=prod-deps --chown=remix:remix /app/package*.json ./
COPY --from=prod-deps --chown=remix:remix /app/node_modules ./node_modules
COPY --from=builder --chown=remix:remix /app/build ./build
COPY --from=builder --chown=remix:remix /app/public ./public

# Running the express app
COPY --from=builder --chown=remix:remix /app/server.ts ./server.ts


ENTRYPOINT [ "npm", "run", "start" ]
