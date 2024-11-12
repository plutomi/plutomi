# Stage 1: Build
FROM golang:1.23 AS builder

WORKDIR /app

# Copy all code into the build context
COPY ./services/api ./services/api
COPY ./services/shared ./services/shared

# Set the working directory to the api service
WORKDIR /app/services/api

# Build the application (this will fetch dependencies as needed)
RUN CGO_ENABLED=0 GOOS=linux go build -o api .

# Stage 2: Run
FROM gcr.io/distroless/static-debian12:latest

WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/services/api/api .

# Expose the port - TODO change to 8080
EXPOSE 3000 

# Run the application
CMD ["./api"]
