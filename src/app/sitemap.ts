import type { MetadataRoute } from 'next';

import routes from '@/data/routes';

const sitemap = (): MetadataRoute.Sitemap => routes.map(({ path }) => ({
  url: `https://www.trentonrush.com${path}`,
}));

export default sitemap;
