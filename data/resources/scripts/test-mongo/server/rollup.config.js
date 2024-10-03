import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: "server/src/server.ts", // The entry point of your application
    output: {
        file: "build/server/server.js", // The output bundled file
        format: "commonjs" // The output format ('module', 'commonjs', 'iife', 'umd', 'amd', 'system')
    },
    external: ["mongoose"],
    plugins: [
        resolve(), // Allows Rollup to resolve modules
        commonjs(), // Converts CommonJS modules to ES6
        typescript({
            tsconfigOverride: {
                rootDir: "server/src/",
                baseUrl: "server/src/",
                include: ["server/src/"]
            }
        })
    ]
};
