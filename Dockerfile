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
COPY packages/shared/package.json packages/shared/package.json
COPY packages/validation/package.json packages/validation/package.json
COPY packages/database/package.json packages/database/package.json


RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM --platform=linux/amd64 node:18-alpine AS builder
WORKDIR /app

# Copy deps over
COPY --from=deps /app/packages/api/node_modules packages/api/node_modules
COPY --from=deps /app/packages/web/node_modules packages/web/node_modules 
COPY --from=deps /app/packages/env/node_modules packages/env/node_modules
COPY --from=deps /app/packages/shared/node_modules packages/shared/node_modules
COPY --from=deps /app/packages/validation/node_modules packages/validation/node_modules
COPY --from=deps /app/packages/database/node_modules packages/database/node_modules
COPY --from=deps /app/node_modules node_modules 

COPY . .

# Add NextJS environment variables here
ARG NEXT_PUBLIC_WEBSITE_URL

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


# Copy the VALIDATION package
COPY --from=builder /app/packages/validation/dist packages/validation
COPY --from=builder /app/packages/validation/package.json packages/validation/package.json
COPY --from=builder /app/packages/validation/node_modules packages/validation/node_modules


# Copy the SHARED package
COPY --from=builder /app/packages/shared/dist packages/shared
COPY --from=builder /app/packages/shared/package.json packages/shared/package.json
COPY --from=builder /app/packages/shared/node_modules packages/shared/node_modules

# Copy the DATABASE package
COPY --from=builder /app/packages/database/dist packages/database
COPY --from=builder /app/packages/database/package.json packages/database/package.json
COPY --from=builder /app/packages/database/node_modules packages/database/node_modules

# Copy the ROOT files 
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/node_modules node_modules

# Automatically leverage output traces to reduce image size # TODO
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./

# Copy built WEB / NEXTJS files, these will be cached by cloudfront
COPY --from=builder  --chown=nextjs:nodejs /app/packages/web/.next packages/web/.next
COPY --from=builder /app/packages/web/public packages/web/public

USER nextjs

EXPOSE 3000

ENV PORT 3000


# Running the app
CMD [ "yarn", "start" ]
