FROM arm64v8/rust:1.74 AS builder


# Add the aarch64-unknown-linux-musl target
RUN rustup target add aarch64-unknown-linux-musl

# Install musl-tools, musl-dev, and dependencies for UPX
RUN apt update && apt install -y musl-tools musl-dev wget xz-utils

# Download and install UPX
RUN wget https://github.com/upx/upx/releases/download/v4.2.1/upx-4.2.1-arm64_linux.tar.xz \
    && tar -xf upx-4.2.1-arm64_linux.tar.xz \
    && mv upx-4.2.1-arm64_linux/upx /usr/bin/ \
    && rm -rf upx-4.2.1-arm64_linux upx-4.2.1-arm64_linux.tar.xz

WORKDIR /app

COPY ./ .
RUN cargo build --target aarch64-unknown-linux-musl --release

# Compress the executable using UPX
RUN upx --best --lzma /app/target/aarch64-unknown-linux-musl/release/api

FROM scratch

EXPOSE 8080
WORKDIR /app
COPY --from=builder /app/target/aarch64-unknown-linux-musl/release/api ./api
CMD ["/app/api"]


