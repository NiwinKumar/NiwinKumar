// Renders every image on the profile README, in a dark and a light theme.
// Static content lives in CONTENT below; stats are fetched from the GitHub
// GraphQL API when GH_TOKEN is set (the daily workflow sets it).
//
//   node scripts/render.mjs              -> static assets + stats (if token)
//   STATS_MOCK=1 node scripts/render.mjs -> fake stats, for local previews only

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const USER = process.env.GH_USER || "NiwinKumar";

// ---------------------------------------------------------------- content
const CONTENT = {
  header: {
    kicker: "NIWIN KUMAR  /  SOFTWARE ENGINEER",
    place: "CHENNAI  ·  13.08°N  80.27°E",
    first: "Niwin",
    last: "Kumar",
    tagline: "Applied-AI products and agent tooling, built end to end.",
    status: "Open to roles",
    roles: "Full-stack · Product · Applied AI · Forward-deployed",
    where: "India · London · Europe · Remote",
  },
  cards: [
    {
      id: "willow",
      index: "01",
      label: "NOW BUILDING",
      title: "Willow",
      meta: "Google Cloud AI Builder Cup 2026",
      desc: [
        "Weekly clip-on dermatology-lens photos that",
        "show whether a skincare routine is working.",
        "Built for every skin tone.",
      ],
      tags: ["TypeScript", "Computer vision", "Gen AI"],
      art: "weeks",
    },
    {
      id: "mcp",
      index: "02",
      label: "AGENT TOOLING",
      title: "Creative-suite MCP",
      meta: "Launch-video automation",
      desc: [
        "An MCP server that lets an AI agent drive",
        "Resolve, Premiere Pro and After Effects to",
        "assemble edits and composites on its own.",
      ],
      tags: ["MCP", "Agents", "Media pipeline"],
      art: "graph",
    },
  ],
  work: [
    { id: "neuromancer", n: "03", title: "Neuromancer", desc: "Computer-use MCP: agents operating real Mac apps", stack: "PYTHON · MCP · MACOS" },
  ],
  toolkit: [
    ["LANGUAGES", ["TypeScript", "Python", "Swift", "Go · Java · Kotlin"]],
    ["PRODUCT", ["React · React Native", "Node · Express", "FastAPI · Django", "Flutter"]],
    ["AI / ML", ["PyTorch", "TensorFlow", "OpenCV", "LLM agents · MCP"]],
    ["INFRA", ["AWS · Firebase", "Postgres · MongoDB", "Kubernetes", "GitHub Actions"]],
  ],
  links: [
    ["linkedin", "LinkedIn"],
    ["email", "Email"],
    ["x", "X"],
  ],
  footer: {
    left: "VIT",
    mid: "Gymnastics gold medalist",
    line: "The discipline that won a medal is the one I ship with.",
  },
};

// ---------------------------------------------------------------- themes
const THEMES = {
  dark: {
    bg: "#0A0A0B", panel: "#0F0F11", line: "#1F1F23", line2: "#2A2A30",
    text: "#EDEDEF", muted: "#8B8B94", faint: "#4B4B53",
    accent: "#D8C3A0", accentHi: "#F3E5CB", glow: "#D8C3A0", glowOp: 0.16, gridOp: 0.55,
  },
  light: {
    bg: "#FAF9F6", panel: "#FFFFFF", line: "#E7E4DD", line2: "#D9D5CC",
    text: "#121214", muted: "#6B6A66", faint: "#B3AFA6",
    accent: "#8C6E44", accentHi: "#5E4826", glow: "#C9A774", glowOp: 0.20, gridOp: 0.7,
  },
};

// ACCENT=name picks a palette from ACCENTS (default below).
const ACCENTS = {
  champagne: { dark: ["#D8C3A0", "#F3E5CB"], light: ["#8C6E44", "#5E4826"] },
  mono:      { dark: ["#F2F2F4", "#FFFFFF"], light: ["#111113", "#000000"] },
  cobalt:    { dark: ["#7C9CFF", "#B8C9FF"], light: ["#2F55D4", "#1E3A9E"] },
  sage:      { dark: ["#8FCFB0", "#C6EBD8"], light: ["#2F7A58", "#1F5A40"] },
  ember:     { dark: ["#FF8A5B", "#FFC2A6"], light: ["#D2531F", "#9E3A12"] },
  lilac:     { dark: ["#B7A6FF", "#DDD4FF"], light: ["#5B45C9", "#3E2D99"] },
};
const ACCENT = process.env.ACCENT || "sage";
for (const k of ["dark", "light"]) {
  const [a, hi] = ACCENTS[ACCENT][k];
  THEMES[k].accent = a; THEMES[k].accentHi = hi; THEMES[k].glow = a;
}
if (ACCENT === "mono") { THEMES.dark.glowOp = 0.07; THEMES.light.glowOp = 0.05; }

const FONTS = `
  .sans{font-family:Inter,-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Helvetica,Arial,sans-serif}
  .serif{font-family:'Instrument Serif','New York','Iowan Old Style',Georgia,'Times New Roman',serif}
  .mono{font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,Consolas,monospace}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function svg(w, h, t, body, extraCss = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
<style>${FONTS}
  .rise{opacity:0;animation:rise .9s cubic-bezier(.2,.7,.2,1) forwards}
  @keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion: reduce){*{animation:none!important;opacity:1!important}}
${extraCss}</style>
${body}
</svg>`;
}

function grid(id, w, h, t, step = 40) {
  return `<defs>
  <pattern id="${id}-g" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    <path d="M${step} 0H0V${step}" stroke="${t.line}" stroke-width="1"/>
  </pattern>
  <radialGradient id="${id}-fade" cx="0.5" cy="0.35" r="0.75">
    <stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <mask id="${id}-m"><rect width="${w}" height="${h}" fill="url(#${id}-fade)"/></mask>
</defs>
<rect width="${w}" height="${h}" fill="url(#${id}-g)" mask="url(#${id}-m)" opacity="${t.gridOp}"/>`;
}

function frame(id, w, h, t, r = 22) {
  return `<defs><clipPath id="${id}-c"><rect width="${w}" height="${h}" rx="${r}"/></clipPath></defs>
<g clip-path="url(#${id}-c)"><rect width="${w}" height="${h}" fill="${t.panel}"/>`;
}
const frameEnd = (w, h, t, r = 22) =>
  `</g><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${r - 0.5}" stroke="${t.line}"/>`;

// ---------------------------------------------------------------- header
function header(t) {
  const W = 1200, H = 440, c = CONTENT.header;
  const body = `${frame("hd", W, H, t, 26)}
${grid("hd", W, H, t)}
<defs><radialGradient id="hd-glow" cx="0.82" cy="0.05" r="0.6">
  <stop offset="0" stop-color="${t.glow}" stop-opacity="${t.glowOp}"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/>
</radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#hd-glow)"/>

<text x="56" y="70" class="mono rise" font-size="15" letter-spacing="2.4" fill="${t.muted}">${esc(c.kicker)}</text>
<text x="${W - 56}" y="70" text-anchor="end" class="mono rise" font-size="15" letter-spacing="2.4" fill="${t.faint}">${esc(c.place)}</text>
<line x1="56" y1="96" x2="${W - 56}" y2="96" stroke="${t.line}"/>

<text x="52" y="236" class="rise" style="animation-delay:.12s" fill="${t.text}">
  <tspan class="sans" font-size="112" font-weight="600" letter-spacing="-5">${esc(c.first)}</tspan><tspan class="serif" font-size="120" font-style="italic" font-weight="400" letter-spacing="-2" fill="${t.accent}" dx="26">${esc(c.last)}</tspan>
</text>
<text x="58" y="292" class="sans rise" style="animation-delay:.25s" font-size="27" fill="${t.muted}" letter-spacing="-.3">${esc(c.tagline)}</text>

<line x1="56" y1="344" x2="${W - 56}" y2="344" stroke="${t.line}"/>
<g class="rise" style="animation-delay:.4s">
  <circle cx="68" cy="384" r="5" fill="${t.accent}"/>
  <circle cx="68" cy="384" r="5" fill="none" stroke="${t.accent}" class="ping"/>
  <text x="86" y="390" class="sans" font-size="18" font-weight="600" fill="${t.text}">${esc(c.status)}</text>
  <text x="214" y="390" class="mono" font-size="15" letter-spacing=".6" fill="${t.muted}">${esc(c.roles)}</text>
  <text x="${W - 56}" y="390" text-anchor="end" class="mono" font-size="15" letter-spacing=".6" fill="${t.faint}">${esc(c.where)}</text>
</g>
${frameEnd(W, H, t, 26)}`;
  const css = `  .ping{transform-origin:68px 384px;animation:ping 2.4s cubic-bezier(0,0,.2,1) infinite}
  @keyframes ping{0%{transform:scale(1);opacity:.9}80%,100%{transform:scale(3.4);opacity:0}}`;
  return svg(W, H, t, body, css);
}

// ---------------------------------------------------------------- link pills
function linkPill(t, label) {
  const W = 176, H = 52;
  return svg(W, H, t, `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="26" fill="${t.panel}" stroke="${t.line2}"/>
<text x="28" y="32" class="sans" font-size="17" font-weight="500" fill="${t.text}">${esc(label)}</text>
<path d="M${W - 42} 31l8-8m0 0h-6.5m6.5 0v6.5" stroke="${t.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);
}

// ---------------------------------------------------------------- section label
function section(t, n, label) {
  const W = 1200, H = 64;
  return svg(W, H, t, `<text x="4" y="40" class="mono" font-size="15" letter-spacing="2.4" fill="${t.accent}">${esc(n)}</text>
<text x="52" y="40" class="mono" font-size="15" letter-spacing="2.4" fill="${t.muted}">${esc(label)}</text>
<line x1="${52 + label.length * 11.5 + 24}" y1="35" x2="${W - 4}" y2="35" stroke="${t.line}"/>`);
}

// ---------------------------------------------------------------- project cards
function artWeeks(t, x, y) {
  // six weekly scans, skin texture getting calmer week over week
  let s = "";
  for (let i = 0; i < 6; i++) {
    const cx = x + i * 26, op = 0.18 + i * 0.16;
    s += `<circle cx="${cx}" cy="${y}" r="11" fill="${t.accent}" fill-opacity="${op.toFixed(2)}" stroke="${t.accent}" stroke-opacity="${(op + 0.1).toFixed(2)}"/>`;
    s += `<text x="${cx}" y="${y + 34}" text-anchor="middle" class="mono" font-size="11" fill="${t.faint}">W${i + 1}</text>`;
  }
  s += `<circle cx="${x + 130}" cy="${y}" r="11" fill="none" stroke="${t.accentHi}" class="ring"/>`;
  return s;
}
function artGraph(t, x, y) {
  const nodes = [[x, y - 34, "RES"], [x, y, "PR"], [x, y + 34, "AE"]];
  const hub = [x + 128, y];
  let s = "";
  for (const [nx, ny] of nodes) {
    s += `<path d="M${nx + 16} ${ny}C${nx + 80} ${ny} ${hub[0] - 70} ${hub[1]} ${hub[0] - 16} ${hub[1]}" stroke="${t.line2}"/>`;
    s += `<path d="M${nx + 16} ${ny}C${nx + 80} ${ny} ${hub[0] - 70} ${hub[1]} ${hub[0] - 16} ${hub[1]}" stroke="${t.accent}" stroke-dasharray="4 10" class="flow"/>`;
  }
  for (const [nx, ny, l] of nodes) {
    s += `<rect x="${nx - 18}" y="${ny - 12}" width="36" height="24" rx="7" fill="${t.panel}" stroke="${t.line2}"/>`;
    s += `<text x="${nx}" y="${ny + 4}" text-anchor="middle" class="mono" font-size="10" fill="${t.muted}">${l}</text>`;
  }
  s += `<circle cx="${hub[0]}" cy="${hub[1]}" r="16" fill="${t.accent}" fill-opacity=".14" stroke="${t.accent}"/>`;
  s += `<circle cx="${hub[0]}" cy="${hub[1]}" r="4" fill="${t.accent}"/>`;
  return s;
}

function card(t, c) {
  const W = 600, H = 360;
  let tagX = 40, tags = "";
  for (const tag of c.tags) {
    const w = tag.length * 9.2 + 30;
    tags += `<rect x="${tagX}" y="290" width="${w}" height="32" rx="16" stroke="${t.line2}"/>
<text x="${tagX + w / 2}" y="311" text-anchor="middle" class="mono" font-size="13.5" fill="${t.muted}">${esc(tag)}</text>`;
    tagX += w + 10;
  }
  const art = c.art === "weeks" ? artWeeks(t, 428, 112) : artGraph(t, 428, 118);
  const body = `${frame(c.id, W, H, t)}
${grid(c.id, W, H, t, 30)}
<text x="40" y="58" class="mono" font-size="14" letter-spacing="2" fill="${t.accent}">${c.index}</text>
<text x="76" y="58" class="mono" font-size="14" letter-spacing="2" fill="${t.muted}">${esc(c.label)}</text>
<path d="M${W - 52} 52l10-10m0 0h-8m8 0v8" stroke="${t.muted}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
<text x="38" y="136" class="sans" font-size="40" font-weight="600" letter-spacing="-1.4" fill="${t.text}">${esc(c.title)}</text>
<text x="40" y="168" class="mono" font-size="13.5" letter-spacing=".4" fill="${t.faint}">${esc(c.meta)}</text>
${art}
${c.desc.map((l, i) => `<text x="40" y="${214 + i * 26}" class="sans" font-size="18" fill="${t.muted}">${esc(l)}</text>`).join("\n")}
${tags}
${frameEnd(W, H, t)}`;
  const css = `  .flow{animation:flow 1.6s linear infinite}@keyframes flow{to{stroke-dashoffset:-28}}
  .ring{transform-box:fill-box;transform-origin:center;animation:ring 2.4s ease-in-out infinite}
  @keyframes ring{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.45);opacity:0}}`;
  return svg(W, H, t, body, css);
}

// ---------------------------------------------------------------- work rows
function row(t, w) {
  const W = 1200, H = 92;
  return svg(W, H, t, `<line x1="0" y1="${H - .5}" x2="${W}" y2="${H - .5}" stroke="${t.line}"/>
<text x="4" y="54" class="mono" font-size="15" letter-spacing="1.5" fill="${t.faint}">${w.n}</text>
<text x="60" y="56" class="sans" font-size="26" font-weight="600" letter-spacing="-.6" fill="${t.text}">${esc(w.title)}</text>
<text x="440" y="55" class="sans" font-size="19" fill="${t.muted}">${esc(w.desc)}</text>
<text x="${W - 50}" y="54" text-anchor="end" class="mono" font-size="13.5" letter-spacing="1.4" fill="${t.faint}">${esc(w.stack)}</text>
<path d="M${W - 26} 54l9-9m0 0h-7m7 0v7" stroke="${t.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);
}

// ---------------------------------------------------------------- toolkit
function toolkit(t) {
  const W = 1200, H = 270, colW = (W - 80) / 4;
  let cols = "";
  CONTENT.toolkit.forEach(([label, items], i) => {
    const x = 40 + i * colW;
    if (i) cols += `<line x1="${x - 20}" y1="44" x2="${x - 20}" y2="${H - 44}" stroke="${t.line}"/>`;
    cols += `<text x="${x}" y="72" class="mono" font-size="14" letter-spacing="2" fill="${t.accent}">${esc(label)}</text>`;
    items.forEach((it, j) => {
      cols += `<text x="${x}" y="${118 + j * 34}" class="sans" font-size="19" fill="${j ? t.muted : t.text}">${esc(it)}</text>`;
    });
  });
  return svg(W, H, t, `${frame("tk", W, H, t)}${cols}${frameEnd(W, H, t)}`);
}

// ---------------------------------------------------------------- footer
function footer(t) {
  const W = 1200, H = 150, f = CONTENT.footer;
  return svg(W, H, t, `<line x1="0" y1=".5" x2="${W}" y2=".5" stroke="${t.line}"/>
<text x="${W / 2}" y="68" text-anchor="middle" class="serif" font-style="italic" font-size="30" fill="${t.text}">${esc(f.line)}</text>
<text x="${W / 2}" y="112" text-anchor="middle" class="mono" font-size="14" letter-spacing="2.4" fill="${t.faint}">${esc(f.left.toUpperCase())}   ·   ${esc(f.mid.toUpperCase())}</text>`);
}

// ---------------------------------------------------------------- stats
async function fetchStats() {
  if (process.env.STATS_MOCK) return mockStats();
  const token = process.env.GH_TOKEN;
  if (!token) return null;
  const q = `query($login:String!){user(login:$login){
    contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{contributionCount date}}}}
    repositories(ownerAffiliations:OWNER,isFork:false,first:100,privacy:PUBLIC){totalCount
      nodes{languages(first:6,orderBy:{field:SIZE,direction:DESC}){edges{size node{name}}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "profile-render" },
    body: JSON.stringify({ query: q, variables: { login: USER } }),
  });
  const json = await res.json();
  if (!json.data?.user) throw new Error("GitHub API: " + JSON.stringify(json.errors || json));
  const u = json.data.user;
  const cal = u.contributionsCollection.contributionCalendar;
  const langs = {};
  for (const r of u.repositories.nodes)
    for (const e of r.languages.edges) langs[e.node.name] = (langs[e.node.name] || 0) + e.size;
  return {
    total: cal.totalContributions,
    weeks: cal.weeks.map((w) => w.contributionDays.map((d) => ({ c: d.contributionCount, d: d.date }))),
    repos: u.repositories.totalCount,
    langs,
  };
}

function mockStats() {
  const weeks = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const start = new Date(Date.now() - 52 * 7 * 864e5);
  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const busy = w > 44 ? 3 : 1;
      const c = rnd() < 0.3 ? 0 : Math.floor(rnd() * 8 * busy);
      days.push({ c, d: new Date(+start + (w * 7 + d) * 864e5).toISOString().slice(0, 10) });
    }
    weeks.push(days);
  }
  return { total: weeks.flat().reduce((a, b) => a + b.c, 0), weeks, repos: 24,
    langs: { TypeScript: 50, Python: 30, Swift: 10, JavaScript: 8, Go: 2 } };
}

function streaks(weeks) {
  const days = weeks.flat();
  let longest = 0, run = 0;
  for (const d of days) { run = d.c ? run + 1 : 0; longest = Math.max(longest, run); }
  let i = days.length - 1, current = 0;
  if (i >= 0 && days[i].c === 0) i--; // today not counted until it has activity
  for (; i >= 0 && days[i].c > 0; i--) current++;
  return { current, longest };
}

function stats(t, s) {
  const W = 1200, H = 330;
  if (!s) {
    return svg(W, H, t, `${frame("st", W, H, t)}${grid("st", W, H, t)}
<text x="${W / 2}" y="${H / 2 + 6}" text-anchor="middle" class="mono" font-size="15" letter-spacing="2.4" fill="${t.muted}">SYNCING ACTIVITY…</text>${frameEnd(W, H, t)}`);
  }
  const { current, longest } = streaks(s.weeks);
  const counts = s.weeks.flat().map((d) => d.c).filter(Boolean).sort((a, b) => a - b);
  const qt = (p) => counts[Math.floor(p * (counts.length - 1))] || 1;
  const cuts = [qt(0.25), qt(0.5), qt(0.75)];
  const level = (c) => (c === 0 ? 0 : c <= cuts[0] ? 1 : c <= cuts[1] ? 2 : c <= cuts[2] ? 3 : 4);
  const ops = [0, 0.28, 0.5, 0.75, 1];

  const cell = 11, gap = 3, hx = 424, hy = 76;
  let cells = "";
  s.weeks.slice(-53).forEach((wk, wi) => wk.forEach((d, di) => {
    const L = level(d.c);
    const x = hx + wi * (cell + gap), y = hy + di * (cell + gap);
    cells += L
      ? `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${t.accent}" fill-opacity="${ops[L]}"/>`
      : `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${t.line}"/>`;
  }));

  const nums = [
    [s.total.toLocaleString("en-US"), "CONTRIBUTIONS · 12 MO"],
    [`${current}d`, "CURRENT STREAK"],
    [`${longest}d`, "LONGEST STREAK"],
  ];
  let left = "";
  nums.forEach(([v, l], i) => {
    const y = i === 0 ? 120 : 210;
    const x = i === 0 ? 40 : i === 1 ? 40 : 200;
    left += `<text x="${x}" y="${y}" class="sans" font-size="${i === 0 ? 56 : 38}" font-weight="600" letter-spacing="-1.6" fill="${t.text}">${esc(v)}</text>`;
    left += `<text x="${x + 2}" y="${y + 28}" class="mono" font-size="12.5" letter-spacing="1.8" fill="${t.faint}">${esc(l)}</text>`;
  });

  // language bar
  const entries = Object.entries(s.langs).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sum = entries.reduce((a, [, v]) => a + v, 0) || 1;
  const barX = hx, barW = 53 * (cell + gap) - gap, barY = 220;
  let bx = barX, bar = "", legend = "", lx = barX;
  entries.forEach(([name, v], i) => {
    const w = (v / sum) * barW;
    const op = [1, 0.7, 0.48, 0.32, 0.2][i];
    bar += `<rect x="${bx}" y="${barY}" width="${Math.max(w - 3, 2)}" height="8" rx="4" fill="${t.accent}" fill-opacity="${op}"/>`;
    bx += w;
    const label = `${name} ${Math.round((v / sum) * 100)}%`;
    legend += `<circle cx="${lx + 4}" cy="${barY + 37}" r="4" fill="${t.accent}" fill-opacity="${op}"/>
<text x="${lx + 14}" y="${barY + 42}" class="mono" font-size="13" fill="${t.muted}">${esc(label)}</text>`;
    lx += label.length * 8.2 + 34;
  });

  const updated = new Date().toISOString().slice(0, 10);
  const body = `${frame("st", W, H, t)}
<line x1="380" y1="40" x2="380" y2="${H - 40}" stroke="${t.line}"/>
<text x="40" y="56" class="mono" font-size="14" letter-spacing="2" fill="${t.accent}">GITHUB</text>
${left}
<text x="${hx}" y="56" class="mono" font-size="14" letter-spacing="2" fill="${t.muted}">LAST 12 MONTHS</text>
<text x="${hx + barW}" y="56" text-anchor="end" class="mono" font-size="12.5" letter-spacing="1.4" fill="${t.faint}">UPDATED ${updated}</text>
${cells}
${bar}
${legend}
<text x="40" y="${H - 40}" class="mono" font-size="12.5" letter-spacing="1.8" fill="${t.faint}">${s.repos} PUBLIC REPOS</text>
${frameEnd(W, H, t)}`;
  return svg(W, H, t, body);
}

// ---------------------------------------------------------------- write
const out = (theme, name, data) => {
  const p = join(ROOT, "assets", theme, name);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, data);
};

const s = await fetchStats().catch((e) => { console.error(e.message); return null; });
for (const [name, t] of Object.entries(THEMES)) {
  out(name, "header.svg", header(t));
  for (const [id, label] of CONTENT.links) out(name, `link-${id}.svg`, linkPill(t, label));
  out(name, "s-building.svg", section(t, "—", "WHAT I'M BUILDING"));
  out(name, "s-work.svg", section(t, "—", "SELECTED WORK"));
  out(name, "s-toolkit.svg", section(t, "—", "TOOLKIT"));
  out(name, "s-activity.svg", section(t, "—", "ACTIVITY"));
  for (const c of CONTENT.cards) out(name, `card-${c.id}.svg`, card(t, c));
  for (const w of CONTENT.work) out(name, `work-${w.id}.svg`, row(t, w));
  out(name, "toolkit.svg", toolkit(t));
  out(name, "footer.svg", footer(t));
  // keep the last good stats file if the API call failed
  if (s || !existsSync(join(ROOT, "assets", name, "stats.svg"))) out(name, "stats.svg", stats(t, s));
}
console.log("rendered", s ? "with stats" : "without stats");
