module.exports = function (api) {
  const platform = api.caller((c) => c?.platform);
  const isWeb = platform === "web";
  api.cache.using(() => platform ?? "unknown");

  return {
    presets: [
      [
        "babel-preset-expo",
        isWeb ? { jsxImportSource: "nativewind" } : {},
      ],
      "nativewind/babel",
    ],
  };
};
