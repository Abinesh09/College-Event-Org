# Stage 1: Build the Go binary
FROM golang:alpine AS builder

WORKDIR /app

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and compile statically
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./cmd/server

# Stage 2: Minimal Alpine runtime
FROM alpine:latest

WORKDIR /app

# Install ca-certificates and curl for healthchecks
RUN apk --no-cache add ca-certificates curl

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy compiled binary
COPY --from=builder /app/server /app/server

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD curl -f http://localhost:8080/health || exit 1

CMD ["/app/server"]
