/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Security Headers ───────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // X-Frame-Options removed — Mini Apps run in iframes.
          // frame-ancestors in CSP handles this instead.
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.com wss://*.walletconnect.org https://api.openai.com https://api.tavily.com https://*.infura.io https://*.alchemy.com https://*.base.org https://app.uniswap.org https://*.uniswap.org https://auth.farcaster.xyz https://api.farcaster.xyz https://api.neynar.com",
              "frame-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://app.uniswap.org https://*.farcaster.xyz https://*.warpcast.com",
              "frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com https://warpcast.com https://*.base.org https://base.org https://*.onchainkit.xyz https://*.vercel.app",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Rewrite /.well-known/farcaster.json to our API route
  async rewrites() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: "/api/farcaster/manifest",
      },
    ];
  },

  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Suppress optional dependency warnings from WalletConnect / MetaMask SDK
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
        lokijs: false,
      };

      // Handle @react-native-async-storage which MetaMask SDK optionally imports
      config.resolve.alias = {
        ...config.resolve.alias,
        "@react-native-async-storage/async-storage": false,
      };
    }

    // Ignore optional dependencies from WalletConnect and MetaMask SDK
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pino-pretty$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      })
    );

    return config;
  },
};

export default nextConfig;
