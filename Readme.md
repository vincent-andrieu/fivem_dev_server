# Production
1. Copy data/env.example.cfg to data/env.cfg
2. Edit data/env.cfg to match your environment
3. `docker build -t fivem_server .`
4. `docker run --name fivem_server -di -p 30120:30120/tcp -p 30120:30120/udp fivem_server`

# Development
## Linux
1. Download FiveM server from https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/
2. Extract the server into the server directory
3. Copy data/env.example.cfg to data/env.cfg
4. Edit data/env.cfg to match your environment
5. `make re`
6. `(cd data && ../server/run.sh +exec ./server.cfg)`

## Windows
1. Download FiveM server from https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/
2. Extract the server into the server directory
3. Copy data/env.example.cfg to data/env.cfg
4. Edit data/env.cfg to match your environment
5. `make re`
6. `./run.bat`