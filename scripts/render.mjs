// Renders every image on the profile README, in a dark and a light theme.
// Content lives in CONTENT below; contribution stats come from the GitHub
// GraphQL API when GH_TOKEN is set (the daily workflow sets it).
//
//   node scripts/render.mjs              -> all images, live stats if GH_TOKEN is set
//   STATS_MOCK=1 node scripts/render.mjs -> fake stats, for local previews only
//
// Type is SF Pro on Apple devices (the system font, which can't be embedded).
// Every image also embeds an Inter subset, its closest open match, for other
// systems. Layout is measured with Inter so CI renders the same layout.

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import subsetFont from "subset-font";
import * as fontkit from "fontkit";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const USER = process.env.GH_USER || "NiwinKumar";
const require = createRequire(import.meta.url);
const INTER = readFileSync(require.resolve("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"));

// ---------------------------------------------------------------- content
const CONTENT = {
  hero: {
    status: "Open to roles in London and remote",
    title: ["Building AI products and", "the agents that run them."],
    sub: ["I’m Niwin, a full-stack engineer at HappyFox. I take products", "from the first sketch to production, end to end."],
    app: {
      nav: [["Inbox", false], ["Runs", true], ["Agents", false]],
      projects: ["Willow", "Neuromancer", "Website MCP"],
      run: "Audit and fix /pricing",
      status: "Awaiting approval",
      steps: [
        ["seo.audit_page", "/pricing", "3 issues", "1.2s"],
        ["cms.edit_block", "title, meta description", "done", "0.8s"],
        ["cms.edit_block", "image alt text", "done", "0.6s"],
        ["cms.preview", "draft 482", "ready", "2.1s"],
        ["cms.publish", "needs your approval", "waiting", ""],
      ],
    },
  },
  stats: [["2", "products shipped at HappyFox"], ["2", "MCP servers built"], ["8.4", "CGPA, VIT Chennai"], ["Gold", "in gymnastics"]],
  willow: {
    label: "Now building",
    title: "Willow",
    desc: ["Weekly photos through a clip-on dermatology", "lens show whether your skincare routine is", "actually working, for every skin tone."],
    stack: "React  /  FastAPI  /  Gemini  /  Cloud Run",
    link: "meetwillow.web.app",
  },
  cards: [
    { id: "neuromancer", art: "cursor", title: "Neuromancer", link: true,
      desc: ["Computer-use MCP. Agents operate browsers,", "terminal jobs and documents on a real Mac", "through one endpoint."] },
    { id: "sitemcp", art: "gate", title: "Website MCP servers",
      desc: ["Agents audit SEO, edit pages and preview", "changes on the company site, then publish", "only when a person approves. At HappyFox."] },
    { id: "mentor", art: "rings", title: "Mentor",
      desc: ["A native iOS fitness app for routines,", "workout logs and gym bookings, with offline", "writes that sync when you’re back online."] },
    { id: "integrations", art: "hub", title: "Enterprise integrations",
      desc: ["SaaS, ERP and telephony integrations end", "to end: OAuth, data sync, event delivery", "and customer setup. At HappyFox."] },
  ],
  experience: [
    { when: "Jul 2025 – now", role: "Full-stack engineer, product and platform", org: "HappyFox",
      line: "Pitched and shipped two new products, plus MCP servers, integrations and migrations." },
    { when: "Feb – Jul 2025", role: "Backend engineer intern", org: "HappyFox",
      line: "LLM-assisted internal tools, third-party integrations and hiring-tool features." },
    { when: "2020 – 2025", role: "B.Tech and M.Tech, Computer Science", org: "VIT Chennai",
      line: "Business analytics and AI/ML, CGPA 8.4. Gymnastics gold medalist." },
  ],
  stack: [
    "TypeScript", "React", "Next.js", "Astro", "SwiftUI", "Tailwind",
    "Python", "Django", "FastAPI", "Node.js", "Java", "PostgreSQL",
    "MCP", "Function calling", "Gemini", "Bedrock", "Vertex AI", "Redis",
    "AWS", "Cloud Run", "Firebase", "BigQuery", "Docker", "GitHub Actions",
  ],
  cta: {
    title: "Let’s build something.",
    sub: "Open to full-stack, product and applied-AI roles in London and remote.",
    button: "niwinkumar77@gmail.com",
    left: "© 2026 Niwin Kumar",
    right: "Chennai, India",
  },
};

// ---------------------------------------------------------------- themes
const THEMES = {
  dark: {
    bg: "#000000", panel: "#0A0A0A", raised: "#111111", line: "#1F1F1F", line2: "#2A2A2A",
    text: "#EDEDED", muted: "#A1A1A1", faint: "#5E5E5E", top: "#FFFFFF", bottom: "#8F8F8F",
    glow: "#7C83FF", glowOp: 0.22, inverse: "#000000",
    ok: "#4ADE80", warn: "#F5A524",
    heat: ["#141414", "#232323", "#3A3A3A", "#666666", "#B5B5B5"],
  },
  light: {
    bg: "#FFFFFF", panel: "#FFFFFF", raised: "#FAFAFA", line: "#EAEAEA", line2: "#DEDEDE",
    text: "#171717", muted: "#666666", faint: "#A8A8A8", top: "#000000", bottom: "#6B6B6B",
    glow: "#7C83FF", glowOp: 0.12, inverse: "#FFFFFF",
    ok: "#16A34A", warn: "#D97706",
    heat: ["#F2F2F2", "#DADADA", "#A9A9A9", "#5F5F5F", "#111111"],
  },
};

// ---------------------------------------------------------------- type
const WEIGHTS = [400, 500, 600];
const ALL = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("") + "’–—©·";
const METRICS = {};
for (const w of WEIGHTS) METRICS[w] = fontkit.create(await subsetFont(INTER, ALL, { targetFormat: "truetype", variationAxes: { wght: w } }));
function measure(s, w = 400, size = 16, track = 0) {
  const f = METRICS[w];
  return (f.layout(s).advanceWidth / f.unitsPerEm) * size + track * size * Math.max(0, [...s].length - 1);
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");
const unesc = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const f1 = (n) => +(+n).toFixed(1);

// w = weight; mono text uses the platform's monospace and embeds nothing.
function T(x, y, s, { w = 400, size = 16, fill, track = 0, anchor, op, mono = false } = {}) {
  const cls = mono ? "mono" : `w${w}`;
  return `<text x="${f1(x)}" y="${f1(y)}" class="${cls}" font-size="${size}" fill="${fill}"${track ? ` letter-spacing="${f1(track * size * 100) / 100}"` : ""}${anchor ? ` text-anchor="${anchor}"` : ""}${op != null ? ` opacity="${op}"` : ""}>${esc(s)}</text>`;
}

async function svg(w, h, body, extraCss = "") {
  const used = {};
  for (const m of body.matchAll(/<text[^>]*class="w(\d+)"[^>]*>([^<]*)<\/text>/g)) {
    const set = (used[m[1]] ||= new Set(" "));
    for (const ch of unesc(m[2])) set.add(ch);
  }
  let css = "";
  for (const [k, chars] of Object.entries(used)) {
    const sub = await subsetFont(INTER, [...chars].join(""), { targetFormat: "woff2", variationAxes: { wght: +k } });
    css += `@font-face{font-family:I${k};src:url(data:font/woff2;base64,${sub.toString("base64")}) format('woff2')}
.w${k}{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',I${k},'Segoe UI',sans-serif;font-weight:${k}}
`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
<style>
${css}.mono{font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace}
${extraCss}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>
${body}
</svg>`;
}

// ---------------------------------------------------------------- primitives
// Headline text that fades from full ink at the top to grey at the bottom.
function inkGrad(id, t, y1, y2) {
  return `<linearGradient id="${id}" x1="0" y1="${y1}" x2="0" y2="${y2}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.top}"/><stop offset="1" stop-color="${t.bottom}"/></linearGradient>`;
}

// Vercel-style "+" marks at the corners of a frame.
const plus = (x, y, t, s = 6) =>
  `<path d="M${x - s} ${y}H${x + s}M${x} ${y - s}V${y + s}" stroke="${t.faint}" stroke-width="1"/>`;
function frame(x, y, w, h, t) {
  return `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" stroke="${t.line}"/>${[[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
    .map(([a, b]) => plus(a + (a === x ? 0.5 : -0.5), b + (b === y ? 0.5 : -0.5), t)).join("")}`;
}

// A card with a soft highlight along its top edge.
function card(id, w, h, t, r = 14) {
  return `<defs>
<clipPath id="${id}-c"><rect width="${w}" height="${h}" rx="${r}"/></clipPath>
<linearGradient id="${id}-e" x1="0" y1="0" x2="${w}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.text}" stop-opacity="0"/><stop offset=".5" stop-color="${t.text}" stop-opacity=".35"/><stop offset="1" stop-color="${t.text}" stop-opacity="0"/></linearGradient>
</defs>
<g clip-path="url(#${id}-c)"><rect width="${w}" height="${h}" fill="${t.panel}"/>`;
}
const cardEnd = (id, w, h, t, r = 14) =>
  `<line x1="${r * 2}" y1=".5" x2="${w - r * 2}" y2=".5" stroke="url(#${id}-e)"/></g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${r - 0.5}" stroke="${t.line}"/>`;

// Dotted field that fades out from a point, for card illustrations.
function dotField(id, w, h, t, cx, cy, r) {
  return `<defs><pattern id="${id}-p" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".9" fill="${t.text}"/></pattern>
<radialGradient id="${id}-rf" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="${id}-m"><rect width="${w}" height="${h}" fill="url(#${id}-rf)"/></mask></defs>
<rect width="${w}" height="${h}" fill="url(#${id}-p)" mask="url(#${id}-m)" opacity=".35"/>`;
}

const glowFilter = (id) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`;
const arrowUR = (x, y, c, s = 10) => `<path d="M${x} ${y + s}L${x + s} ${y}M${x + 3} ${y}H${x + s}V${y + s - 3}" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
const arrowR = (x, y, c) => `<path d="M${x} ${y}h9m-3.5-3.5L${x + 9} ${y}l-3.5 3.5" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;

// Large-cell grid lines, faded out from a point by a mask.
function gridLines(id, W, H, t, { x0 = 100, y0 = 100, cx = 500, cy = 160, r = 560 } = {}) {
  let g = "";
  for (let x = x0; x < W; x += 100) g += `<line x1="${x + 0.5}" y1="0" x2="${x + 0.5}" y2="${H}" stroke="${t.line}"/>`;
  for (let y = y0; y < H; y += 100) g += `<line x1="0" y1="${y + 0.5}" x2="${W}" y2="${y + 0.5}" stroke="${t.line}"/>`;
  return `<defs><radialGradient id="${id}-gf" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="${id}-gm"><rect width="${W}" height="${H}" fill="url(#${id}-gf)"/></mask></defs>
<g mask="url(#${id}-gm)">${g}</g>`;
}

// ---------------------------------------------------------------- hero
async function hero(t) {
  const W = 1000, H = 700, c = CONTENT.hero;
  const pw = measure(c.status, 500, 13) + 66, px = (W - pw) / 2;
  const pill = `<rect x="${f1(px)}" y="96" width="${f1(pw)}" height="30" rx="15" fill="${t.raised}" stroke="${t.line2}"/>
<circle cx="${f1(px + 16)}" cy="111" r="3.5" fill="${t.ok}"/>
${T(px + 28, 115.5, c.status, { w: 500, size: 13, fill: t.text })}${arrowR(f1(px + pw - 22), 111, t.muted)}`;
  const title = c.title.map((l, i) => T(W / 2, 208 + i * 70, l, { w: 600, size: 62, fill: "url(#hero-ink)", anchor: "middle", track: -0.035 })).join("\n");
  const sub = c.sub.map((l, i) => T(W / 2, 346 + i * 28, l, { size: 18.5, fill: t.muted, anchor: "middle" })).join("\n");

  // Product window, cropped by the bottom edge.
  const a = c.app, X = 110, Y = 430, WW = 780, WH = 420, SB = 190;
  let nav = "";
  a.nav.forEach(([n, on], i) => {
    const y = Y + 64 + i * 32;
    if (on) nav += `<rect x="${X + 10}" y="${y - 19}" width="${SB - 20}" height="28" rx="7" fill="${t.text}" fill-opacity=".07"/>`;
    nav += `<rect x="${X + 22}" y="${y - 10}" width="10" height="10" rx="3" stroke="${on ? t.text : t.faint}" stroke-width="1.3"/>${T(X + 42, y, n, { w: 500, size: 13, fill: on ? t.text : t.muted })}`;
  });
  nav += T(X + 22, Y + 184, "Projects", { w: 500, size: 11.5, fill: t.faint });
  a.projects.forEach((p, i) => {
    const y = Y + 212 + i * 30;
    nav += `<circle cx="${X + 27}" cy="${y - 4}" r="3.5" fill="${[t.ok, t.text, t.warn][i]}" opacity=".9"/>${T(X + 42, y, p, { w: 500, size: 13, fill: t.muted })}`;
  });
  const MX = X + SB + 28, MR = X + WW - 28;
  const stw = measure(a.status, 500, 12) + 30;
  let rows = `${T(MX, Y + 70, a.run, { w: 600, size: 17, fill: t.text, track: -0.01 })}
<rect x="${f1(MR - stw)}" y="${Y + 54}" width="${f1(stw)}" height="24" rx="12" fill="${t.warn}" fill-opacity=".12" stroke="${t.warn}" stroke-opacity=".35"/>
<circle cx="${f1(MR - stw + 13)}" cy="${Y + 66}" r="3" fill="${t.warn}"/>${T(MR - stw + 22, Y + 70, a.status, { w: 500, size: 12, fill: t.warn })}
<line x1="${MX}" y1="${Y + 94}" x2="${MR}" y2="${Y + 94}" stroke="${t.line}"/>`;
  a.steps.forEach(([tool, arg, res, ms], i) => {
    const y = Y + 128 + i * 44, wait = res === "waiting";
    rows += `<g class="row" style="animation-delay:${(0.5 + i * 0.25).toFixed(2)}s">`;
    rows += wait
      ? `<circle cx="${MX + 8}" cy="${y - 4}" r="7" stroke="${t.warn}" stroke-width="1.4" stroke-dasharray="2.5 2.5"/>`
      : `<circle cx="${MX + 8}" cy="${y - 4}" r="7" fill="${t.text}" fill-opacity=".1"/><path d="M${MX + 4.5} ${y - 4}l2.3 2.3 4.4-4.6" stroke="${t.text}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    rows += T(MX + 26, y, tool, { size: 13, fill: t.text, mono: true });
    rows += T(MX + 26 + 8 * tool.length + 14, y, arg, { size: 13, fill: t.faint });
    rows += T(MR - 64, y, res, { w: 500, size: 12.5, fill: wait ? t.warn : t.muted, anchor: "end" });
    rows += T(MR, y, ms, { size: 12, fill: t.faint, anchor: "end", mono: true });
    rows += `</g>`;
    if (i < a.steps.length - 1) rows += `<line x1="${MX}" y1="${y + 20}" x2="${MR}" y2="${y + 20}" stroke="${t.line}" stroke-opacity=".6"/>`;
  });
  const win = `<rect x="${X}" y="${Y}" width="${WW}" height="${WH}" rx="14" fill="${t.panel}" stroke="${t.line2}"/>
<rect x="${X + 1}" y="${Y + 1}" width="${SB - 1}" height="${WH - 2}" rx="13" fill="${t.raised}" opacity=".6"/>
<line x1="${X + SB}" y1="${Y + 1}" x2="${X + SB}" y2="${Y + WH}" stroke="${t.line}"/>
${[0, 1, 2].map((k) => `<circle cx="${X + 22 + k * 15}" cy="${Y + 22}" r="4.5" fill="${t.line2}"/>`).join("")}
${nav}
${rows}
<line x1="${X + 40}" y1="${Y + 0.5}" x2="${X + WW - 40}" y2="${Y + 0.5}" stroke="url(#hero-edge)" stroke-width="1.2"/>
<rect x="${X}" y="${Y - 1}" width="160" height="2" fill="url(#hero-sweep)" class="sweep"/>`;

  const body = `<defs>
${inkGrad("hero-ink", t, 150, 300)}
<radialGradient id="hero-glow" cx="500" cy="440" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.glow}" stop-opacity="${t.glowOp}"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></radialGradient>
<linearGradient id="hero-fade" x1="0" y1="560" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.bg}" stop-opacity="0"/><stop offset="1" stop-color="${t.bg}"/></linearGradient>
<linearGradient id="hero-edge" x1="${X}" y1="0" x2="${X + WW}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.text}" stop-opacity="0"/><stop offset=".5" stop-color="${t.text}" stop-opacity=".6"/><stop offset="1" stop-color="${t.text}" stop-opacity="0"/></linearGradient>
<linearGradient id="hero-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.glow}" stop-opacity="0"/><stop offset=".5" stop-color="${t.glow}"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></linearGradient>
<clipPath id="hero-c"><rect width="${W}" height="${H}" rx="16"/></clipPath>
</defs>
<g clip-path="url(#hero-c)">
<rect width="${W}" height="${H}" fill="${t.bg}"/>
${gridLines("hero", W, H, t)}
<rect width="${W}" height="${H}" fill="url(#hero-glow)"/>
<rect x="40" y="40" width="26" height="26" rx="7" fill="${t.text}"/>
${T(53, 58, "N", { w: 600, size: 14, fill: t.inverse, anchor: "middle" })}
${T(78, 58, "Niwin Kumar", { w: 600, size: 15, fill: t.text, track: -0.01 })}
${T(W - 40, 58, "github.com/NiwinKumar", { w: 500, size: 13, fill: t.faint, anchor: "end" })}
${pill}
${title}
${sub}
${win}
<rect y="560" width="${W}" height="${H - 560}" fill="url(#hero-fade)"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" stroke="${t.line}"/>`;
  return svg(W, H, body, `.row{animation:row .5s cubic-bezier(.2,.7,.2,1) backwards}@keyframes row{from{opacity:0;transform:translateY(6px)}}
.sweep{animation:sweep 6s cubic-bezier(.6,0,.4,1) 1s infinite}@keyframes sweep{0%{transform:translateX(0);opacity:0}10%{opacity:1}60%{transform:translateX(620px);opacity:1}70%,100%{transform:translateX(620px);opacity:0}}`);
}

// ---------------------------------------------------------------- stats strip
async function stats(t) {
  const W = 1000, H = 140, cw = (W - 2) / 4;
  let s = frame(1, 1, W - 2, H - 2, t);
  CONTENT.stats.forEach(([v, l], i) => {
    const x = 1 + i * cw;
    if (i) s += `<line x1="${f1(x) + 0.5}" y1="1" x2="${f1(x) + 0.5}" y2="${H - 1}" stroke="${t.line}"/>`;
    s += T(x + 32, 74, v, { w: 600, size: 36, fill: "url(#st-ink)", track: -0.03 });
    s += T(x + 32, 102, l, { size: 14, fill: t.muted });
  });
  return svg(W, H, `<defs>${inkGrad("st-ink", t, 44, 76)}</defs>${s}`);
}

// ---------------------------------------------------------------- section heading
async function head(t, label, title) {
  const W = 1000, H = 130;
  return svg(W, H, `<defs>${inkGrad(`hd-ink`, t, 70, 104)}</defs>
<rect x="2" y="30" width="8" height="8" rx="2" fill="${t.glow}"/>
${T(18, 38.5, label, { w: 500, size: 14, fill: t.muted })}
${T(0, 100, title, { w: 600, size: 40, fill: "url(#hd-ink)", track: -0.03 })}`);
}

// ---------------------------------------------------------------- Willow
async function willow(t) {
  const W = 1000, H = 400, p = CONTENT.willow;
  const left = `<circle cx="44" cy="54" r="3.5" fill="${t.ok}"/>
${T(56, 58.5, p.label, { w: 500, size: 13, fill: t.muted })}
${T(38, 120, p.title, { w: 600, size: 40, fill: "url(#wl-ink)", track: -0.03 })}
${p.desc.map((l, i) => T(40, 166 + i * 27, l, { size: 17, fill: t.muted })).join("\n")}
${T(40, 280, p.stack, { size: 12.5, fill: t.faint, mono: true })}
<line x1="40" y1="314" x2="420" y2="314" stroke="${t.line}"/>
${T(40, 352, p.link, { w: 500, size: 15, fill: t.text })}${arrowUR(f1(48 + measure(p.link, 500, 15)), 341, t.muted, 9)}`;

  const X = 470, Y = 36, PW = 494, PH = 328;
  const vals = [52, 55, 54, 60, 64, 63, 70, 74, 78];
  const gx = (i) => X + 32 + (i / (vals.length - 1)) * (PW - 64);
  const gy = (v) => Y + 280 - ((v - 40) / 50) * 160;
  let d = `M${gx(0)} ${f1(gy(vals[0]))}`;
  for (let i = 1; i < vals.length; i++) {
    const mx = (gx(i - 1) + gx(i)) / 2;
    d += `C${f1(mx)} ${f1(gy(vals[i - 1]))} ${f1(mx)} ${f1(gy(vals[i]))} ${f1(gx(i))} ${f1(gy(vals[i]))}`;
  }
  let grid = "";
  for (let k = 0; k < 4; k++) grid += `<line x1="${X + 32}" y1="${Y + 280 - k * 50}" x2="${X + PW - 32}" y2="${Y + 280 - k * 50}" stroke="${t.line}"${k ? ' stroke-dasharray="2 4"' : ""}/>`;
  const last = vals.length - 1;
  const panel = `<rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="12" fill="${t.raised}" stroke="${t.line}"/>
${T(X + 32, Y + 44, "Skin clarity", { w: 500, size: 13, fill: t.muted })}
${T(X + 32, Y + 84, "78", { w: 600, size: 34, fill: t.text, track: -0.03 })}
${T(X + 32 + measure("78", 600, 34) + 12, Y + 84, "+26 in 8 weeks", { w: 500, size: 13, fill: t.ok })}
${["1W", "3M", "All"].map((s, i) => `${i === 0 ? `<rect x="${X + PW - 136}" y="${Y + 28}" width="36" height="24" rx="6" fill="${t.text}" fill-opacity=".08"/>` : ""}${T(X + PW - 118 + i * 40, Y + 44.5, s, { w: 500, size: 12, fill: i ? t.faint : t.text, anchor: "middle" })}`).join("")}
${grid}
<path d="${d}L${gx(last)} ${Y + 280}L${gx(0)} ${Y + 280}Z" fill="url(#wl-area)"/>
<path d="${d}" stroke="${t.text}" stroke-width="4" opacity=".25" filter="url(#wl-gl)"/>
<path d="${d}" stroke="${t.text}" stroke-width="1.8" stroke-linecap="round"/>
<line x1="${gx(last)}" y1="${f1(gy(vals[last]))}" x2="${gx(last)}" y2="${Y + 280}" stroke="${t.text}" stroke-opacity=".3" stroke-dasharray="2 3"/>
<circle cx="${gx(last)}" cy="${f1(gy(vals[last]))}" r="4.5" fill="${t.panel}" stroke="${t.text}" stroke-width="1.8"/>
${vals.map((_, i) => (i % 2 === 0 ? T(gx(i), Y + 304, `Week ${i + 1}`, { size: 11, fill: t.faint, anchor: "middle" }) : "")).join("")}`;
  const body = `<defs>${inkGrad("wl-ink", t, 90, 124)}${glowFilter("wl-gl")}
<linearGradient id="wl-area" x1="0" y1="${Y + 100}" x2="0" y2="${Y + 280}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.text}" stop-opacity=".12"/><stop offset="1" stop-color="${t.text}" stop-opacity="0"/></linearGradient></defs>
${card("wl", W, H, t)}
${left}
${panel}
${cardEnd("wl", W, H, t)}`;
  return svg(W, H, body);
}

// ---------------------------------------------------------------- small cards
const ART = {
  cursor(t) {
    return `<rect x="70" y="52" width="230" height="130" rx="10" fill="${t.raised}" stroke="${t.line2}" opacity=".7"/>
<rect x="170" y="86" width="250" height="140" rx="10" fill="${t.raised}" stroke="${t.line2}"/>
${[0, 1, 2].map((k) => `<circle cx="${84 + k * 12}" cy="66" r="3.5" fill="${t.line2}"/><circle cx="${184 + k * 12}" cy="100" r="3.5" fill="${t.line2}"/>`).join("")}
<rect x="184" y="122" width="120" height="7" rx="3.5" fill="${t.text}" opacity=".12"/>
<rect x="184" y="140" width="180" height="7" rx="3.5" fill="${t.text}" opacity=".07"/>
<rect x="184" y="158" width="90" height="7" rx="3.5" fill="${t.text}" opacity=".07"/>
<rect x="184" y="186" width="74" height="24" rx="6" stroke="${t.text}" stroke-opacity=".5"/>
<path d="M120 160C150 210 190 214 222 196" stroke="${t.muted}" stroke-width="1.3" stroke-dasharray="2 5" stroke-linecap="round"/>
<circle cx="120" cy="160" r="5" stroke="${t.muted}" stroke-width="1.3"/>
<g transform="translate(226 192)"><path d="M0 0L0 19L5 14.5L8.6 22.5L12 21L8.5 13.2L15 13Z" fill="${t.text}" filter="url(#sc-gl)" opacity=".5"/><path d="M0 0L0 19L5 14.5L8.6 22.5L12 21L8.5 13.2L15 13Z" fill="${t.text}" stroke="${t.panel}" stroke-width="1.2" stroke-linejoin="round"/></g>`;
  },
  gate(t) {
    const nodes = [["Audit", 70], ["Preview", 196], ["Publish", 352]];
    let s = `<line x1="134" y1="140" x2="196" y2="140" stroke="${t.line2}"/><line x1="270" y1="140" x2="352" y2="140" stroke="${t.line2}" stroke-dasharray="3 4"/>`;
    nodes.forEach(([n, x], i) => {
      const w = i === 1 ? 74 : 64, on = i === 2;
      s += `<rect x="${x}" y="120" width="${w}" height="40" rx="9" fill="${t.raised}" stroke="${on ? t.text : t.line2}" stroke-opacity="${on ? 0.6 : 1}"/>
${T(x + w / 2, 144.5, n, { w: 500, size: 13, fill: on ? t.text : t.muted, anchor: "middle" })}`;
    });
    s += `<circle cx="311" cy="140" r="15" fill="${t.panel}" stroke="${t.text}" stroke-opacity=".7"/>
<circle cx="311" cy="140" r="15" stroke="${t.text}" stroke-width="3" opacity=".25" filter="url(#sc-gl)"/>
<path d="M305 140.5l4 4 7.5-8" stroke="${t.text}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
${T(311, 192, "You approve", { w: 500, size: 12, fill: t.muted, anchor: "middle" })}`;
    return s;
  },
  rings(t) {
    const cx = 245, cy = 128;
    return [[84, 0.82], [62, 0.64], [40, 0.9]].map(([r, f], i) => {
      const c = 2 * Math.PI * r;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${t.text}" stroke-opacity=".07" stroke-width="12"/>
<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${t.text}" stroke-opacity="${[1, 0.6, 0.35][i]}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${f1(c)}" stroke-dashoffset="${f1(c * (1 - f))}" transform="rotate(-90 ${cx} ${cy})"/>`;
    }).join("");
  },
  hub(t) {
    const cx = 245, cy = 128, labels = ["ERP", "CRM", "Voice", "OAuth", "Events", "SaaS"];
    let s = "";
    labels.forEach((n, i) => {
      const a = -Math.PI / 2 + (i / labels.length) * Math.PI * 2;
      const x = cx + Math.cos(a) * 150, y = cy + Math.sin(a) * 84;
      s += `<line x1="${cx}" y1="${cy}" x2="${f1(x)}" y2="${f1(y)}" stroke="${t.line2}"/>`;
      if (i === 1) s += `<circle r="3" fill="${t.text}"><animateMotion dur="2.4s" repeatCount="indefinite" path="M${cx} ${cy}L${f1(x)} ${f1(y)}"/></circle>`;
      const w = measure(n, 500, 12) + 22;
      s += `<rect x="${f1(x - w / 2)}" y="${f1(y - 13)}" width="${f1(w)}" height="26" rx="7" fill="${t.raised}" stroke="${t.line2}"/>${T(x, y + 4.3, n, { w: 500, size: 12, fill: t.muted, anchor: "middle" })}`;
    });
    s += `<rect x="${cx - 30}" y="${cy - 22}" width="60" height="44" rx="11" fill="${t.text}"/>${T(cx, cy + 5, "API", { w: 600, size: 14, fill: t.inverse, anchor: "middle" })}`;
    return s;
  },
};

async function smallCard(t, p) {
  const W = 490, H = 430;
  const body = `<defs>${glowFilter("sc-gl")}</defs>
${card(p.id, W, H, t)}
${dotField(p.id, W, H, t, 245, 130, 230)}
${ART[p.art](t)}
<line x1="0" y1="260.5" x2="${W}" y2="260.5" stroke="${t.line}"/>
${T(32, 306, p.title, { w: 600, size: 20, fill: t.text, track: -0.015 })}${p.link ? arrowUR(W - 46, 293, t.muted, 11) : ""}
${p.desc.map((l, i) => T(32, 338 + i * 24, l, { size: 15.5, fill: t.muted })).join("\n")}
${cardEnd(p.id, W, H, t)}`;
  return svg(W, H, body);
}

// ---------------------------------------------------------------- experience
async function experience(t) {
  const rows = CONTENT.experience, RH = 104, W = 1000, H = 24 + rows.length * RH;
  let s = `<line x1="220.5" y1="40" x2="220.5" y2="${H - 40}" stroke="${t.line}"/>`;
  rows.forEach((e, i) => {
    const y = 56 + i * RH;
    s += T(40, y, e.when, { size: 13, fill: t.faint, mono: true });
    s += `<circle cx="220.5" cy="${y - 4.5}" r="${i ? 4 : 5}" fill="${i ? t.panel : t.text}" stroke="${t.text}" stroke-opacity="${i ? 0.4 : 1}" stroke-width="1.5"/>`;
    s += T(252, y, e.role, { w: 600, size: 17, fill: t.text, track: -0.01 });
    s += T(252 + measure(e.role, 600, 17, -0.01) + 10, y, e.org, { w: 500, size: 17, fill: t.faint });
    s += T(252, y + 28, e.line, { size: 15.5, fill: t.muted });
  });
  return svg(W, H, `${card("ex", W, H, t)}${s}${cardEnd("ex", W, H, t)}`);
}

// ---------------------------------------------------------------- stack grid
async function stack(t) {
  const items = CONTENT.stack, cols = 6, rows = Math.ceil(items.length / cols);
  const W = 1000, CH = 72, H = rows * CH + 2, cw = (W - 2) / cols;
  let s = frame(1, 1, W - 2, H - 2, t);
  for (let c = 1; c < cols; c++) s += `<line x1="${f1(1 + c * cw) + 0.5}" y1="1" x2="${f1(1 + c * cw) + 0.5}" y2="${H - 1}" stroke="${t.line}"/>`;
  for (let r = 1; r < rows; r++) s += `<line x1="1" y1="${1 + r * CH + 0.5}" x2="${W - 1}" y2="${1 + r * CH + 0.5}" stroke="${t.line}"/>`;
  items.forEach((n, i) => {
    const x = 1 + (i % cols) * cw + cw / 2, y = 1 + Math.floor(i / cols) * CH + CH / 2 + 5;
    s += T(x, y, n, { w: 500, size: 15, fill: t.muted, anchor: "middle" });
  });
  return svg(W, H, s);
}

// ---------------------------------------------------------------- activity
async function fetchStats() {
  if (process.env.STATS_MOCK) return mockStats();
  const token = process.env.GH_TOKEN;
  if (!token) return null;
  const q = `query($login:String!){user(login:$login){
    contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{contributionCount date}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "profile-render" },
    body: JSON.stringify({ query: q, variables: { login: USER } }),
  });
  const json = await res.json();
  if (!json.data?.user) throw new Error("GitHub API: " + JSON.stringify(json.errors || json));
  const cal = json.data.user.contributionsCollection.contributionCalendar;
  return {
    total: cal.totalContributions,
    weeks: cal.weeks.map((w) => w.contributionDays.map((d) => ({ c: d.contributionCount, d: d.date }))),
  };
}

function mockStats() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const weeks = [];
  const start = new Date(Date.now() - 52 * 7 * 864e5);
  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const busy = w > 40 ? 3 : w > 20 ? 1.6 : 1;
      days.push({ c: rnd() < 0.3 ? 0 : Math.floor(rnd() * 7 * busy), d: new Date(+start + (w * 7 + d) * 864e5).toISOString().slice(0, 10) });
    }
    weeks.push(days);
  }
  return { total: weeks.flat().reduce((a, b) => a + b.c, 0), weeks };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function summary(weeks) {
  const days = weeks.flat();
  let longest = 0, run = 0;
  for (const d of days) { run = d.c ? run + 1 : 0; longest = Math.max(longest, run); }
  const byMonth = {};
  for (const d of days) byMonth[d.d.slice(0, 7)] = (byMonth[d.d.slice(0, 7)] || 0) + d.c;
  const best = Object.entries(byMonth).sort((a, b) => b[1] - a[1])[0];
  return { longest, active: days.filter((d) => d.c).length, bestMonth: MONTHS[+best[0].slice(5) - 1] };
}

async function activity(t, s) {
  const W = 1000, H = 310;
  if (!s) {
    return svg(W, H, `${card("ac", W, H, t)}
${T(W / 2, H / 2 + 6, "The contribution graph appears after the daily refresh runs.", { w: 500, size: 16, fill: t.muted, anchor: "middle" })}
${cardEnd("ac", W, H, t)}`);
  }
  const sm = summary(s.weeks);
  const st = [[s.total.toLocaleString("en-US"), "contributions"], [String(sm.longest), "day streak"], [String(sm.active), "active days"], [sm.bestMonth, "busiest month"]];
  let top = "";
  st.forEach(([v, l], i) => {
    const x = 40 + i * 170;
    top += T(x, 72, v, { w: 600, size: 30, fill: "url(#ac-ink)", track: -0.03 }) + T(x, 96, l, { size: 13.5, fill: t.muted });
  });
  const weeks = s.weeks.slice(-53), gap = 3, gx = 40, gy = 140;
  const cell = f1((W - 80 - (weeks.length - 1) * gap) / weeks.length);
  const counts = weeks.flat().map((d) => d.c).filter(Boolean).sort((a, b) => a - b);
  const q = (p) => counts[Math.floor(p * (counts.length - 1))] || 1;
  const cuts = [q(0.25), q(0.5), q(0.75)];
  const level = (c) => (!c ? 0 : c <= cuts[0] ? 1 : c <= cuts[1] ? 2 : c <= cuts[2] ? 3 : 4);
  let cells = "", months = "", lastM = -1;
  weeks.forEach((w, i) => {
    w.forEach((d, j) => {
      cells += `<rect x="${f1(gx + i * (cell + gap))}" y="${f1(gy + j * (cell + gap))}" width="${cell}" height="${cell}" rx="2.5" fill="${t.heat[level(d.c)]}"/>`;
    });
    const m = new Date(w[0].d + "T00:00:00Z").getUTCMonth();
    if (m !== lastM && i > 0 && i < weeks.length - 2) months += T(gx + i * (cell + gap), gy + 7 * (cell + gap) + 20, MONTHS[m], { size: 11.5, fill: t.faint });
    lastM = m;
  });
  return svg(W, H, `<defs>${inkGrad("ac-ink", t, 44, 74)}</defs>
${card("ac", W, H, t)}
${top}
${cells}
${months}
${cardEnd("ac", W, H, t)}`);
}

// ---------------------------------------------------------------- closing call to action
async function cta(t) {
  const W = 1000, H = 340, c = CONTENT.cta;
  const bw = measure(c.button, 500, 15) + 48, bx = (W - bw) / 2;
  const body = `<defs>${inkGrad("cta-ink", t, 90, 130)}
<radialGradient id="cta-glow" cx="500" cy="${H + 40}" r="460" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.glow}" stop-opacity="${t.glowOp}"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></radialGradient>
<clipPath id="cta-c"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs>
<g clip-path="url(#cta-c)">
<rect width="${W}" height="${H}" fill="${t.bg}"/>
${gridLines("cta", W, H, t, { y0: 70, cy: 150, r: 520 })}
<rect width="${W}" height="${H}" fill="url(#cta-glow)"/>
${T(W / 2, 122, c.title, { w: 600, size: 52, fill: "url(#cta-ink)", anchor: "middle", track: -0.035 })}
${T(W / 2, 164, c.sub, { size: 17, fill: t.muted, anchor: "middle" })}
<rect x="${f1(bx)}" y="192" width="${f1(bw)}" height="44" rx="22" fill="${t.text}"/>
${T(W / 2, 219, c.button, { w: 500, size: 15, fill: t.inverse, anchor: "middle" })}
<line x1="0" y1="${H - 60.5}" x2="${W}" y2="${H - 60.5}" stroke="${t.line}"/>
${T(40, H - 25, c.left, { size: 13, fill: t.faint })}
${T(W - 40, H - 25, c.right, { size: 13, fill: t.faint, anchor: "end" })}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" stroke="${t.line}"/>`;
  return svg(W, H, body);
}

// ---------------------------------------------------------------- write
const live = await fetchStats().catch((e) => { console.error(e.message); return null; });

for (const [name, t] of Object.entries(THEMES)) {
  const dir = join(ROOT, "assets", name);
  mkdirSync(dir, { recursive: true });
  const out = {
    hero: await hero(t),
    stats: await stats(t),
    "head-work": await head(t, "Selected work", "Products, built end to end."),
    willow: await willow(t),
    "head-exp": await head(t, "Experience", "Where I’ve been building."),
    experience: await experience(t),
    "head-stack": await head(t, "Stack", "Tools I reach for."),
    stack: await stack(t),
    "head-activity": await head(t, "Activity", "Shipping, most days."),
    activity: await activity(t, live),
    cta: await cta(t),
  };
  for (const p of CONTENT.cards) out[p.id] = await smallCard(t, p);
  for (const [k, v] of Object.entries(out)) writeFileSync(join(dir, `${k}.svg`), v);
}
console.log(live ? `rendered, ${live.total} contributions` : "rendered, no stats");
