import path from "path";
import { fileURLToPath } from "url";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    input: "server/src/server.ts",
    output: {
        file: "build/server/server.js",
        format: "commonjs"
    },
    external: ["mongoose", "redis"],
    treeshake: {
        moduleSideEffects: "no-external"
    },
    plugins: [
        alias({
            entries: [
                { find: "@shared/core", replacement: path.resolve(__dirname, "../../../../shared/core/build") },
                { find: "@shared/server", replacement: path.resolve(__dirname, "../../../../shared/server/build") }
            ]
        }),
        resolve(),
        commonjs(),
        typescript({
            tsconfig: "server/tsconfig.json"
        })
    ]
};
