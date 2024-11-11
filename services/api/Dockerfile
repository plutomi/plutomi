# Use the official Rust image as the base for the builder stage
FROM rust:1.79 AS builder

# Install necessary build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        pkg-config \
        libssl-dev \
        cmake \
        build-essential \
        zlib1g-dev \
        liblz4-dev \
        libcurl4-openssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Set environment variable to prevent vendoring OpenSSL
ENV OPENSSL_NO_VENDOR=1

# Set working directory
WORKDIR /app

# Copy shared library code
COPY ./services/shared /app/services/shared

# Copy dependency manifests
COPY ./services/api/Cargo.toml ./services/api/Cargo.lock ./services/api/

# Create a dummy main file to compile dependencies only
RUN mkdir -p ./services/api/src && echo "fn main() {}" > ./services/api/src/main.rs

# Build dependencies
RUN cd ./services/api && cargo build --release --locked

# Copy the actual source code
COPY ./services/api/src ./services/api/src

# Build the actual application
RUN cd ./services/api && cargo build --release --locked

# Final stage: use a minimal Debian image
FROM debian:bullseye-slim AS final

# Install necessary runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        libssl1.1 \
        liblz4-1 \
        zlib1g \
        libcurl4 && \
    rm -rf /var/lib/apt/lists/*

# Set up a non-root user
RUN addgroup --system api && adduser --system --ingroup api api
USER api

# Expose the port the API service listens on
EXPOSE 8080

# Copy the built binary from the builder stage
COPY --from=builder /app/services/api/target/release/api /app/api

# Set the entrypoint to run the API
ENTRYPOINT ["/app/api"]
