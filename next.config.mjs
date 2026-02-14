/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Security Headers ───────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
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
        ],
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
