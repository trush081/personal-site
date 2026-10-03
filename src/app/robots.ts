import type { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: '*', allow: '/', disallow: '/admin' },
  sitemap: 'https://www.trentonrush.com/sitemap.xml',
});

export default robots;
