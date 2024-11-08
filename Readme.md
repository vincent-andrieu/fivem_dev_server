# Overview
This project is a basic FiveM server to make some tests. In contains :
- A system to build and runs TypeScript scripts (it can be optimized), it's just a POC to test TS scripts with FiveM.
- A custom spawn system. The default `spawnmanager` has been removed to use mine that implement player switch animation.

# Build & Run
## Production
1. Copy data/env.example.cfg to data/env.cfg
2. Edit data/env.cfg to match your environment
3. `docker compose build`
4. `docker compose up -d`

## Development
### Linux
1. Download FiveM server from https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/
2. Extract the server into the server directory
3. Copy data/env.example.cfg to data/env.cfg
4. Edit data/env.cfg to match your environment
5. `./create_resources_config.sh`
6. `make re`
7. `(cd data && ../server/run.sh +exec ./server.cfg)`

### Windows
1. Download FiveM server from https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/
2. Extract the server into the server directory
3. Copy data/env.example.cfg to data/env.cfg
4. Edit data/env.cfg to match your environment
5. `create_resources_config.bat`
6. `make re`
7. `./run.bat`
