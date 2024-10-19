########### x86_64 ########### - Final image is ~32mb!
# Builder stage using an official Rust image 
FROM --platform=linux/amd64 rust:1.79.0-bullseye AS builder

WORKDIR /app

# Copy the shared library code first
COPY ./shared /app/shared

# Setup the working directory for the template-consumer service
WORKDIR /app/template-consumer

# Copy dependency manifests
COPY ./template-consumer/Cargo.toml ./template-consumer/Cargo.lock ./

# Create a dummy main file to compile dependencies only
# This improves caching by keeping dependencies built until these files change
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release --target x86_64-unknown-linux-gnu --locked

# Now copy the actual source code
COPY ./template-consumer/src ./src


RUN ls -la ./src > output.txt && cat output.txt

RUN cat ./src/main.rs

# Build the actual application
RUN cargo build --release --target x86_64-unknown-linux-gnu --locked


# # # Download and install UPX - Not working right now :D TBD - also change to X86
# RUN wget https://github.com/upx/upx/releases/download/v4.2.1/upx-4.2.1-arm64_linux.tar.xz \
#     && tar -xf upx-4.2.1-arm64_linux.tar.xz \
#     && mv upx-4.2.1-arm64_linux/upx /usr/bin/ \
#     && rm -rf upx-4.2.1-arm64_linux upx-4.2.1-arm64_linux.tar.xz

# Install runtime dependencies
RUN apt update && apt install -y musl-tools musl-dev wget ca-certificates

# # Compress the executable using UPX
# RUN upx --best --lzma /app/target/aarch64-unknown-linux-musl/release/template-consumer

# Final stage uses a minimal Debian image for the runtime
FROM --platform=linux/amd64 debian:bullseye-slim as final


# # Set up a non-root user for security purposes
RUN addgroup --system --gid 1001 template-consumer && \
    adduser --system --uid 1001 template-consumer
USER template-consumer

# Expose the port the template-consumer service listens on
EXPOSE 8080

# Copy the built binary from the builder stage
COPY --from=builder --chown=template-consumer:template-consumer /app/template-consumer/target/x86_64-unknown-linux-gnu/release/template-consumer /app/template-consumer

# Copy CA certificates for SSL
COPY --from=builder --chown=template-consumer:template-consumer /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/


# Ensure the binary is executable 
RUN chmod +x /app/template-consumer 

# Set the entrypoint to run the template-consumer
ENTRYPOINT ["/app/template-consumer"]
