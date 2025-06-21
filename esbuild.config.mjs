import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");
const isBuild = process.argv.includes("--build");
const isDev = process.argv.includes("--dev");

const entryPoints = [
  "src/src-scripts/main.js",
  "src/src-scripts/theme-loader.js",
];

async function cleanUp(ctx) {
  if (ctx) {
    console.log("\nStopping watch...");
    await ctx.dispose(); // Clean up esbuild context
    console.log("✅ Watch mode stopped gracefully.");
  }
  process.exit(0); // Exit with a success code
}

if (isWatch) {
  let ctx = await esbuild.context({
    entryPoints: entryPoints,
    entryNames: "[name]",
    outdir: "src/theme/static/scripts",
    outbase: "src",
    bundle: true,
    minify: false,
  });
  await ctx.watch();
  console.log(
    "✅ Watching for changes in the following esbuild entry points..."
  );
  console.log(entryPoints);

  // Handle SIGINT (Ctrl+C) and SIGTERM (e.g., from Docker container)
  process.on("SIGINT", () => cleanUp(ctx));
  process.on("SIGTERM", () => cleanUp(ctx));

  console.log("Press Ctrl+C to stop watching.");
}

// Build once
if (isBuild) {
  let result = await esbuild.build({
    entryPoints: entryPoints,
    entryNames: "[name]",
    outdir: "src/theme/static/scripts",
    outbase: "src",
    bundle: true,
    minify: true,
  });
  if (result && result.errors.length === 0 && result.warnings.length === 0) {
    console.log("✅ Build complete");
  } else {
    console.log("❌ Build failed");
    if (result.errors.length > 0) {
      console.log(result.errors);
    }
    if (result.warnings.length > 0) {
      console.log(result.warnings);
    }
  }
}

if (isDev) {
  let result = await esbuild.build({
    entryPoints: entryPoints,
    entryNames: "[name]",
    outdir: "src/theme/static/scripts",
    outbase: "src",
    bundle: true,
    minify: false,
    sourcemap: "linked",
  });
  if (result && result.errors.length === 0 && result.warnings.length === 0) {
    console.log("✅ Build complete");
  } else {
    console.log("❌ Build failed");
    if (result.errors.length > 0) {
      console.log(result.errors);
    }
    if (result.warnings.length > 0) {
      console.log(result.warnings);
    }
  }
}
