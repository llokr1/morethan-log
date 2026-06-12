export const queryKey = {
  scheme: () => ["scheme"],
  posts: (locale: string = "ko") => ["posts", locale],
  tags: () => ["tags"],
  categories: () => ["categories"],
  post: (slug: string, locale: string = "ko") => ["post", slug, locale],
}
