# Stage 1: Build
FROM golang:1.23 AS builder

WORKDIR /app

# Copy all code into the build context
COPY ./services/migrator ./services/migrator
COPY ./services/shared ./services/shared

# Set the working directory to the migrator service
WORKDIR /app/services/migrator

# Build the application (this will fetch dependencies as needed)
RUN CGO_ENABLED=0 GOOS=linux go build -o migrator .

# Stage 2: Run
FROM gcr.io/distroless/static-debian12:latest

WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/services/migrator/migrator .

# Expose the port 
EXPOSE 8080 

# Run the application
CMD ["./migrator"]
