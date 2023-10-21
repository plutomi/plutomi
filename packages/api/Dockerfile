# Start from the official Golang base image
FROM golang:1.21 AS builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy everything from the current directory to the Working Directory inside the container
# COPY ./main ./

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./main.go

# This container exposes port 8080 to the outside world
EXPOSE 8080

# Run the binary program produced by `go build`
CMD ["./main"]
