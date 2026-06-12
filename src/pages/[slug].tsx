import Detail from "src/routes/Detail"
import { filterPosts } from "src/libs/utils/notion"
import { CONFIG } from "site.config"
import { NextPageWithLayout } from "../types"
import CustomError from "src/routes/Error"
import { getRecordMap, getPosts } from "src/apis"
import MetaConfig from "src/components/MetaConfig"
import { GetStaticProps } from "next"
import { queryClient } from "src/libs/react-query"
import { queryKey } from "src/constants/queryKey"
import { dehydrate } from "@tanstack/react-query"
import usePostQuery from "src/hooks/usePostQuery"
import { FilterPostsOptions } from "src/libs/utils/notion/filterPosts"

const filter: FilterPostsOptions = {
  acceptStatus: ["Public", "PublicOnDetail"],
  acceptType: ["Paper", "Post", "Page"],
}

export const getStaticPaths = async () => {
  const allPosts = await getPosts()

  return {
    paths: [
      ...filterPosts(allPosts, { ...filter, lang: "ko" }).map((row) => ({
        params: { slug: row.slug },
        locale: "ko",
      })),
      ...filterPosts(allPosts, { ...filter, lang: "en" }).map((row) => ({
        params: { slug: row.slug },
        locale: "en",
      })),
    ],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = (context.locale || "ko") as "ko" | "en"
  const slug = context.params?.slug

  const allPosts = await getPosts()
  const feedPosts = filterPosts(allPosts, { lang: locale })
  await queryClient.prefetchQuery(queryKey.posts(locale), () => feedPosts)

  const detailPosts = filterPosts(allPosts, { ...filter, lang: locale })
  const postDetail = detailPosts.find((t: any) => t.slug === slug)
  const recordMap = await getRecordMap(postDetail?.id!)

  await queryClient.prefetchQuery(
    queryKey.post(`${slug}`, locale),
    () => ({ ...postDetail, recordMap })
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: CONFIG.revalidateTime,
  }
}

const DetailPage: NextPageWithLayout = () => {
  const post = usePostQuery()

  if (!post) return <CustomError />

  const image =
    post.thumbnail ??
    CONFIG.ogImageGenerateURL ??
    `${CONFIG.ogImageGenerateURL}/${encodeURIComponent(post.title)}.png`

  const date = post.date?.start_date || post.createdTime || ""

  const meta = {
    title: post.title,
    date: new Date(date).toISOString(),
    image: image,
    description: post.summary || "",
    type: post.type[0],
    url: `${CONFIG.link}/${post.slug}`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Detail />
    </>
  )
}

DetailPage.getLayout = (page) => {
  return <>{page}</>
}

export default DetailPage
