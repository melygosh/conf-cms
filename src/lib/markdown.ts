import { marked } from 'marked';

marked.use({ gfm: true });

/** Block Markdown from content files. Raw HTML (e.g. `<sup>1</sup>`) passes through. */
export function md(src: string): string {
  return marked.parse(src, { async: false });
}

export function mdInline(src: string): string {
  return marked.parseInline(src, { async: false });
}
