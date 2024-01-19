FROM arm64v8/node:20-alpine AS base


FROM base as deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Clean install deps
RUN npm ci --verbose

# Copy the rest of the application's code
COPY . .


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy over the built application and node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public/build ./public
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.mjs .
COPY --from=builder /app/package.json .


EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]

## TODO get express server working in docker
