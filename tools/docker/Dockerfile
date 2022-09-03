# Das soll moeglichst nah an der Systemarchitektur der Daves sein
# vgl. https://hub.docker.com/_/node
FROM node:gallium-bullseye

WORKDIR /app

RUN npm i -g pnpm@7 nodemon

ENV LC_ALL=de_DE.UTF-8
ENV TZ=Europe/Berlin

ARG USER=janus
ARG UID
ARG GID

RUN groupdel dialout && groupmod --gid $GID node \
    && usermod --uid "$UID" -l "$USER" node \
    && mkdir -p /app/node_modules && chown $UID:$GID /app/node_modules \
    && mkdir -p /app/.pnpm-store && chown $UID:$GID /app/.pnpm-store \
    && apt update && apt install --yes bash curl vim

USER $USER

# CMD ["pnpm", "install"]
