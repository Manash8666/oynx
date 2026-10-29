import { describe, expect, test } from "bun:test"
import { isDefaultTitle, running } from "../../src/util/session" // onyx_change

describe("util.session", () => {
  test("recognizes generated parent and child titles", () => {
    expect(isDefaultTitle("New session - 2026-06-06T12:34:56.789Z")).toBeTrue()
    expect(isDefaultTitle("Child session - 2026-06-06T12:34:56.789Z")).toBeTrue()
    expect(isDefaultTitle("New session - custom")).toBeFalse()
  })

  // onyx_change start - `scheduled` must not count as running
  test("running is true only for working statuses", () => {
    expect(running("busy")).toBeTrue()
    expect(running("retry")).toBeTrue()
    expect(running("offline")).toBeTrue()
    expect(running("idle")).toBeFalse()
    expect(running("scheduled")).toBeFalse()
  })
  // onyx_change end
})
