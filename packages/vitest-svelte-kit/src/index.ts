import vite, { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import path from "path"
import fs from "fs"

import type { Config as SvelteConfig } from "@sveltejs/kit"

// This entire plugin is essentially trying to mirror https://github.com/sveltejs/kit/blob/09e453f1354ae4946ad121ea32d002742fc12f69/packages/kit/src/core/dev/index.js#L153
// plus pull through any vite configuration specified in svelte.config.js

// TODO
//  - [ ] $lib resolution (default/custom)
//  - [ ] $app resolution + mocking? ("svelte-kit-mocks")
//  - [ ] JS test
//  - [ ] TS test
//  - [ ] CSS test
//  - [ ] handle unfindable svelte config
//  - [ ] accept alternative svelte config via function params
//  - [ ] docs
//  - [ ] rename to "vitest-svelte-kit"

async function fileExists(path: string) {
    return fs.promises
        .access(path, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false)
}

async function resolveSvelteConfigFile() {
    const file = path.resolve(process.cwd(), "svelte.config.js")

    if ((await fileExists(file)) === false) {
        throw new Error("Could not find Svelte config. Location checked:\n\n" + file)
    }

    return file
}

function makeAbsolute(basePath: string, pathToResolve: string) {
    return path.isAbsolute(pathToResolve) ? pathToResolve : path.resolve(basePath, pathToResolve)
}

export async function extractFromSvelteConfig(inlineConfig?: SvelteConfig) {
    const svelteConfigFile = await resolveSvelteConfigFile()
    const svelteConfigDir = path.dirname(svelteConfigFile)

    const svelteConfig: any = await import(svelteConfigFile).then((module) => module.default)

    // const viteConfig = svelteConfig.kit?.vite

    // plugins cannot be injected via the `config` hook, so we must pull out ahead of time
    // TODO: handle `vite` as a function
    const { plugins = [], ...extractedViteConfig } = svelteConfig.kit?.vite ?? {}

    const $lib = makeAbsolute(svelteConfigDir, svelteConfig.kit?.files?.lib ?? "./src/lib")

    let viteEnv: vite.ConfigEnv

    return defineConfig({
        plugins: [
            svelte({ hot: false }),
            {
                name: "vitest-svelte-kit:kit-emulator",
                config(_, env) {
                    viteEnv = env
                    return {
                        resolve: {
                            alias: {
                                $lib,
                                "$app/env": "vitest-svelte-kit:$app/env",
                            },
                        },
                    }
                },
                resolveId(id) {
                    if (id === "vitest-svelte-kit:$app/env") {
                        return id
                    }
                },
                load(file) {
                    if (file === "vitest-svelte-kit:$app/env") {
                        // https://kit.svelte.dev/docs#modules-$app-env
                        return `
                            export const amp = ${JSON.stringify(svelteConfig.kit?.amp ?? false)};
                            export const browser = typeof window !== 'undefined';
                            export const dev = true;
                            export const mode = ${JSON.stringify(viteEnv.mode ?? "development")};
                            export const prerendering = false;
                        `
                    }
                },
            },
            {
                name: "vitest-svelte-kit:extracted-config",
                config() {
                    return extractedViteConfig
                },
            },
            ...plugins,
        ],
    })
}
