import * as prismic from '@prismicio/client'

export function getPrismicClient() {
  const client = prismic.createClient(String(process.env.PRISMIC_ENDPOINT), {
    accessToken: String(process.env.PRISMIC_ACCESS_TOKEN),
  })

  return client
}
