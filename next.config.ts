import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? "/zyfl-formation-lab" : "",
  assetPrefix: isGitHubPages ? "/zyfl-formation-lab/" : "",
  images: { unoptimized: true },
};

export default nextConfig;
