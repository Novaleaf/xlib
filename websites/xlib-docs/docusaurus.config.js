module.exports = {
  title: 'XLIB Docs',
  tagline: 'One core lib to rule them all',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/x-icon.svg',//'img/favicon.ico',
  organizationName: 'novaleaf', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.
  themeConfig: {
    navbar: {
      //title: 'Xlib',
      logo: {
        alt: 'Xlib',
        src: 'img/xlib-icon.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        // {
        //   to: 'api/',
        //   activeBasePath: 'api',
        //   label: 'Api',
        //   position: 'left',
        // },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/novaleaf/xlib',
          //label: 'GitHub',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/',
            },
            // {
            //   label: 'Api',
            //   to: 'api/',
            // },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Gitter.im',
              href: 'https://gitter.im/xlib-js/community',
            },
            // {
            //   label: 'Discord',
            //   href: 'https://discordapp.com/invite/docusaurus',
            // },
            // {
            //   label: 'Twitter',
            //   href: 'https://twitter.com/docusaurus',
            // },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/novaleaf/xlib',
            },
          ],
        },
      ],
      copyright: `Copyright © 2019 - ${new Date().getFullYear()} Novaleaf Inc.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/novaleaf/xlib/edit/master/websites/xlib-docs/docs/',
        },
        // api: {
        //   sidebarPath: require.resolve('./sidebars.js'),
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/edit/master/website/',
        // },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/novaleaf/xlib/edit/master/websites/xlib-docs/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
