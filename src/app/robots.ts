import type { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/login', '/admin', '/oauth'] },
  sitemap: 'https://www.trentonrush.com/sitemap.xml',
});

export default robots;
