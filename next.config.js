/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  transpilePackages: [
    '@tiptap/react',
    '@tiptap/pm',
    '@tiptap/core',
    '@tiptap/starter-kit',
    '@tiptap/extension-image',
    '@tiptap/extension-link',
    '@tiptap/extension-text-align',
    '@tiptap/extension-underline',
  ],
};

module.exports = nextConfig;
