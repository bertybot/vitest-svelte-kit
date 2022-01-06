import { test, expect } from "vitest"
import * as env from "$app/env"

test("ensure $app/env is polyfilled", () => {
    expect(env).toEqual({
        amp: true,
        browser: true,
        dev: true,
        mode: "development",
        prerendering: false,
    })
})
