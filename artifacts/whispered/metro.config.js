const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Block stale tmp directories that cause Metro ENOENT watcher crashes
config.resolver.blockList = /node_modules[/\\]\.pnpm[/\\].*_tmp_\d+[/\\].*/;

// Monorepo: ensure workspace packages are watched
const workspaceRoot = path.resolve(__dirname, "../..");
config.watchFolders = [workspaceRoot];

module.exports = config;
