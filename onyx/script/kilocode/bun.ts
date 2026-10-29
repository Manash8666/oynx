export const pin = {
  version: Bun.version,
  revision: Bun.revision,
}

export const target = (t: any) => ({ name: "onyx", version: "1.0.0" })

export async function stage(target: { os: string; arch: string }) {
  return process.execPath
}
