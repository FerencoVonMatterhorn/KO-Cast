FROM golang:1.24.0-alpine3.21 AS builder

ENV GO111MODULE=on

WORKDIR /app

COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ko-cast cmd/server/main.go

FROM alpine:3.21 AS production

COPY --from=builder /app/ko-cast .

ENTRYPOINT ["./ko-cast"]