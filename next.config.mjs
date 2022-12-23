// import { env } from "./src/env/server.mjs";
import removeImports from "next-remove-imports";

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

const nextConfig = removeImports({
  test: /node_modules([\s\S]*?)\.(tsx|ts|js|mjs|jsx)$/,
  matchImports: "\\.(less|css|scss|sass|styl)$",
})(
  defineNextConfig({
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ["dummyimage.com", "lh3.googleusercontent.com"],
    },
    // Next.js i18n docs: https://nextjs.org/docs/advanced-features/i18n-routing
    i18n: {
      locales: ["en"],
      defaultLocale: "en",
    },
  })
);

export default nextConfig;
