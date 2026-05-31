import { NotionAPI } from "notion-client"
import { ExtendedRecordMap } from "notion-types"

// Notion API now returns blocks with nested value format ({ value: { value: ... } }).
// react-notion-x expects the flat format ({ value: ... }), so we normalize here.
function normalizeRecordMap(recordMap: ExtendedRecordMap): ExtendedRecordMap {
  for (const id of Object.keys(recordMap.block || {})) {
    const entry = recordMap.block[id] as any
    if (entry?.value?.value) {
      entry.value = entry.value.value
    }
  }
  return recordMap
}

export const getRecordMap = async (pageId: string) => {
  const api = new NotionAPI()
  const recordMap = await api.getPage(pageId)
  return normalizeRecordMap(recordMap)
}
