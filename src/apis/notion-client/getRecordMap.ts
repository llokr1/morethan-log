import { NotionAPI } from "notion-client"
import { ExtendedRecordMap } from "notion-types"
import { getPageContentBlockIds } from "notion-utils"

// Notion API now returns blocks with nested value format ({ value: { value: ... } }).
// react-notion-x expects the flat format ({ value: ... }), so we normalize here.
function normalizeBlocks(blocks: Record<string, any>) {
  for (const id of Object.keys(blocks || {})) {
    const entry = blocks[id]
    if (entry?.value?.value) {
      entry.value = entry.value.value
    }
  }
}

export const getRecordMap = async (pageId: string) => {
  const api = new NotionAPI()
  // fetchMissingBlocks is disabled because getPage's internal loop calls
  // getPageContentBlockIds on un-normalized (nested-format) blocks, which
  // can't traverse the block tree. We run our own loop after normalizing.
  const recordMap = await api.getPage(pageId, {
    chunkLimit: 1000,
    fetchMissingBlocks: false,
  })

  normalizeBlocks(recordMap.block as any)

  for (;;) {
    const allIds = getPageContentBlockIds(recordMap)
    const missingIds = allIds.filter((id) => !recordMap.block[id])
    if (missingIds.length === 0) break
    const result: any = await api.getBlocks(missingIds)
    const newBlocks = result?.recordMap?.block ?? {}
    normalizeBlocks(newBlocks)
    Object.assign(recordMap.block, newBlocks)
  }

  return recordMap
}
