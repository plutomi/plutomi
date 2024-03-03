##############################################################################################################################
##############################################################################################################################
########    # This was the old Dockerfile, I am leaving here for when ARM services are available on Hetzner :)    ############
######    Right now we have to build for x86_64 which is blehh considering I have an ARM mac as well it's sloooooww    #######
##############################################################################################################################
##############################################################################################################################



# ########## ARM BUILD ###########
# # Builder stage
# FROM arm64v8/rust:1.74 AS builder

# # Add the aarch64-unknown-linux-musl target
# RUN rustup target add aarch64-unknown-linux-musl

# # Install musl-tools, musl-dev, wget, xz-utils, and ca-certificates
# RUN apt update && apt install -y musl-tools musl-dev wget ca-certificates

# # # Download and install UPX
# # RUN wget https://github.com/upx/upx/releases/download/v4.2.1/upx-4.2.1-arm64_linux.tar.xz \
# #     && tar -xf upx-4.2.1-arm64_linux.tar.xz \
# #     && mv upx-4.2.1-arm64_linux/upx /usr/bin/ \
# #     && rm -rf upx-4.2.1-arm64_linux upx-4.2.1-arm64_linux.tar.xz

# WORKDIR /app

# COPY ./ .
# RUN cargo build --target aarch64-unknown-linux-musl --release

# # Compress the executable using UPX
# # RUN upx --best --lzma /app/target/aarch64-unknown-linux-musl/release/api

# # Final stage
# FROM scratch

# # Copy CA certificates from the builder stage
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# EXPOSE 8080
# WORKDIR /app
# COPY --from=builder /app/target/aarch64-unknown-linux-musl/release/api ./api
# CMD ["/app/api"]





######## This is an EXPERIMENTAL dockerfile from chatgippidy to add caching to the ABOVE dockerfile - haven't tested #######
# # Builder stage
# FROM arm64v8/rust:1.74 AS builder

# # Set the working directory in the container
# WORKDIR /app

# # Add the aarch64-unknown-linux-musl target for static linking
# RUN rustup target add aarch64-unknown-linux-musl

# # Install necessary packages
# RUN apt update && apt install -y musl-tools musl-dev ca-certificates && \
#     rm -rf /var/lib/apt/lists/*

# # Cache dependencies by copying Cargo.toml and Cargo.lock and creating a dummy main.rs
# COPY Cargo.toml Cargo.lock ./
# RUN mkdir src && \
#     echo "fn main() {}" > src/main.rs && \
#     cargo build --target aarch64-unknown-linux-musl --release && \
#     rm -f src/main.rs

# # Copy your source code into the Docker image
# COPY ./ .

# # Build your Rust application
# RUN cargo build --target aarch64-unknown-linux-musl --release

# # (Optional) Download and install UPX using curl - Uncomment and adjust if needed
# # RUN curl -L https://github.com/upx/upx/releases/download/v4.2.1/upx-4.2.1-arm64_linux.tar.xz -o upx.tar.xz \
# #     && tar -xf upx.tar.xz \
# #     && mv upx-4.2.1-arm64_linux/upx /usr/bin/ \
# #     && rm -rf upx-4.2.1-arm64_linux upx.tar.xz

# # (Optional) Compress the executable using UPX - Uncomment if UPX is used
# # RUN upx --best --lzma /app/target/aarch64-unknown-linux-musl/release/api

# # Final stage
# FROM scratch

# # Copy CA certificates from the builder stage
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# # Set the working directory in the container
# WORKDIR /app

# # Copy the compiled binary from the builder stage to the final image
# COPY --from=builder /app/target/aarch64-unknown-linux-musl/release/api ./api

# # Expose port 8080 if your application uses it
# EXPOSE 8080

# # Command to run the executable
# CMD ["/app/api"]
##############################################################################################################################


########### x86_64 ###########

# Builder stage using an official Rust image for AMD64
FROM --platform=linux/amd64 rust:1.76.0-bullseye AS builder

WORKDIR /app

# Cache dependencies by pre-building the application with an empty main file
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release --target x86_64-unknown-linux-gnu --locked


# Build the actual application
COPY ./ .
RUN touch src/main.rs && \
    cargo build --release --target x86_64-unknown-linux-gnu --locked

# Compress the executable using UPX - NOT WORKING ON x86_64
# RUN upx --best --lzma target/x86_64-unknown-linux-gnu/release/api

# Final stage uses distroless for minimal size
FROM --platform=linux/amd64 gcr.io/distroless/static as final
COPY --from=builder /app/target/x86_64-unknown-linux-gnu/release/api /app/api

ENTRYPOINT ["/app/api"]
