# Build Stage
FROM golang:1.20-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY main.go .

# Build the Go application
RUN CGO_ENABLED=0 go build -o app .

# Runtime Stage
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/app .

# Expose port
EXPOSE 8080

# Run the binary
ENTRYPOINT ["./app"]
