import { expect, test } from "vitest"

// wont resolve unless config is correctly passed
import { value } from "virtual-module"

test("can import from a plugin that was defined in a function config", () => {
    expect(value).toBeTruthy()
})
