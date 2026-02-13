import webpack from "next/dist/compiled/webpack/webpack-lib.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
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
