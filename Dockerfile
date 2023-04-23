# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
# Platform is needed when deploying with ARM macs locally c:
FROM --platform=linux/amd64 node:18-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat 

# These are needed due to a dependency in NX needing it -> node-gyp-build
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY yarn.lock package.json ./
COPY packages/api/package.json packages/api/package.json
COPY packages/web/package.json packages/web/package.json
COPY packages/env/package.json packages/env/package.json


RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM --platform=linux/amd64 node:18-alpine AS builder
WORKDIR /app

# Copy deps over
COPY --from=deps /app/packages/api/node_modules packages/api/node_modules
COPY --from=deps /app/packages/web/node_modules packages/web/node_modules 
COPY --from=deps /app/packages/env/node_modules packages/env/node_modules
COPY --from=deps /app/node_modules node_modules 

COPY . .

ARG NEXT_PUBLIC_WEBSITE_URL

## TODO Replace this
RUN yarn build


# Production image, copy all the files and run next
FROM --platform=linux/amd64 node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs



# Copy API files that were built
# Modify the outDir tsconfig file in packages/api if you want to change this
COPY --from=builder /app/packages/api/dist packages/api
COPY --from=builder /app/packages/api/package.json packages/api/package.json
COPY --from=builder /app/packages/api/node_modules packages/api/node_modules


# Copy the ENV package
COPY --from=builder /app/packages/env/dist packages/env
COPY --from=builder /app/packages/env/package.json packages/env/package.json
COPY --from=builder /app/packages/env/node_modules packages/env/node_modules


# Copy the root files 
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/node_modules node_modules

# Automatically leverage output traces to reduce image size # TODO
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./
# Copy built Nextjs files, these will be cached by cloudfront
COPY --from=builder  --chown=nextjs:nodejs /app/packages/web/.next packages/web/.next
COPY --from=builder /app/packages/web/public packages/web/public

USER nextjs

EXPOSE 3000

ENV PORT 3000


# Running the app
CMD [ "yarn", "start" ]
