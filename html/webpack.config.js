const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { TsConfigPathsPlugin } = require("awesome-typescript-loader");

const envConfig = {
    target: "web",
    entry: {
        "index": ["./src/index.tsx"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        plugins: [
            //new TsConfigPathsPlugin()
        ]
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "awesome-typescript-loader"
                    }
                ]
            },
            {
                enforce: "pre",
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "source-map-loader"
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            meta: {
                viewport: "user-scalable=no, width=device-width, height=device-height",
                "focus-ring-visibility": "hidden"
            }
        })
    ]
};

module.exports = [envConfig];
