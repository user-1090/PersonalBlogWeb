const fs = require('fs');
const path = require('path');

const siteUrl = 'https://yourname.github.io/your-repo-name';
const postsDir = path.join(__dirname, '..', 'posts');
const indexPath = path.join(postsDir, 'index.json');
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*([\s\S]*?)\s*---/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/).filter(Boolean);
  const meta = {};
  lines.forEach((line) => {
    const [key, ...rest] = line.split(':');
    if (!key) return;
    const value = rest.join(':').trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        meta[key.trim()] = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        meta[key.trim()] = value.slice(1, -1).split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, ''));
      }
    } else {
      meta[key.trim()] = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    }
  });
  return meta;
}

const posts = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const meta = parseFrontmatter(raw);
    return {
      slug: path.basename(file, '.md'),
      title: meta.title || path.basename(file, '.md'),
      date: meta.date || '1970-01-01',
      tags: meta.tags || [],
      summary: meta.summary || '',
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(indexPath, JSON.stringify(posts, null, 2), 'utf-8');
console.log(`已生成文章索引：${path.relative(process.cwd(), indexPath)}`);

const urls = [
  `${siteUrl}/`,
  `${siteUrl}/index.html`,
  `${siteUrl}/about.html`,
  `${siteUrl}/post.html`,
];

posts.forEach((post) => {
  urls.push(`${siteUrl}/post.html?slug=${encodeURIComponent(post.slug)}`);
});

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map((loc) => {
      return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`;
    })
    .join('\n') +
  `\n</urlset>\n`;

fs.writeFileSync(sitemapPath, sitemapContent, 'utf-8');
console.log(`已生成 sitemap：${path.relative(process.cwd(), sitemapPath)}`);
