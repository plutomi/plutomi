# Stage 1: Build
FROM golang:1.23 AS builder

# Set the GOARCH to build for x86_64 (amd64)
ENV GOARCH=amd64
WORKDIR /app

# Copy go.mod and go.sum files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# Stage 2: Run
FROM alpine:latest
WORKDIR /root/

# Install certificates to enable HTTPS support
RUN apk --no-cache add ca-certificates

# Copy the binary from the builder stage
COPY --from=builder /app/server .

# Expose the port
EXPOSE 3000

# Run the application
CMD ["./server"]
