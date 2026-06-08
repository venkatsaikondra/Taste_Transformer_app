const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On native: force the native-only LottieView entry (skip index.web.js)
  if (
    moduleName === "lottie-react-native" &&
    (platform === "ios" || platform === "android")
  ) {
    return {
      filePath: path.resolve(
        __dirname,
        "node_modules/lottie-react-native/lib/commonjs/index.js"
      ),
      type: "sourceFile",
    };
  }
  // On web: use stub so web bundle doesn't try to load dotlottie player
  if (moduleName === "lottie-react-native" && platform === "web") {
    return {
      filePath: path.resolve(__dirname, "stubs/lottie-react-native.web.tsx"),
      type: "sourceFile",
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
