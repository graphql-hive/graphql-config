import { describe, expect, test, vi } from 'vitest';

type MockElement = {
  type: unknown;
  props: Record<string, unknown> & {
    children?: unknown;
  };
};

type MockComponent = ((props: Record<string, unknown>) => MockElement) & {
  displayName?: string;
};

const component = (name: string) => {
  const fn: MockComponent = (props) => ({ type: name, props });
  fn.displayName = name;
  return fn;
};

const createElement = (type: unknown, props: Record<string, unknown> | null, ...children: unknown[]): MockElement => ({
  type,
  props: {
    ...(props || {}),
    children: children.length <= 1 ? children[0] : children,
  },
});

vi.stubGlobal('React', {
  createElement,
  Fragment: 'Fragment',
});

vi.mock(
  'react',
  () => ({
    default: {
      createElement,
      Fragment: 'Fragment',
    },
    createElement,
    Fragment: 'Fragment',
  }),
  { virtual: true },
);

vi.mock(
  'react/jsx-runtime',
  () => ({
    Fragment: 'Fragment',
    jsx: (type: unknown, props: Record<string, unknown> | null) => createElement(type, props),
    jsxs: (type: unknown, props: Record<string, unknown> | null) => createElement(type, props),
  }),
  { virtual: true },
);

vi.mock('@theguild/components/style.css', () => ({}), { virtual: true });

vi.mock(
  '@theguild/components',
  () => ({
    CallToAction: component('CallToAction'),
    cn: (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' '),
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
    PRODUCTS: {
      CONFIG: {
        title: 'GraphQL Config product',
      },
    },
    ToolsAndLibrariesCards: component('ToolsAndLibrariesCards'),
  }),
  { virtual: true },
);

vi.mock(
  '@theguild/components/server',
  () => ({
    getDefaultMetadata: (input: Record<string, unknown>) => ({
      ...input,
      openGraph: {
        title: input.productName,
      },
    }),
    getPageMap: async () => ['intro', 'usage'],
    GuildLayout: component('GuildLayout'),
    useMDXComponents: () => ({
      wrapper: component('MDXWrapper'),
    }),
  }),
  { virtual: true },
);

vi.mock(
  '@theguild/components/pages',
  () => ({
    generateStaticParamsFor: (paramName: string) => () => [{ [paramName]: ['docs'] }],
    importPage: async (mdxPath: string[]) => ({
      default: component('MDXContent'),
      metadata: {
        title: mdxPath.join('/'),
      },
      toc: [{ title: 'Intro' }],
    }),
  }),
  { virtual: true },
);

vi.mock(
  '@theguild/components/next.config',
  () => ({
    withGuildDocs: (config: Record<string, unknown>) => ({
      ...config,
      guildDocs: true,
    }),
  }),
  { virtual: true },
);

vi.mock(
  '@theguild/tailwind-config',
  () => ({
    default: {
      theme: {
        extend: {
          colors: {
            'hive-yellow': '#f4d03f',
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
      sans: ['ui-sans-serif', 'system-ui'],
    },
  }),
  { virtual: true },
);

describe('website components', () => {
  test('builds the legacy index page hero configuration', async () => {
    const { IndexPage } = await import('../website/src/app/index-page');

    const rendered = IndexPage();

    expect(rendered.props.children[0].type.displayName).toBe('HeroGradient');
    expect(rendered.props.children[0].props.title).toBe('GraphQL Config');
    expect(rendered.props.children[1].props.items).toHaveLength(3);
  });

  test('builds the app landing page metadata and cards', async () => {
    const { default: Page, metadata } = await import('../website/src/app/page');

    const rendered = Page();

    expect(metadata.alternates.canonical).toBe('.');
    expect(metadata.openGraph.url).toBe('.');
    expect(rendered.props.children[0].type.displayName).toBe('Hero');
    expect(rendered.props.children[1].type.name).toBe('CardsSection');
    expect(rendered.props.children[2].type.displayName).toBe('ToolsAndLibrariesCards');
  });

  test('builds giscus discussion widget props', async () => {
    const { Giscus } = await import('../website/src/app/giscus');

    const rendered = Giscus();

    expect(rendered.type.displayName).toBe('Giscus');
    expect(rendered.props.repo).toBe('kamilkisiela/graphql-config');
    expect(rendered.props.category).toBe('Docs Discussions');
  });

  test('builds root layout with metadata and guild layout props', async () => {
    const { default: RootLayout, metadata } = await import('../website/src/app/layout');

    const rendered = await RootLayout({ children: 'content' });

    expect(metadata.productName).toBe('CONFIG');
    expect(rendered.type.displayName).toBe('GuildLayout');
    expect(rendered.props.websiteName).toBe('GraphQL-Config');
    expect(rendered.props.layoutProps.docsRepositoryBase).toContain('/website');
    expect(rendered.props.children).toBe('content');
  });

  test('loads docs page metadata and wraps MDX content', async () => {
    type DocsPageProps = {
      params: Promise<{
        mdxPath: string[];
      }>;
    };
    const [docsPage, giscusModule] = await Promise.all([
      import('../website/src/app/docs/[[...mdxPath]]/page'),
      import('../website/src/app/giscus'),
    ]);
    const props: DocsPageProps = {
      params: Promise.resolve({
        mdxPath: ['library', 'load-config'],
      }),
    };

    expect(docsPage.generateStaticParams()).toEqual([{ mdxPath: ['docs'] }]);
    await expect(docsPage.generateMetadata(props)).resolves.toEqual({
      title: 'library/load-config',
    });

    const rendered = await docsPage.default(props);

    expect(rendered.type.displayName).toBe('MDXWrapper');
    expect(rendered.props.metadata.title).toBe('library/load-config');
    expect(rendered.props.bottomContent.type).toBe(giscusModule.Giscus);
  });

  test('exports next and tailwind configuration values', async () => {
    const [{ default: nextConfig }, { default: tailwindConfig }] = await Promise.all([
      import('../website/next.config'),
      import('../website/tailwind.config'),
    ]);

    expect(nextConfig.guildDocs).toBe(true);
    expect(nextConfig.output).toBe('export');
    await expect(nextConfig.redirects()).resolves.toContainEqual({
      source: '/legacy',
      destination: '/docs/migration',
      permanent: true,
    });

    expect(tailwindConfig.theme.extend.colors.primary).toBe('#f4d03f');
    expect(tailwindConfig.theme.extend.fontFamily.sans).toContain('ui-sans-serif');
    expect(tailwindConfig.theme.extend.animation.scroll).toContain('var(--animation-duration');
  });
});
