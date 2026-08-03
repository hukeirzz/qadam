// Metro config for this Expo app living inside a Turborepo workspace.
// Without it Metro anchors the project root at the monorepo root (where deps
// are hoisted) and fails to resolve the app entry (`./index`) and hoisted
// packages. Pins the project root to this app and watches the workspace root.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
// Search the app's own node_modules and the hoisted workspace-root one, but
// keep hierarchical lookup ON so Metro still finds packages nested inside a
// dependency (e.g. react-native/node_modules/@react-native/virtualized-lists).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
