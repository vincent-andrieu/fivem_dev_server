FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y xz-utils make

# FiveM Version: 25770
ADD https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/25770-8ddccd4e4dfd6a760ce18651656463f961cc4761/fx.tar.xz /app/server/fx.tar.xz

RUN tar -xf /app/server/fx.tar.xz -C /app/server && \
    rm /app/server/fx.tar.xz

COPY Makefile /app/Makefile
COPY ./data/ /app/data/

RUN chmod +x /app/data/create_resources_config.sh
RUN (cd /app/data && ./create_resources_config.sh)
RUN make re

WORKDIR /app/data
CMD /app/server/run.sh +exec /app/data/server.cfg