# Start from the official Rust base image
FROM clux/muslrust:stable AS builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy everything from the current directory to the Working Directory inside the container
COPY ./ ./

# Build the Rust app using Cargo (Rust's build tool)
RUN cargo build --release

# Start a new stage to create a smaller final image - # Choose a smaller image!
FROM alpine:latest AS runtime

COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/api ./api

# This container exposes port 8080 to the outside world
EXPOSE 8080


# # Set the binary as the default CMD to run
CMD ["/api"]
