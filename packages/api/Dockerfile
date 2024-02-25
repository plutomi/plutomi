#### This was the old Dockerfile, I am leaving here for when ARM services are available on Hetzner :) 
# # Builder stage
# FROM arm64v8/rust:1.74 AS builder

# # Add the aarch64-unknown-linux-musl target
# RUN rustup target add aarch64-unknown-linux-musl

# # Install musl-tools, musl-dev, wget, xz-utils, and ca-certificates
# RUN apt update && apt install -y musl-tools musl-dev wget xz-utils ca-certificates

# # Download and install UPX
# RUN wget https://github.com/upx/upx/releases/download/v4.2.1/upx-4.2.1-arm64_linux.tar.xz \
#     && tar -xf upx-4.2.1-arm64_linux.tar.xz \
#     && mv upx-4.2.1-arm64_linux/upx /usr/bin/ \
#     && rm -rf upx-4.2.1-arm64_linux upx-4.2.1-arm64_linux.tar.xz

# WORKDIR /app

# COPY ./ .
# RUN cargo build --target aarch64-unknown-linux-musl --release

# # Compress the executable using UPX
# RUN upx --best --lzma /app/target/aarch64-unknown-linux-musl/release/api

# # Final stage
# FROM scratch

# # Copy CA certificates from the builder stage
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# EXPOSE 8080
# WORKDIR /app
# COPY --from=builder /app/target/aarch64-unknown-linux-musl/release/api ./api
# CMD ["/app/api"]



# Builder stage
# FROM arm64v8/rust:1.74 AS builder

# # Add the aarch64-unknown-linux-musl target
# RUN rustup target add aarch64-unknown-linux-musl

# # Install musl-tools, musl-dev, wget, xz-utils, and ca-certificates
# RUN apt update && apt install -y musl-tools musl-dev wget xz-utils ca-certificates

# # Download and install UPX
# RUN wget https://github.com/upx/upx/releases/download/v4.2.1/upx-4.2.1-arm64_linux.tar.xz \
#     && tar -xf upx-4.2.1-arm64_linux.tar.xz \
#     && mv upx-4.2.1-arm64_linux/upx /usr/bin/ \
#     && rm -rf upx-4.2.1-arm64_linux upx-4.2.1-arm64_linux.tar.xz

# WORKDIR /app

# COPY ./ .
# RUN cargo build --target aarch64-unknown-linux-musl --release

# # Compress the executable using UPX
# RUN upx --best --lzma /app/target/aarch64-unknown-linux-musl/release/api

# # Final stage
# FROM scratch

# # Copy CA certificates from the builder stage
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# EXPOSE 8080
# WORKDIR /app
# COPY --from=builder /app/target/aarch64-unknown-linux-musl/release/api ./api
# CMD ["/app/api"]





# Builder stage using an official Rust image
FROM rust:1.76.0-bullseye AS builder

# Install UPX for compressing the binary (the Rust image is Debian-based)
RUN apt update && apt install -y upx

WORKDIR /app
COPY ./ .

# Add the target for x86_64 Linux (AMD64)
# This line is technically not necessary if you're already building on an amd64 architecture
# and you don't have a custom .cargo/config setting a different default target.
# However, it's good practice for explicit cross-compilation scenarios.
RUN rustup target add x86_64-unknown-linux-gnu

# Build your application for x86_64 Linux
RUN cargo build --release --target x86_64-unknown-linux-gnu

# # Compress the executable using UPX
# If you enable UPX compression, ensure your binary is compatible or omit this step
# RUN upx --best --lzma /app/target/x86_64-unknown-linux-gnu/release/api

# Final stage uses distroless for minimal size
FROM gcr.io/distroless/cc

COPY --from=builder /app/target/x86_64-unknown-linux-gnu/release/api /app/api

ENTRYPOINT ["/app/api"]
