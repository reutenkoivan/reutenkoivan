import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, extname } from "node:path";

const username = process.env.PROFILE_USERNAME;
const token = process.env.GITHUB_TOKEN;
const desktopOutputPath = process.env.PROFILE_STATS_PATH ?? "profile/stats.svg";
const mobileOutputPath = process.env.PROFILE_STATS_MOBILE_PATH ?? withMobileSuffix(desktopOutputPath);
const now = process.env.PROFILE_NOW ? new Date(process.env.PROFILE_NOW) : new Date();

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;
const WEEK_COUNT = 12;

if (!username) {
  throw new Error("PROFILE_USERNAME is required");
}

if (Number.isNaN(now.getTime())) {
  throw new Error("PROFILE_NOW must be a valid date when provided");
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function withMobileSuffix(path) {
  const extension = extname(path);
  return extension ? `${path.slice(0, -extension.length)}-mobile${extension}` : `${path}-mobile.svg`;
}

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

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfUtcWeek(date) {
  const day = startOfUtcDay(date);
  const daysSinceMonday = (day.getUTCDay() + 6) % 7;
  return new Date(day.getTime() - daysSinceMonday * DAY);
}

function createActivityWindow(date) {
  const currentDay = startOfUtcDay(date);
  const currentWeek = startOfUtcWeek(currentDay);
  return {
    start: new Date(currentWeek.getTime() - (WEEK_COUNT - 1) * WEEK),
    end: currentDay,
    endExclusive: new Date(currentDay.getTime() + DAY),
  };
}

async function loadPublicActivity(window) {
  const profile = await githubRequest(`/users/${encodeURIComponent(username)}`);
  const events = [];

  for (let page = 1; page <= 3; page += 1) {
    const batch = await githubRequest(
      `/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`,
    );
    events.push(...batch);
    if (batch.length < 100) break;
  }

  const eventsInWindow = events.filter(({ created_at: createdAt }) => {
    const timestamp = Date.parse(createdAt ?? "");
    return Number.isFinite(timestamp) && timestamp >= window.start.getTime() && timestamp < window.endExclusive.getTime();
  });

  const activeDateKeys = new Set(
    eventsInWindow.map(({ created_at: createdAt }) => createdAt.slice(0, 10)),
  );
  const activeDaysByWeek = Array.from({ length: WEEK_COUNT }, () => 0);

  for (const dateKey of activeDateKeys) {
    const timestamp = Date.parse(`${dateKey}T00:00:00Z`);
    const weekIndex = Math.floor((timestamp - window.start.getTime()) / WEEK);
    if (weekIndex >= 0 && weekIndex < WEEK_COUNT) {
      activeDaysByWeek[weekIndex] += 1;
    }
  }

  return {
    activeDays: activeDateKeys.size,
    activeDaysByWeek,
    activeRepositories: new Set(eventsInWindow.map(({ repo }) => repo?.name).filter(Boolean)).size,
    repositories: Number(profile.public_repos ?? 0),
    window,
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

function pluralize(value, singular, plural = `${singular}s`) {
  return `${formatNumber(value)} ${value === 1 ? singular : plural}`;
}

function formatDate(date, options) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(date);
}

function formatDateRange({ start, end }) {
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const startLabel = formatDate(start, { month: "short", day: "numeric", year: sameYear ? undefined : "numeric" });
  const endLabel = formatDate(end, { month: "short", day: "numeric", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

function weekStarts(window) {
  return Array.from({ length: WEEK_COUNT }, (_, index) => new Date(window.start.getTime() + index * WEEK));
}

function activityLevel(days) {
  if (days === 0) return 0;
  if (days === 1) return 1;
  if (days === 2) return 2;
  if (days <= 4) return 3;
  return 4;
}

function renderSummary(activity, x, primaryY, secondaryY) {
  if (activity.activeDays === 0) {
    return `<text class="summary strong" x="${x}" y="${primaryY}" text-anchor="end">No public activity recorded in this period</text>
  <text class="summary" x="${x}" y="${secondaryY}" text-anchor="end">${escapeXml(pluralize(activity.repositories, "public repo"))}</text>`;
  }

  return `<text class="summary strong" x="${x}" y="${primaryY}" text-anchor="end">${escapeXml(pluralize(activity.activeDays, "active day"))}</text>
  <text class="summary" x="${x}" y="${secondaryY}" text-anchor="end">across ${escapeXml(pluralize(activity.activeRepositories, "repository", "repositories"))} · ${escapeXml(pluralize(activity.repositories, "public repo"))}</text>`;
}

function renderDesktopSvg(activity) {
  const dates = weekStarts(activity.window);
  const cellWidth = 62.67;
  const cellGap = 4;
  const cellMarkup = activity.activeDaysByWeek
    .map((days, index) => {
      const x = 22 + index * (cellWidth + cellGap);
      const center = x + cellWidth / 2;
      const label = formatDate(dates[index], { month: "short", day: "numeric" }).toUpperCase();
      return `<g>
    <rect class="week level-${activityLevel(days)}" x="${x.toFixed(2)}" y="64" width="${cellWidth}" height="56" rx="4"/>
    <text class="week-value" x="${center.toFixed(2)}" y="91" text-anchor="middle">${days}</text>
    <text class="week-label" x="${center.toFixed(2)}" y="110" text-anchor="middle">${escapeXml(label)}</text>
  </g>`;
    })
    .join("\n  ");

  const description = `${pluralize(activity.activeDays, "active day")} across ${pluralize(activity.activeRepositories, "repository", "repositories")} from ${formatDateRange(activity.window)}. ${pluralize(activity.repositories, "public repository", "public repositories")}. Weekly active day counts: ${activity.activeDaysByWeek.join(", ")}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" width="840" height="140" viewBox="0 0 840 140">
  <title id="title">Public GitHub activity for ${escapeXml(username)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <style>
    .card { fill: #ffffff; stroke: #d0d7de; }
    .kicker { fill: #1f2328; font: 600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .date, .summary, .week-label { fill: #656d76; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .date { font-size: 12px; }
    .summary { font-size: 11px; }
    .strong { fill: #1f2328; font-size: 15px; font-weight: 600; }
    .week { fill: #f6f8fa; stroke: #d0d7de; }
    .level-1 { fill: #dafbe1; stroke: #9be9a8; }
    .level-2 { fill: #aceebb; stroke: #40c463; }
    .level-3 { fill: #6fdd8b; stroke: #30a14e; }
    .level-4 { fill: #4ac26b; stroke: #216e39; }
    .week-value { fill: #1f2328; font: 600 17px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .week-label { font-size: 8px; }
    @media (prefers-color-scheme: dark) {
      .card { fill: #0d1117; stroke: #30363d; }
      .kicker, .strong, .week-value { fill: #e6edf3; }
      .date, .summary, .week-label { fill: #8d96a0; }
      .week { fill: #161b22; stroke: #30363d; }
      .level-1 { fill: #0e4429; stroke: #0e4429; }
      .level-2 { fill: #006d32; stroke: #006d32; }
      .level-3 { fill: #26a641; stroke: #26a641; }
      .level-4 { fill: #39d353; stroke: #39d353; }
    }
  </style>
  <rect class="card" x="0.5" y="0.5" width="839" height="139" rx="7"/>
  <text class="kicker" x="22" y="25">Last 12 weeks</text>
  <text class="date" x="22" y="45">${escapeXml(formatDateRange(activity.window))}</text>
  ${renderSummary(activity, 818, 25, 44)}
  ${cellMarkup}
</svg>
`;
}

function renderMobileSvg(activity) {
  const dates = weekStarts(activity.window);
  const rowMarkup = activity.activeDaysByWeek
    .map((days, index) => {
      const centerY = 105 + index * 13;
      const barWidth = days === 0 ? 4 : 8 + (days / 7) * 182;
      const label = formatDate(dates[index], { month: "short", day: "numeric" });
      return `<g>
    <text class="week-label" x="16" y="${centerY + 3}">${escapeXml(label)}</text>
    <rect class="track" x="76" y="${centerY - 4}" width="190" height="7" rx="3.5"/>
    <rect class="bar level-${activityLevel(days)}" x="76" y="${centerY - 4}" width="${barWidth.toFixed(2)}" height="7" rx="3.5"/>
    <text class="week-count" x="304" y="${centerY + 3}" text-anchor="end">${days}</text>
  </g>`;
    })
    .join("\n  ");

  const description = `${pluralize(activity.activeDays, "active day")} across ${pluralize(activity.activeRepositories, "repository", "repositories")} from ${formatDateRange(activity.window)}. ${pluralize(activity.repositories, "public repository", "public repositories")}. Weekly active day counts: ${activity.activeDaysByWeek.join(", ")}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" width="320" height="266" viewBox="0 0 320 266">
  <title id="title">Public GitHub activity for ${escapeXml(username)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <style>
    .card { fill: #ffffff; stroke: #d0d7de; }
    .kicker { fill: #1f2328; font: 600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .date, .summary, .week-label { fill: #656d76; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .date { font-size: 12px; }
    .summary { font-size: 11px; }
    .strong { fill: #1f2328; font-size: 15px; font-weight: 600; }
    .week-label { font-size: 9px; }
    .track, .bar { fill: #ebedf0; }
    .level-1 { fill: #9be9a8; }
    .level-2 { fill: #40c463; }
    .level-3 { fill: #30a14e; }
    .level-4 { fill: #216e39; }
    .week-count { fill: #1f2328; font: 600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    @media (prefers-color-scheme: dark) {
      .card { fill: #0d1117; stroke: #30363d; }
      .kicker, .strong, .week-count { fill: #e6edf3; }
      .date, .summary, .week-label { fill: #8d96a0; }
      .track, .bar { fill: #161b22; }
      .level-1 { fill: #0e4429; }
      .level-2 { fill: #006d32; }
      .level-3 { fill: #26a641; }
      .level-4 { fill: #39d353; }
    }
  </style>
  <rect class="card" x="0.5" y="0.5" width="319" height="265" rx="7"/>
  <text class="kicker" x="16" y="24">Last 12 weeks</text>
  <text class="date" x="16" y="42">${escapeXml(formatDateRange(activity.window))}</text>
  ${activity.activeDays === 0
    ? `<text class="summary strong" x="16" y="66">No public activity recorded</text>
  <text class="summary" x="16" y="83">in this period · ${escapeXml(pluralize(activity.repositories, "public repo"))}</text>`
    : `<text class="summary strong" x="16" y="66">${escapeXml(pluralize(activity.activeDays, "active day"))}</text>
  <text class="summary" x="16" y="83">across ${escapeXml(pluralize(activity.activeRepositories, "repository", "repositories"))} · ${escapeXml(pluralize(activity.repositories, "public repo"))}</text>`}
  ${rowMarkup}
</svg>
`;
}

async function writeSvg(path, svg) {
  const temporaryPath = `${path}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(temporaryPath, svg, "utf8");
  await rename(temporaryPath, path);
}

const activityWindow = createActivityWindow(now);
const activity = await loadPublicActivity(activityWindow);

await Promise.all([
  writeSvg(desktopOutputPath, renderDesktopSvg(activity)),
  writeSvg(mobileOutputPath, renderMobileSvg(activity)),
]);

console.log(`Generated ${desktopOutputPath} and ${mobileOutputPath} for ${username}:`, {
  activeDays: activity.activeDays,
  activeDaysByWeek: activity.activeDaysByWeek,
  activeRepositories: activity.activeRepositories,
  dateRange: formatDateRange(activity.window),
  repositories: activity.repositories,
});
