FROM --platform=$BUILDPLATFORM golang:1.24.0-alpine3.21 AS builder

ARG TARGETOS
ARG TARGETARCH

WORKDIR /app

COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o ko-cast cmd/server/main.go

FROM alpine:3.21 AS production

COPY --from=builder /app/ko-cast .

EXPOSE 8080

ENTRYPOINT ["./ko-cast"]