// src/utils/calloutUtils.ts
import { remark } from 'remark';
import remarkHtml from 'remark-html';

export const calloutStyles: Record<string, { textClass: string; icon: string }> = {
  note: { textClass: 'text-blue-700', icon: 'ℹ' },
  warning: {
    textClass: 'text-yellow-700',
    icon: '⚠️',
  },
  tip: { textClass: 'text-green-700', icon: '💡' },
  important: {
    textClass: 'text-purple-700',
    icon: '❗',
  },
  caution: { textClass: 'text-yellow-700', icon: '🚨' },
};

export const processCalloutMarkdown = async (markdown: string) => {
  const processedHtml = await remark().use(remarkHtml, { sanitize: false }).process(markdown);
  let html = String(processedHtml);
  // Transform GitHub-style callouts: > [!NOTE], > [!WARNING], etc.
  const calloutRegex = /<p>\[!(NOTE|WARNING|TIP|IMPORTANT|CAUTION)\]([\s\S]*?)<\/p>/gi;

  html = html.replace(calloutRegex, (match, type, content) => {
    const calloutType = type.toLowerCase();
    const config = calloutStyles[calloutType] || calloutStyles.note;
    const title = type.charAt(0) + type.slice(1).toLowerCase();
    const trimmedContent = content.trim();
    const contentHtml = trimmedContent
      ? `<div class="callout-content">${trimmedContent}</div>`
      : '';
    return `<div class="${config.textClass} mb-2" role="alert">
      <div class="flex items-center gap-2 font-bold mb-3">
        <div class="aspect-square w-6 text-center rounded-full border text-sm ">${config.icon}</div>
        <span class="text-md">${title}</span>
      </div>
      ${contentHtml}
    </div>`;
  });

  return html;
};
