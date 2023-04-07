# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:18-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY yarn.lock package.json ./
COPY packages/api/package.json packages/api/package.json
COPY packages/web/package.json packages/web/package.json

RUN yarn install --frozen-lockfile

RUN echo "TESTING DIRS\n\n\n"
RUN ls


# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app

# Copy deps over
COPY --from=deps /app/packages/api/node_modules packages/api/node_modules
COPY --from=deps /app/packages/web/node_modules packages/web/node_modules 
COPY --from=deps /app/node_modules node_modules 

COPY . .

RUN yarn build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

# Always prod, DEPLOYMENT_ENVIRONMENT is 'stage' || 'prod' 
ENV NODE_ENV production


# Setting any environment variables that Next FE needs
# Commits token is SSR'd on the homepage TODO
# ARG COMMITS_TOKEN 
# ARG NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT
# ARG NEXT_PUBLIC_WEBSITE_URL

# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# Copying dependencies from builder stage
COPY --from=builder /app/packages/web/public packages/web/public
COPY --from=builder /app/packages/api packages/api

# Copy starting scripts
COPY --from=builder /app/package.json /app/package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000


# Running the app
CMD [ "yarn", "start" ]