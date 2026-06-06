const siteConfig = {
  title: '简约个人博客',
  description: '极简黑白个人博客，基于 Markdown 静态文章和 GitHub Pages 部署。',
  author: '博客作者',
  basePath: './',
  postIndex: 'posts/index.json',
};

const body = document.body;
const pageType = body.dataset.page;
const searchInput = document.getElementById('search');
const tagListEl = document.getElementById('tag-list');
const postsContainer = document.getElementById('posts');
const postCountEl = document.getElementById('post-count');
const postTitleEl = document.getElementById('post-title');
const postMetaEl = document.getElementById('post-meta');
const postContentEl = document.getElementById('post-content');
const tocEl = document.getElementById('toc');
const prevPostEl = document.getElementById('prev-post');
const nextPostEl = document.getElementById('next-post');
const imagePreview = document.getElementById('image-preview');
const previewClose = document.getElementById('preview-close');
const previewImage = document.getElementById('preview-image');

let allPosts = [];
let activeTag = '';
let activeSearch = '';

async function loadPosts() {
  try {
    const response = await fetch(siteConfig.postIndex);
    return await response.json();
  } catch (error) {
    console.error('读取文章索引失败：', error);
    return [];
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function createTagElement(tag) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tag-pill';
  button.textContent = tag;
  button.addEventListener('click', () => {
    activeTag = activeTag === tag ? '' : tag;
    updateTagSelection();
    renderPostList();
  });
  return button;
}

function updateTagSelection() {
  const pills = document.querySelectorAll('.tag-pill');
  pills.forEach((pill) => {
    pill.classList.toggle('active', pill.textContent === activeTag);
  });
}

function renderPostCard(post) {
  const item = document.createElement('article');
  item.className = 'post-card';
  item.innerHTML = `
    <a href="post.html?slug=${encodeURIComponent(post.slug)}"><h3>${post.title}</h3></a>
    <time>${formatDate(post.date)}</time>
    <div class="meta-tags">${(post.tags || []).map((tag) => `<span class="meta-tag">${tag}</span>`).join('')}</div>
    <p class="excerpt">${post.summary || ''}</p>
  `;
  return item;
}

function renderTagFilters(posts) {
  if (!tagListEl) return;
  const tags = new Set();
  posts.forEach((post) => (post.tags || []).forEach((tag) => tags.add(tag)));
  tagListEl.innerHTML = '<button type="button" class="tag-pill">全部</button>';
  tagListEl.querySelector('button').addEventListener('click', () => {
    activeTag = '';
    updateTagSelection();
    renderPostList();
  });
  tags.forEach((tag) => tagListEl.appendChild(createTagElement(tag)));
  updateTagSelection();
}

function getFilteredPosts() {
  return allPosts.filter((post) => {
    const matchesTag = activeTag ? (post.tags || []).includes(activeTag) : true;
    const matchesSearch = activeSearch
      ? post.title.toLowerCase().includes(activeSearch.toLowerCase())
      : true;
    return matchesTag && matchesSearch;
  });
}

function renderPostList() {
  if (!postsContainer) return;
  const filtered = getFilteredPosts();
  postsContainer.innerHTML = filtered.map((post) => renderPostCard(post).outerHTML).join('');
  postCountEl.textContent = `共 ${filtered.length} 篇文章`;
}

function parseFrontmatter(raw) {
  const frontmatterPattern = /^---\s*([\s\S]*?)\s*---/;
  const match = raw.match(frontmatterPattern);
  if (!match) return { meta: {}, content: raw };
  const body = raw.slice(match[0].length).trim();
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
        meta[key.trim()] = value.slice(1, -1).split(',').map((v) => v.trim());
      }
    } else {
      meta[key.trim()] = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    }
  });
  return { meta, content: body };
}

function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
}

function initIndexPage() {
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      activeSearch = event.target.value.trim();
      renderPostList();
    });
  }

  loadPosts().then((posts) => {
    allPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderTagFilters(allPosts);
    renderPostList();
  });
}

function createMarkdownRenderer() {
  const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && window.hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><code>' + window.hljs.highlight(str, { language: lang }).value + '</code></pre>';
        } catch (__) {}
      }
      return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    },
  });
  md.use(window.markdownitAnchor, {
    permalink: true,
    permalinkSymbol: '§',
    permalinkBefore: true,
    slugify,
  });
  md.use(window.markdownitKatex);
  return md;
}

function renderTOC() {
  if (!tocEl) return;
  const headings = Array.from(postContentEl.querySelectorAll('h1, h2, h3')).filter((heading) => heading.id);
  if (!headings.length) {
    tocEl.innerHTML = '<p>本文暂无目录。</p>';
    return;
  }
  tocEl.innerHTML = headings
    .map((heading) => {
      const level = Number(heading.tagName.charAt(1));
      return `<a href="#${heading.id}" class="toc-item toc-level-${level}">${heading.textContent}</a>`;
    })
    .join('');
}

function renderPostPage() {
  const urlParams = new URLSearchParams(location.search);
  const slug = urlParams.get('slug');
  if (!slug) {
    postTitleEl.textContent = '文章未找到';
    postContentEl.innerHTML = '<p>请通过首页链接打开文章。</p>';
    return;
  }

  loadPosts().then((posts) => {
    allPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const postMeta = allPosts.find((item) => item.slug === slug);
    if (!postMeta) {
      postTitleEl.textContent = '文章未找到';
      postContentEl.innerHTML = '<p>当前文章不存在，请返回首页查看其他文章。</p>';
      return;
    }

    fetch(`posts/${encodeURIComponent(slug)}.md`)
      .then((response) => response.text())
      .then((raw) => {
        const { meta, content } = parseFrontmatter(raw);
        const title = meta.title || postMeta.title || '未命名文章';
        const date = meta.date || postMeta.date;
        const tags = meta.tags || postMeta.tags || [];
        postTitleEl.textContent = title;
        postMetaEl.textContent = `${formatDate(date)} · ${tags.join(' / ')}`;
        const md = createMarkdownRenderer();
        postContentEl.innerHTML = md.render(content);
        renderTOC();
        updatePostNavigation(slug);
        updateDocumentMeta(title, postMeta.summary || meta.summary || siteConfig.description);
      })
      .catch((error) => {
        console.error(error);
        postTitleEl.textContent = '加载失败';
        postContentEl.innerHTML = '<p>无法读取文章内容，请稍后重试。</p>';
      });
  });
}

function updateDocumentMeta(title, description) {
  document.title = `${title} - ${siteConfig.title}`;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.content = description;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = `${title} - ${siteConfig.title}`;
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = description;
}

function updatePostNavigation(currentSlug) {
  const index = allPosts.findIndex((item) => item.slug === currentSlug);
  if (index > 0) {
    const nextPost = allPosts[index - 1];
    prevPostEl.textContent = `上一篇：${nextPost.title}`;
    prevPostEl.href = `post.html?slug=${encodeURIComponent(nextPost.slug)}`;
  } else {
    prevPostEl.textContent = '暂无上一篇';
    prevPostEl.removeAttribute('href');
  }
  if (index < allPosts.length - 1) {
    const nextPost = allPosts[index + 1];
    nextPostEl.textContent = `下一篇：${nextPost.title}`;
    nextPostEl.href = `post.html?slug=${encodeURIComponent(nextPost.slug)}`;
  } else {
    nextPostEl.textContent = '暂无下一篇';
    nextPostEl.removeAttribute('href');
  }
}

function initImagePreview() {
  if (!imagePreview || !previewImage) return;
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'IMG' && target.closest('.post-content')) {
      previewImage.src = target.src;
      imagePreview.classList.add('active');
      imagePreview.setAttribute('aria-hidden', 'false');
    }
  });
  if (previewClose) {
    previewClose.addEventListener('click', () => {
      imagePreview.classList.remove('active');
      imagePreview.setAttribute('aria-hidden', 'true');
    });
  }
  imagePreview.addEventListener('click', (event) => {
    if (event.target === imagePreview) {
      imagePreview.classList.remove('active');
      imagePreview.setAttribute('aria-hidden', 'true');
    }
  });
}

function init() {
  if (pageType === 'index') {
    initIndexPage();
  }
  if (pageType === 'post') {
    renderPostPage();
  }
  initImagePreview();
}

document.addEventListener('DOMContentLoaded', init);
