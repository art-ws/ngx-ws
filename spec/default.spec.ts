import { lookupFileName } from "../src/core"
import { iterpolate } from "../src/interpolate"

import { expect } from "chai"
import path from "path"

describe("template", () => {
  it("lookupFileName", () => {
    const dir = path.join(__dirname, "files")
    let result = lookupFileName(dir, ["a"])
    expect(result).to.be.eq(path.join(dir, "a.json"))

    result = lookupFileName(dir, ["b"])
    expect(result).to.be.eq(path.join(dir, "b.yml"))

    result = lookupFileName(dir, ["c"])
    expect(result).to.be.eq(path.join(dir, "c.json5"))
  })

  it("iterpolate", () => {
    let result = iterpolate({}, "{{a}}")
    expect(result).to.be.eq("{{a}}")

    result = iterpolate({ a: 1 }, "{{a}}")
    expect(result).to.be.eq("1")

    result = iterpolate({ a: 2 }, "{{a}}-{{b}}")
    expect(result).to.be.eq("2-{{b}}")
  })
})
