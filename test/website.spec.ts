import { beforeAll, describe, expect, test, vi } from 'vitest';

const reactMock = vi.hoisted(() => {
  const createElement = (type: unknown, props: Record<string, unknown> | null, ...children: unknown[]) => ({
    type,
    props: {
      ...(props ?? {}),
      children: children.length <= 1 ? children[0] : children,
    },
  });

  return {
    Fragment: 'Fragment',
    createElement,
    default: {
      Fragment: 'Fragment',
      createElement,
    },
  };
});

beforeAll(() => {
  (globalThis as typeof globalThis & { React: typeof reactMock.default }).React = reactMock.default;
});

vi.mock('react', () => reactMock, { virtual: true });

vi.mock(
  'react/jsx-runtime',
  () => ({
    Fragment: 'Fragment',
    jsx: (type: unknown, props: Record<string, unknown>) => ({ type, props }),
    jsxs: (type: unknown, props: Record<string, unknown>) => ({ type, props }),
  }),
  { virtual: true },
);

vi.mock(
  '@theguild/components',
  () => {
    const component = (name: string) => (props: Record<string, unknown>) => ({ type: name, props });

    return {
      CallToAction: component('CallToAction'),
      ConfigLogo: component('ConfigLogo'),
      FeatureList: component('FeatureList'),
      Giscus: component('Giscus'),
      GitHubIcon: component('GitHubIcon'),
      Hero: component('Hero'),
      HeroGradient: component('HeroGradient'),
      HiveFooter: component('HiveFooter'),
      InfoCard: component('InfoCard'),
      NPMBadge: component('NPMBadge'),
      PaperIcon: component('PaperIcon'),
      PencilIcon: component('PencilIcon'),
      ToolsAndLibrariesCards: component('ToolsAndLibrariesCards'),
      PRODUCTS: {
        CONFIG: {
          title: 'GraphQL Config',
        },
      },
      cn: (...values: string[]) => values.filter(Boolean).join(' '),
    };
  },
  { virtual: true },
);

vi.mock(
  '@theguild/components/server',
  () => {
    const Wrapper = (props: Record<string, unknown>) => ({ type: 'Wrapper', props });

    return {
      GuildLayout: (props: Record<string, unknown>) => ({ type: 'GuildLayout', props }),
      getDefaultMetadata: (options: Record<string, string>) => ({
        title: options.websiteName,
        description: options.description,
        openGraph: {
          title: options.productName,
          url: '/',
        },
      }),
      getPageMap: vi.fn(async () => [{ name: 'docs' }]),
      useMDXComponents: () => ({
        wrapper: Wrapper,
      }),
    };
  },
  { virtual: true },
);

vi.mock(
  '@theguild/components/pages',
  () => ({
    generateStaticParamsFor: (key: string) => () => [{ [key]: ['docs'] }],
    importPage: vi.fn(async (mdxPath: string[]) => ({
      default: (props: Record<string, unknown>) => ({ type: 'MDXContent', props }),
      metadata: {
        title: `Mock ${mdxPath.join('/')}`,
      },
      toc: [{ title: 'Intro' }],
    })),
  }),
  { virtual: true },
);

vi.mock('@theguild/components/next.config', () => ({ withGuildDocs: (config: unknown) => config }), { virtual: true });
vi.mock('@theguild/components/style.css', () => ({}), { virtual: true });
vi.mock('@theguild/tailwind-config/postcss.config', () => ({ default: { plugins: ['mock-plugin'] } }), {
  virtual: true,
});
vi.mock(
  '@theguild/tailwind-config',
  () => ({
    default: {
      theme: {
        extend: {
          colors: {
            'hive-yellow': '#facc15',
          },
        },
      },
    },
  }),
  { virtual: true },
);
vi.mock(
  'tailwindcss/defaultTheme',
  () => ({
    fontFamily: {
      sans: ['ui-sans-serif'],
    },
  }),
  { virtual: true },
);

describe('website configuration', () => {
  test('exports sitemap, next, postcss, and tailwind configuration', async () => {
    const sitemapConfig = (await import('../website/next-sitemap.config.js')).default;
    const nextConfig = (await import('../website/next.config')).default;
    const postcssConfig = (await import('../website/postcss.config.js')).default;
    const tailwindConfig = (await import('../website/tailwind.config')).default;

    expect(sitemapConfig.siteUrl).toBe('https://the-guild.dev/graphql/config');
    expect(sitemapConfig.exclude).toContain('*/_meta');

    await expect(nextConfig.redirects()).resolves.toContainEqual({
      source: '/legacy',
      destination: '/docs/migration',
      permanent: true,
    });
    expect(nextConfig.env.SITE_URL).toBe('https://the-guild.dev/graphql/config');

    expect(postcssConfig.plugins).toEqual(['mock-plugin']);
    expect(tailwindConfig.theme.extend.colors.primary).toBe('#facc15');
    expect(tailwindConfig.theme.extend.fontFamily.sans).toEqual(['var(--font-sans, ui-sans-serif)', 'ui-sans-serif']);
  });
});

describe('website pages', () => {
  test('renders the landing pages and giscus component', async () => {
    const appPage = await import('../website/src/app/page');
    const legacyIndexPage = await import('../website/src/app/index-page');
    const { Giscus } = await import('../website/src/app/giscus');

    expect(appPage.metadata.alternates.canonical).toBe('.');
    expect(appPage.metadata.openGraph.url).toBe('.');
    const landingPage = appPage.default();
    expect(landingPage.props.children).toHaveLength(3);
    expect(landingPage.props.children[1].type({ className: 'extra-class' }).props.className).toContain('extra-class');
    expect(legacyIndexPage.IndexPage().props.children).toHaveLength(2);
    expect(Giscus().props.repo).toBe('kamilkisiela/graphql-config');
  });

  test('renders root layout and docs page helpers', async () => {
    const layout = await import('../website/src/app/layout');
    const docsPage = await import('../website/src/app/docs/[[...mdxPath]]/page');

    expect(layout.metadata.title).toBe('GraphQL-Config');
    await expect(layout.default({ children: 'content' })).resolves.toMatchObject({
      props: {
        websiteName: 'GraphQL-Config',
      },
    });

    expect(docsPage.generateStaticParams()).toEqual([{ mdxPath: ['docs'] }]);
    await expect(
      docsPage.generateMetadata({ params: Promise.resolve({ mdxPath: ['user', 'usage'] }) }),
    ).resolves.toEqual({
      title: 'Mock user/usage',
    });
    await expect(
      docsPage.default({ params: Promise.resolve({ mdxPath: ['library', 'loaders'] }) }),
    ).resolves.toMatchObject({
      props: {
        metadata: {
          title: 'Mock library/loaders',
        },
      },
    });
  });
});

describe('website metadata', () => {
  test('exports navigation metadata and mdx component helpers', async () => {
    const appMeta = (await import('../website/src/app/_meta')).default;
    const contentMeta = (await import('../website/src/content/_meta')).default;
    const libraryMeta = (await import('../website/src/content/library/_meta')).default;
    const userMeta = (await import('../website/src/content/user/_meta')).default;
    const mdxComponents = await import('../website/src/mdx-components.js');

    expect(appMeta.docs.title).toBe('Documentation');
    expect(contentMeta.library).toBe("I'm a Library Author");
    expect(libraryMeta['graphql-config']).toBe('GraphQLConfig');
    expect(userMeta.documents).toBe('Specifying Documents');
    expect(mdxComponents.useMDXComponents().wrapper({ children: 'docs' }).type).toBe('Wrapper');
  });
});
