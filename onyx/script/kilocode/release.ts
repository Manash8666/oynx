export async function upload(opts: { tag: string; files: string[] }) {
  console.log(`[Onyx Release] Staged ${opts.files.length} release files for ${opts.tag}`)
}
