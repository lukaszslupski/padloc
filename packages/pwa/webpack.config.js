const path = require("path");
const { EnvironmentPlugin } = require("webpack");
const { InjectManifest } = require("workbox-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");
// const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const { version } = require("../../package.json");

const out = process.env.PL_PWA_DIR || path.resolve(__dirname, "dist");
const serverUrl = process.env.PL_SERVER_URL || `http://0.0.0.0:${process.env.PL_SERVER_PORT || 3000}`;
const assetsDir = process.env.PL_ASSETS_DIR || "../../assets";

const { name, version: vendorVersion } = require(path.join(assetsDir, "manifest.json"));

module.exports = {
    entry: path.resolve(__dirname, "src/index.ts"),
    output: {
        path: out,
        filename: "[name].js",
        chunkFilename: "[name].chunk.js",
        publicPath: "/",
    },
    mode: "development",
    devtool: "source-map",
    stats: "minimal",
    resolve: {
        extensions: [".ts", ".js", ".css", ".svg", ".png", ".jpg"],
        alias: {
            assets: path.resolve(__dirname, assetsDir),
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
                use: ["file-loader"],
            },
            {
                test: /\.txt|md$/i,
                use: "raw-loader",
            },
        ],
    },
    plugins: [
        new EnvironmentPlugin({
            PL_APP_NAME: name,
            PL_SERVER_URL: serverUrl,
            PL_BILLING_ENABLED: null,
            PL_BILLING_DISABLE_PAYMENT: null,
            PL_BILLING_STRIPE_PUBLIC_KEY: null,
            PL_SUPPORT_EMAIL: "support@padloc.app",
            PL_VERSION: version,
            PL_VENDOR_VERSION: vendorVersion || version,
            PL_DISABLE_SW: false,
            PL_CLIENT_SUPPORTED_AUTH_TYPES: "email",
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: name,
            template: path.resolve(__dirname, "src/index.html"),
            meta: {
                "Content-Security-Policy": {
                    "http-equiv": "Content-Security-Policy",
                    content: `default-src 'self' ${serverUrl} blob:; style-src 'self' 'unsafe-inline'; object-src 'self' blob:; frame-src 'self'; img-src 'self' blob: data:`,
                },
            },
        }),
        // new FaviconsWebpackPlugin(path.resolve(__dirname, "assets/icon-512.png")),
        new WebpackPwaManifest({
            name: name,
            short_name: name,
            icons: [
                {
                    src: path.resolve(__dirname, assetsDir, "app-icon.png"),
                    sizes: [96, 128, 192, 256, 384, 512],
                },
            ],
        }),
        new InjectManifest({
            swSrc: path.resolve(__dirname, "../app/src/sw.ts"),
            swDest: "sw.js",
            exclude: [/favicon\.png$/, /\.map$/],
        }),
    ],
    devServer: {
        historyApiFallback: true,
        host: "0.0.0.0",
        port: process.env.PL_PWA_PORT || 8080,
        // hot: false,
        // liveReload: false,
        client: { overlay: false },
    },
};
