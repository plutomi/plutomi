# Use an official Node.js runtime as a parent image
FROM node:latest AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Set the working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the app’s source code
COPY . .

# Build the Next.js app
RUN npm run build

# Production image
FROM node:latest AS runner

WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
