import { marked } from "marked";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import { logger } from "@/lib/logger";

// 配置 marked 选项
marked.setOptions({
  gfm: true, // 启用 GitHub Flavored Markdown
  breaks: true, // 将换行符转换为 <br>
  async: false,
});

// 自定义渲染器，添加 Tailwind 样式类
const renderer = new marked.Renderer();

// 标题
renderer.heading = function (token) {
  const depth = token.depth;
  const classes = {
    1: "text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100",
    2: "text-2xl font-semibold mt-6 mb-4 text-gray-900 dark:text-gray-100",
    3: "text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100",
    4: "text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100",
    5: "text-base font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100",
    6: "text-sm font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100",
  } as const;

  const html = this.parser.parseInline(token.tokens);
  return `<h${depth} class="${
    classes[depth as keyof typeof classes]
  }">${html}</h${depth}>`;
};

// 段落
renderer.paragraph = function (token) {
  const html = this.parser.parseInline(token.tokens);
  return `<p class="mb-4 leading-7 text-gray-700 dark:text-gray-300">${html}</p>`;
};

// 链接
renderer.link = function (token) {
  const href = token.href;
  const text = this.parser.parseInline(token.tokens);
  const title = token.title;
  const titleAttr = title ? ` title="${title}"` : "";
  return `<a href="${href}"${titleAttr} class="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

// 列表
renderer.list = function (token) {
  const ordered = token.ordered;
  const tag = ordered ? "ol" : "ul";
  const className = ordered
    ? "list-decimal ml-6 my-4 space-y-2"
    : "list-disc ml-6 my-4 space-y-2";

  const items = token.items
    .map((item) => {
      const inner = this.parser.parse(item.tokens);
      return `<li class="leading-7 text-gray-700 dark:text-gray-300">${inner}</li>`;
    })
    .join("");

  return `<${tag} class="${className}">${items}</${tag}>`;
};

// 引用
renderer.blockquote = function (token) {
  const inner = this.parser.parse(token.tokens);
  return `<blockquote class="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-4 py-2 italic my-4 text-gray-700 dark:text-gray-300 rounded">${inner}</blockquote>`;
};

// 代码块 - 添加复制按钮
renderer.code = function (token) {
  const code = token.text;
  const lang = token.lang || "";
  let highlighted = code;

  // 尝试使用 Prism 高亮
  if (lang && Prism.languages[lang]) {
    try {
      highlighted = Prism.highlight(code, Prism.languages[lang], lang);
    } catch (e) {
      logger.warn("Prism highlighting failed:", e);
      highlighted = code; // 如果失败，使用原始代码
    }
  }

  const langLabel = lang
    ? `<span class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">${lang}</span>`
    : "";
  const escapedCode = code.replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  return `<div class="relative my-6 group">
    <div class="flex items-center justify-between bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-t-lg">
      ${langLabel}
      <button 
        type="button"
        class="copy-code-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 rounded transition-colors duration-200"
        data-code="${escapedCode}"
        title="Copy code"
      >
        <svg class="copy-icon w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <span class="copy-text">Copy</span>
      </button>
    </div>
    <pre class="bg-gray-50 dark:bg-gray-800 p-4 rounded-b-lg overflow-x-auto border border-gray-200 dark:border-gray-700"><code class="language-${lang} text-sm">${highlighted}</code></pre>
  </div>`;
};

// 行内代码
// 颜色由TailWind CSS控制
renderer.codespan = function (token) {
  return `<code class="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono">${token.text}</code>`;
};

// 图片
renderer.image = function (token) {
  const href = token.href;
  const text = token.text;
  const title = token.title;
  const titleAttr = title ? ` title="${title}"` : "";
  return `<img src="${href}" alt="${text}"${titleAttr} class="max-w-full h-auto rounded-lg my-6 shadow-md" />`;
};

// 水平线
renderer.hr = function () {
  return `<hr class="my-8 border-t-2 border-gray-200 dark:border-gray-700">`;
};

// 表格
renderer.table = function (token) {
  const header = token.header
    .map(
      (cell) =>
        `<th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">${this.parser.parseInline(
          cell.tokens
        )}</th>`
    )
    .join("");

  const rows = token.rows
    .map((row) => {
      const cells = row
        .map(
          (cell) =>
            `<td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${this.parser.parseInline(
              cell.tokens
            )}</td>`
        )
        .join("");
      return `<tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">${cells}</tr>`;
    })
    .join("");

  return `<div class="overflow-x-auto my-6">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
      <thead class="bg-gray-100 dark:bg-gray-800">
        <tr>${header}</tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-900">${rows}</tbody>
    </table>
  </div>`;
};

// 强调（加粗）
renderer.strong = function (token) {
  const html = this.parser.parseInline(token.tokens);
  return `<strong class="font-bold text-gray-900 dark:text-gray-100">${html}</strong>`;
};

// 斜体
renderer.em = function (token) {
  const html = this.parser.parseInline(token.tokens);
  return `<em class="italic text-gray-800 dark:text-gray-200">${html}</em>`;
};

// 使用 marked 处理 markdown
export async function markdownToHtml(markdown: string): Promise<string> {
  try {
    if (!markdown || markdown.trim() === "") {
      return "";
    }

    // 使用自定义渲染器
    const html = await marked.parse(markdown, { renderer });

    return html as string;
  } catch (error) {
    logger.error("Error processing markdown:", error);
    return "<p>Error processing markdown content</p>";
  }
}

// 验证 markdown 语法
export function validateMarkdown(markdown: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    // 检查是否有未闭合的代码块
    const codeBlockMatches = markdown.match(/```/g);
    if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
      errors.push("Unclosed code block detected");
    }

    // 检查是否有未闭合的链接
    const linkMatches = markdown.match(/\[([^\]]*)\](?!\()/g);
    if (linkMatches) {
      errors.push("Incomplete link syntax detected");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch {
    return {
      valid: false,
      errors: ["Invalid markdown syntax"],
    };
  }
}

// 插入图片到 markdown
export function insertImageToMarkdown(
  markdown: string,
  cursorPosition: number,
  imageUrl: string,
  altText?: string
): { newMarkdown: string; newCursorPosition: number } {
  const imageMarkdown = `![${altText || "Image"}](${imageUrl})`;

  const before = markdown.slice(0, cursorPosition);
  const after = markdown.slice(cursorPosition);

  // 如果光标前面不是换行，添加换行
  const needsNewlineBefore = before.length > 0 && !before.endsWith("\n");
  // 如果光标后面不是换行，添加换行
  const needsNewlineAfter = after.length > 0 && !after.startsWith("\n");

  const prefix = needsNewlineBefore ? "\n" : "";
  const suffix = needsNewlineAfter ? "\n" : "";

  const newMarkdown = before + prefix + imageMarkdown + suffix + after;
  const newCursorPosition =
    cursorPosition + prefix.length + imageMarkdown.length + suffix.length;

  return {
    newMarkdown,
    newCursorPosition,
  };
}

// 获取 markdown 统计信息
export function getMarkdownStats(markdown: string) {
  const words = markdown.split(/\s+/).filter((word) => word.length > 0).length;
  const characters = markdown.length;
  const charactersNoSpaces = markdown.replace(/\s/g, "").length;
  const lines = markdown.split("\n").length;

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
  };
}
