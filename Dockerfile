# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:18-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY yarn.lock package.json ./
COPY packages/api/package.json packages/api/package.json
COPY packages/web/package.json packages/web/package.json
COPY packages/infra/package.json packages/infra/package.json

RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app

# Copy deps over
COPY --from=deps /app/packages/api/node_modules packages/api/node_modules
COPY --from=deps /app/packages/web/node_modules packages/web/node_modules 
COPY --from=deps /app/packages/infra/node_modules packages/infra/node_modules
COPY --from=deps /app/node_modules node_modules 

COPY . .

RUN yarn build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# Copying public NextJS assets
COPY --from=builder /app/packages/web/public packages/web/public

# Copy API files that were built
# Modify the outDir tsconfig file in packages/api if you want to change this
COPY --from=builder /app/packages/api/dist packages/api

# Copy the package.json so that the API can be run
COPY --from=builder /app/packages/api/package.json packages/api/package.json

# And the node modules
COPY --from=builder /app/packages/api/node_modules packages/api/node_modules

# Copy starting scripts
COPY --from=builder /app/package.json package.json

# Copy root node modules
COPY --from=builder /app/node_modules node_modules

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./
# Copy built Nextjs files
COPY --from=builder  --chown=nextjs:nodejs /app/packages/web/.next packages/web/.next

USER nextjs

EXPOSE 3000

ENV PORT 3000


# Running the app
CMD [ "yarn", "start" ]
