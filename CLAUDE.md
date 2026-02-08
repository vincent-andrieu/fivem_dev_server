# FiveM Development Server

This is a FiveM development server project using yarn workspace with shared core libraries and custom resources.

## External Skills

This project references two external skills for FiveM development:

### fivem-docs

**Location:** `/mnt/c/Users/vandr/Documents/Games/GTA V/FiveM/Documentations/fivem-docs/.claude/skills/fivem-docs/SKILL.md`

**Purpose:** Entry point for working with the official FiveM documentation repository (docs.fivem.net). This skill provides access to:

- Scripting reference (fxmanifest.lua, events, NUI, state bags)
- Game data catalogs (vehicles, weapons, peds, blips, markers)
- Server manual (setup, configuration, commands, stock resources)
- Documentation structure navigation

**When to use:**

- Understanding FiveM concepts and features
- Learning about server configuration and setup
- Working with resource manifests (fxmanifest.lua)
- NUI development and state management

### fivem-natives

**Location:** `/mnt/c/Users/vandr/Documents/Games/GTA V/FiveM/Documentations/natives/.claude/skills/fivem-natives/SKILL.md`

**Purpose:** Navigate and search ~7,687 GTA V native function docs for FiveM scripting in Lua and TypeScript.

**When to use:**

- Finding GTA V native functions for specific tasks
- Looking up native signatures and parameters
- Getting examples of native usage in Lua/TypeScript
- Understanding game mechanics (vehicles, peds, entities, etc.)
- Searching for natives by keyword or category

**Example queries:**

- "How do I get player coordinates?" → GET_ENTITY_COORDS
- "Set vehicle speed" → VEHICLE category natives
- "Spawn a ped" → CREATE_PED native
- "Create a blip" → HUD/blip-related natives

## Project Structure

- `data/`: Server data and resources
  - `resources/[scripts]/`: Custom scripts and resources
  - `shared/`: Shared libraries (core, server)
- `Dockerfile`: Server containerization
- `Makefile`: Build and management commands

## Development Guidelines

1. Use yarn for package management (workspace configuration)
2. Follow TypeScript/JavaScript conventions for scripting
3. Reference natives using the fivem-natives skill for accurate signatures
4. Consult fivem-docs skill for FiveM-specific features and best practices
5. Use proper fxmanifest.lua structure for all resources

## Notes

- The project uses yarn workspace for monorepo management
- Native functions are GTA V natives; CFX natives (FiveM-specific) are separate
- Target languages: Lua and TypeScript (FiveM JS/TS runtime)
