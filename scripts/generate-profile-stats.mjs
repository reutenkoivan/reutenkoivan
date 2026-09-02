import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const username = process.env.PROFILE_USERNAME;
const token = process.env.GITHUB_TOKEN;
const outputPath = process.env.PROFILE_STATS_PATH ?? "profile/stats.svg";

if (!username) {
  throw new Error("PROFILE_USERNAME is required");
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function githubRequest(path, attempt = 1) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "reutenkoivan-profile-stats",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com${path}`, { headers });

  if (response.ok) {
    return response.json();
  }

  const retryable = response.status === 403 || response.status === 429 || response.status >= 500;
  if (retryable && attempt < 3) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : attempt * 2000;
    await wait(delay);
    return githubRequest(path, attempt + 1);
  }

  const detail = (await response.text()).slice(0, 300);
  throw new Error(`GitHub API ${response.status} for ${path}: ${detail}`);
}

async function loadPublicActivity() {
  const profile = await githubRequest(`/users/${encodeURIComponent(username)}`);
  const events = [];

  for (let page = 1; page <= 3; page += 1) {
    const batch = await githubRequest(
      `/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`,
    );
    events.push(...batch);
    if (batch.length < 100) break;
  }

  return {
    activeDays: new Set(events.map(({ created_at }) => created_at?.slice(0, 10)).filter(Boolean)).size,
    activeRepositories: new Set(events.map(({ repo }) => repo?.name).filter(Boolean)).size,
    events: events.length,
    repositories: Number(profile.public_repos ?? 0),
  };
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { notation: value >= 10_000 ? "compact" : "standard" }).format(value);
}

function renderSvg(activity) {
  const metrics = [
    ["Public repos", activity.repositories],
    ["Active repos", activity.activeRepositories],
    ["Active days", activity.activeDays],
    ["Recent events", activity.events],
  ];

  const metricMarkup = metrics
    .map(([label, value], index) => {
      const x = 28 + index * 159;
      const separator = index === 0 ? "" : `<path class="line" d="M ${x - 18} 76 V 139"/>`;
      return `${separator}
  <text class="value" x="${x}" y="105">${escapeXml(formatNumber(value))}</text>
  <text class="label" x="${x}" y="128">${escapeXml(label)}</text>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" width="680" height="164" viewBox="0 0 680 164">
  <title id="title">Public GitHub activity for ${escapeXml(username)}</title>
  <desc id="desc">Public repositories, recently active repositories, active days, and recent public events.</desc>
  <style>
    .card { fill: #f6f8fa; stroke: #d0d7de; }
    .heading { fill: #1f2328; font: 600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .subtle { fill: #656d76; font: 400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .value { fill: #1a7f37; font: 700 23px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .label { fill: #656d76; font: 500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .line { stroke: #d0d7de; }
    @media (prefers-color-scheme: dark) {
      .card { fill: #161b22; stroke: #30363d; }
      .heading { fill: #e6edf3; }
      .subtle, .label { fill: #8d96a0; }
      .value { fill: #3fb950; }
      .line { stroke: #30363d; }
    }
  </style>
  <rect class="card" x="0.5" y="0.5" width="679" height="163" rx="7"/>
  <text class="heading" x="28" y="35">Public GitHub activity</text>
  <text class="subtle" x="28" y="56">Recent public events · refreshed weekly · no rank</text>
${metricMarkup}
</svg>
`;
}

const activity = await loadPublicActivity();
const svg = renderSvg(activity);
const temporaryPath = `${outputPath}.tmp`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(temporaryPath, svg, "utf8");
await rename(temporaryPath, outputPath);

console.log(`Generated ${outputPath} for ${username}:`, activity);
