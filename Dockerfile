FROM node:20-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat 

WORKDIR /app

# Required for workspaces setup
COPY yarn.lock package.json tsconfig.base.json ./

COPY packages/shared/ packages/shared/
COPY packages/env/ packages/env/
COPY packages/validation/ packages/validation/
COPY packages/web/ packages/web/

RUN yarn install --frozen-lockfile

# This ensures the directories exist if deps were hoisted for the next COPY step
RUN mkdir -p packages/shared/node_modules packages/env/node_modules packages/validation/node_modules packages/web/node_modules

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app

# Copy deps over if they exist, most should be @root
COPY --from=deps /app/packages/shared/ packages/shared/node_modules
COPY --from=deps /app/packages/env/ packages/env/node_modules 
COPY --from=deps /app/packages/validation/ packages/validation/node_modules
COPY --from=deps /app/packages/web/ packages/web/node_modules
COPY --from=deps /app/node_modules node_modules 

# Copy the rest of the files
COPY . . 

# Add NextJS environment variables here
ARG NEXT_PUBLIC_BASE_URL

# Build the app
RUN yarn build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the SHARED package
COPY --from=builder /app/packages/shared/dist packages/shared 
COPY --from=builder /app/packages/shared/package.json packages/shared/package.json
COPY --from=builder /app/packages/shared/node_modules packages/shared/node_module

# Copy the ENV package
COPY --from=builder /app/packages/env/dist packages/env 
COPY --from=builder /app/packages/env/package.json packages/env/package.json
COPY --from=builder /app/packages/env/node_modules packages/env/node_modules

# Copy the VALIDATION package
COPY --from=builder /app/packages/validation/dist packages/validation
COPY --from=builder /app/packages/validation/package.json packages/validation/package.json
COPY --from=builder /app/packages/validation/node_modules packages/validation/node_modules

# Coy the necessary ROOT files
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/yarn.lock yarn.lock
COPY --from=builder /app/node_modules node_modules

# Copy the WEB / NEXTJS files
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next packages/web/.next
COPY --from=builder /app/packages/web/public packages/web/public

# Install production dependencies
RUN yarn install --production --frozen-lockfile
# Automatically leverage output traces to reduce image size # TODO
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./

USER nextjs

EXPOSE 3000

ENV PORT 3000


# Running the app
CMD [ "yarn", "start:web" ]
