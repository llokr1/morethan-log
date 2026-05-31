import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"

import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { TPosts } from "src/types"

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

// TODO: react query를 사용해서 처음 불러온 뒤로는 해당데이터만 사용하도록 수정
export const getPosts = async () => {
  let id = CONFIG.notionConfig.pageId as string
  const api = new NotionAPI()

  const response = await api.getPage(id)
  id = idToUuid(id)
  const blockData = (response.block[id]?.value as any)?.value ?? response.block[id]?.value
  const collectionValue = Object.values(response.collection)[0]?.value as any
  const collection = collectionValue?.value ?? collectionValue

  // getPage skips the root collection_view_page block when querying collections.
  // Manually fetch collection data if collection_query is empty.
  if (Object.keys(response.collection_query).length === 0) {
    const collectionId = Object.keys(response.collection)[0]
    const viewId = blockData?.view_ids?.[0]
    if (collectionId && viewId) {
      const collectionView = (response.collection_view?.[viewId] as any)?.value
      const extra = await api.getCollectionData(collectionId, viewId, collectionView, { limit: 999 })
      response.collection_query[collectionId] = {
        ...response.collection_query[collectionId],
        [viewId]: (extra.result as any)?.reducerResults,
      }
      Object.assign(response.block, extra.recordMap?.block)
    }
  }
  const block = response.block
  const schema = collection?.schema

  // Check Type
  if (
    blockData?.type !== "collection_view_page" &&
    blockData?.type !== "collection_view"
  ) {
    return []
  } else {
    // Construct Data
    const pageIds = getAllPageIds(response)
    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const id = pageIds[i]
      const properties = (await getPageProperties(id, block, schema)) || null
      // Add fullwidth, createdtime to properties
      const pageBlockValue = (block[id].value as any)?.value ?? block[id].value
      properties.createdTime = new Date(
        pageBlockValue?.created_time
      ).toString()
      properties.fullWidth =
        (pageBlockValue?.format as any)?.page_full_width ?? false

      data.push(properties)
    }

    // Sort by date
    data.sort((a: any, b: any) => {
      const dateA: any = new Date(a?.date?.start_date || a.createdTime)
      const dateB: any = new Date(b?.date?.start_date || b.createdTime)
      return dateB - dateA
    })

    const posts = data as TPosts
    return posts
  }
}
