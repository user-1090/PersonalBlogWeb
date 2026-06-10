function createMarkdownRenderer() {
  const md = window.markdownit({
    html: true,
    linkify: true,
    breaks: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && window.hljs && window.hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><code>' + window.hljs.highlight(str, { language: lang }).value + '</code></pre>';
        } catch (__) {}
      }
      return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    },
  });

  try {
    let anchorPlugin = window.markdownItAnchor || window.markdownitAnchor;
    if (anchorPlugin && typeof anchorPlugin !== 'function' && typeof anchorPlugin.default === 'function') {
      anchorPlugin = anchorPlugin.default;
    }
    if (typeof anchorPlugin === 'function') {
      md.use(anchorPlugin, {
        permalink: true,
        permalinkSymbol: '§',
        permalinkBefore: true,
        slugify: (s) => String(s).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, ''),
      });
    }
  } catch (e) {
    console.warn('Markdown anchor plugin加载失败', e);
  }

  try {
    let katexPlugin = window.markdownItKatex || window.markdownitKatex;
    if (katexPlugin && typeof katexPlugin !== 'function' && typeof katexPlugin.default === 'function') {
      katexPlugin = katexPlugin.default;
    }
    if (typeof katexPlugin === 'function') {
      md.use(katexPlugin);
    }
  } catch (e) {
    console.warn('Markdown KaTeX 插件加载失败', e);
  }

  return md;
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function slugify(text) {
  const normalized = String(text || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-');
  return normalized.replace(/(^-|-$)/g, '');
}

function parseTags(value) {
  return String(value || '')
    .split(/[,，;；]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildMarkdown({ title, date, tags, summary, content }) {
  const serializedTags = JSON.stringify(tags)
    .replace(/\s+/g, '');

  return `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndate: "${date}"\ntags: ${serializedTags}\nsummary: "${summary.replace(/"/g, '\\"')}"\n---\n\n${content.trim()}\n`;
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

window.addEventListener('DOMContentLoaded', function () {
  const titleInput = document.getElementById('title');
  const slugInput = document.getElementById('slug');
  const tagsInput = document.getElementById('tags');
  const summaryInput = document.getElementById('summary');
  const dateOutput = document.getElementById('date');
  const exportButton = document.getElementById('export-button');
  const preview = document.getElementById('preview');

  const markdownRenderer = createMarkdownRenderer();
  const editor = new EasyMDE({
    element: document.getElementById('editor'),
    autoDownloadFontAwesome: false,
    spellChecker: false,
    placeholder: '在这里编写 Markdown 内容，支持代码块、图片语法和实时预览。',
    status: false,
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'code',
      'link',
      'image',
      '|',
      'preview',
      'guide',
    ],
  });

  function updatePreview() {
    preview.innerHTML = markdownRenderer.render(editor.value());
  }

  function updateSlugFromTitle() {
    if (!slugInput.dataset.manual) {
      const generated = slugify(titleInput.value);
      slugInput.value = generated;
    }
  }

  const today = formatDate(new Date());
  dateOutput.textContent = today;

  titleInput.addEventListener('input', () => {
    updateSlugFromTitle();
  });

  slugInput.addEventListener('input', () => {
    slugInput.dataset.manual = 'true';
  });

  editor.codemirror.on('change', updatePreview);

  titleInput.addEventListener('blur', updatePreview);
  tagsInput.addEventListener('input', updatePreview);
  summaryInput.addEventListener('input', updatePreview);

  updatePreview();

  exportButton.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const slug = slugInput.value.trim();
    const tags = parseTags(tagsInput.value);
    const summary = summaryInput.value.trim();
    const content = editor.value();

    if (!title) {
      alert('请填写文章标题。');
      titleInput.focus();
      return;
    }

    if (!slug) {
      alert('请填写文章 Slug，用于生成文件名。');
      slugInput.focus();
      return;
    }

    const filename = `${slug}.md`;
    const markdown = buildMarkdown({ title, date: today, tags, summary, content });
    downloadFile(filename, markdown);
  });
});
