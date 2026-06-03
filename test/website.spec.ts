import { describe, expect, test, vi } from 'vitest';

vi.mock('@theguild/tailwind-config/postcss.config', () => ({
  default: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
}));

describe('website metadata and config exports', () => {
  test('exports sitemap defaults with SITE_URL fallback', async () => {
    const originalSiteUrl = process.env.SITE_URL;
    delete process.env.SITE_URL;

    const { default: sitemapConfig } = await import('../website/next-sitemap.config.js');

    expect(sitemapConfig).toEqual({
      siteUrl: 'https://the-guild.dev/graphql/config',
      generateIndexSitemap: false,
      exclude: ['*/_meta'],
      output: 'export',
    });

    process.env.SITE_URL = originalSiteUrl;
  });

  test('exports sitemap config using SITE_URL when provided', async () => {
    vi.resetModules();
    const originalSiteUrl = process.env.SITE_URL;
    process.env.SITE_URL = 'https://example.com/docs';

    const { default: sitemapConfig } = await import('../website/next-sitemap.config.js');

    expect(sitemapConfig.siteUrl).toBe('https://example.com/docs');

    process.env.SITE_URL = originalSiteUrl;
  });

  test('re-exports postcss config from shared guild config', async () => {
    const { default: postcssConfig } = await import('../website/postcss.config.js');

    expect(postcssConfig).toHaveProperty('plugins.tailwindcss');
  });

  test('defines app navigation metadata', async () => {
    const { default: appMeta } = await import('../website/src/app/_meta');

    expect(appMeta.index.display).toBe('hidden');
    expect(appMeta.docs).toMatchObject({
      title: 'Documentation',
      type: 'page',
    });
    expect(appMeta.changelog.theme.timestamp).toBe(false);
  });

  test('defines content section metadata', async () => {
    const [{ default: contentMeta }, { default: libraryMeta }, { default: userMeta }] = await Promise.all([
      import('../website/src/content/_meta'),
      import('../website/src/content/library/_meta'),
      import('../website/src/content/user/_meta'),
    ]);

    expect(contentMeta).toMatchObject({
      index: 'Introduction',
      installation: 'Installation',
      migration: 'Migration',
    });
    expect(contentMeta.user).toBe("I'm a User");
    expect(contentMeta.library).toBe("I'm a Library Author");

    expect(libraryMeta).toMatchObject({
      'load-config': 'Loading Config',
      extensions: 'Extensions',
      loaders: 'Loaders',
      'graphql-config': 'GraphQLConfig',
      'graphql-project-config': 'GraphQLProjectConfig',
    });

    expect(userMeta).toEqual({
      usage: 'Usage',
      schema: 'Specifying Schema',
      documents: 'Specifying Documents',
    });
  });
});
