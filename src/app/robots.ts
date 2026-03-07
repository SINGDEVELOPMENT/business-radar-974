import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/demo', '/demo-premium', '/mentions-legales', '/politique-confidentialite', '/cgv'],
      disallow: ['/dashboard/', '/api/', '/login', '/auth/'],
    },
    sitemap: 'https://axora-data.vercel.app/sitemap.xml',
  }
}
