FROM arm64v8/rust:1.74 AS builder


# Add the aarch64-unknown-linux-musl target
RUN rustup target add aarch64-unknown-linux-musl

# Install musl-tools, musl-dev and OpenSSL development headers
RUN apt update && apt install -y musl-tools musl-dev


WORKDIR /app

COPY ./ .
RUN cargo build --target aarch64-unknown-linux-musl --release

FROM scratch

EXPOSE 8080
WORKDIR /app
COPY --from=builder /app/target/aarch64-unknown-linux-musl/release/api ./api
CMD ["/app/api"]


