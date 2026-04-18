/**
 * Blog post loader for `content/blog/*.mdx`.
 *
 * The `.mdx` extension is conventional only: each file is read as raw text and the
 * body is rendered with `react-markdown`. That means standard Markdown works, but
 * MDX features (embedded JSX such as `<MyComponent />` in the post body) are not
 * supported — that would require an MDX compiler pipeline instead of react-markdown.
 * Frontmatter is parsed separately by `parseSimpleFrontmatter`.
 */

/** @type {Record<string, string>} */
const rawByPath = import.meta.glob("../../content/blog/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
});

/**
 * Minimal YAML frontmatter parser for blog MVP (no eval, no heavy deps).
 * Supports string values (quoted or bare), booleans, and `tags:` list.
 * @param {string} raw
 * @returns {{ data: Record<string, unknown>, content: string }}
 */
function parseSimpleFrontmatter(raw) {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("---")) {
    return { data: {}, content: raw };
  }
  const afterOpen = trimmed.slice(3).replace(/^\r?\n/, "");
  const closeMatch = afterOpen.match(/\r?\n---\r?\n/);
  if (!closeMatch || closeMatch.index === undefined) {
    return { data: {}, content: raw };
  }
  const fmBlock = afterOpen.slice(0, closeMatch.index);
  const content = afterOpen.slice(closeMatch.index + closeMatch[0].length);

  /** @type {Record<string, unknown>} */
  const data = {};
  const lines = fmBlock.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (/^tags:\s*$/.test(line)) {
      const tags = [];
      i += 1;
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        tags.push(lines[i].replace(/^\s*-\s+/, "").replace(/^["']|["']$/g, "").trim());
        i += 1;
      }
      data.tags = tags;
      continue;
    }
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) {
      const key = m[1];
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      } else if (val === "true") {
        val = true;
      } else if (val === "false") {
        val = false;
      }
      data[key] = val;
    }
    i += 1;
  }

  return { data, content: content.trim() };
}

/**
 * @typedef {object} BlogPostMeta
 * @property {string} slug
 * @property {string} title
 * @property {string} [date]
 * @property {string} [excerpt]
 * @property {string[]} [tags]
 * @property {boolean} [published]
 * @property {string} body
 * @property {string} [pathKey]
 */

/**
 * @returns {BlogPostMeta[]}
 */
function parseAll() {
  /** @type {BlogPostMeta[]} */
  const out = [];

  for (const [pathKey, raw] of Object.entries(rawByPath)) {
    if (typeof raw !== "string") continue;
    const { data, content } = parseSimpleFrontmatter(raw);
    const slug =
      (typeof data.slug === "string" && data.slug) ||
      pathKey.split("/").pop()?.replace(/\.mdx$/i, "") ||
      "";

    out.push({
      slug,
      title: typeof data.title === "string" ? data.title : slug,
      date: typeof data.date === "string" ? data.date : undefined,
      excerpt: typeof data.excerpt === "string" ? data.excerpt : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      published: data.published !== false,
      body: content.trim(),
      pathKey,
    });
  }

  return out;
}

const _cache = parseAll();

/**
 * All posts including unpublished (for future admin tooling).
 * @returns {BlogPostMeta[]}
 */
export function getAllPostsIncludingUnpublished() {
  return [..._cache];
}

/**
 * Published posts only, newest first (by date string, fallback title).
 * @returns {BlogPostMeta[]}
 */
export function getPublishedPosts() {
  return _cache
    .filter((p) => p.published)
    .sort((a, b) => {
      const da = a.date ?? "";
      const db = b.date ?? "";
      if (da !== db) return db.localeCompare(da);
      return a.title.localeCompare(b.title);
    });
}

/**
 * @param {string} slug
 * @returns {BlogPostMeta | null}
 */
export function getPublishedPostBySlug(slug) {
  const post = _cache.find((p) => p.published && p.slug === slug);
  return post ?? null;
}
