import { marked } from "marked";
import Prism from "prismjs";

// 配置 marked 选项
marked.setOptions({
  gfm: true, // 启用 GitHub Flavored Markdown
  breaks: true, // 将换行符转换为 <br>
  async: false,
});

// 自定义渲染器，添加 Tailwind 样式类
const renderer = new marked.Renderer();

// 标题
renderer.heading = ({ text, depth }) => {
  const classes = {
    1: "text-2xl font-bold mt-6 mb-4",
    2: "text-xl font-semibold mt-6 mb-4",
    3: "text-lg font-semibold mt-6 mb-3",
    4: "text-base font-semibold mt-4 mb-2",
    5: "text-sm font-semibold mt-4 mb-2",
    6: "text-xs font-semibold mt-4 mb-2",
  };
  return `<h${depth} class="${
    classes[depth as keyof typeof classes]
  }">${text}</h${depth}>`;
};

// 段落
renderer.paragraph = ({ text }) => {
  return `<p class="mb-4 leading-relaxed">${text}</p>`;
};

// 链接
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : "";
  return `<a href="${href}"${titleAttr} class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

// 列表
renderer.list = ({ ordered, items }) => {
  const tag = ordered ? "ol" : "ul";
  const className = ordered
    ? "list-decimal ml-6 my-4 space-y-2"
    : "list-disc ml-6 my-4 space-y-2";
  return `<${tag} class="${className}">${items}</${tag}>`;
};

renderer.listitem = ({ text }) => {
  return `<li class="leading-relaxed">${text}</li>`;
};

// 引用
renderer.blockquote = ({ text }) => {
  return `<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-600 dark:text-gray-400">${text}</blockquote>`;
};

// 代码块
renderer.code = ({ text, lang }) => {
  let highlighted = text;

  // 尝试使用 Prism 高亮
  if (lang && Prism.languages[lang]) {
    try {
      highlighted = Prism.highlight(text, Prism.languages[lang], lang);
    } catch (e) {
      console.warn("Prism highlighting failed:", e);
    }
  }

  const langClass = lang ? ` language-${lang}` : "";
  return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code class="${langClass}">${highlighted}</code></pre>`;
};

// 行内代码
renderer.codespan = ({ text }) => {
  return `<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">${text}</code>`;
};

// 图片
renderer.image = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : "";
  return `<img src="${href}" alt="${text}"${titleAttr} class="max-w-full h-auto rounded-lg my-4" />`;
};

// 水平线
renderer.hr = () => {
  return `<hr class="my-8 border-gray-200 dark:border-gray-700">`;
};

// 表格
renderer.table = ({ header, rows }) => {
  return `<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 my-4 border border-gray-200 dark:border-gray-700">
    <thead class="bg-gray-50 dark:bg-gray-800">${header}</thead>
    <tbody>${rows}</tbody>
  </table>`;
};

renderer.tablerow = ({ text }) => {
  return `<tr class="border-b border-gray-200 dark:border-gray-700">${text}</tr>`;
};

renderer.tablecell = ({ text, header }) => {
  const tag = header ? "th" : "td";
  const className = header
    ? "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
    : "px-4 py-3 whitespace-nowrap text-sm";
  return `<${tag} class="${className}">${text}</${tag}>`;
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
    console.error("Error processing markdown:", error);
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
