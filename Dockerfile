FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y xz-utils make && \
    npm install -g pnpm

# FiveM Version: 7290
ADD https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/7290-a654bcc2adfa27c4e020fc915a1a6343c3b4f921/fx.tar.xz /app/server/fx.tar.xz

RUN tar -xf /app/server/fx.tar.xz -C /app/server && \
    rm /app/server/fx.tar.xz

COPY Makefile /app/Makefile
COPY ./data/ /app/data/

RUN chmod +x /app/data/create_resources_config.sh
RUN (cd /app/data && ./create_resources_config.sh)
RUN make re_prod

WORKDIR /app/data
CMD /app/server/run.sh +exec /app/data/server.cfg