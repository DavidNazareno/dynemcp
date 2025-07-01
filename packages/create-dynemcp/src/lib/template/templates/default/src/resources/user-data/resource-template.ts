import { resourceTemplate } from '@dynemcp/dynemcp'

export default resourceTemplate({
  uriTemplate: '/user-data/{id}',
  name: 'User Data Dynamic Resource',
  description: 'Dynamic resource for user data, generated on demand.',
  mimeType: 'text/plain',
  async getContent(params: { id: string }) {
    // Example: fetch or generate content dynamically based on params.id
    return `Dynamic content for user with id: ${params.id}`
  },
})
