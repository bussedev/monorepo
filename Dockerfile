ARG TAG=main

FROM ghcr.io/v2/bussedev/mono:${TAG} as builder
ARG SERVICE_PATH
RUN pnpm i \
  && pnpm -r --filter {$SERVICE_PATH} build \
  && pnpm -r --filter {$SERVICE_PATH} build:pkg

FROM alpine
ARG SERVICE_PATH
ENV NODE_ENV=production
ENV LC_ALL=de_DE.UTF-8
ENV TZ=Europe/Berlin
ENV PORT=8080
RUN mkdir /app && chown nobody:nobody -R /app
WORKDIR /app
USER nobody
COPY --from=builder /build/${SERVICE_PATH}/.build/* .
CMD ["./main"]
