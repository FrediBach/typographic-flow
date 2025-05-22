import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import { remark } from 'remark';

/**
 * Converts markdown text to HTML
 * 
 * @param markdown The markdown text to convert
 * @returns HTML string
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  // Create a remark processor
  const processor = remark()
    .use(remarkParse) // Parse markdown content to a syntax tree
    .use(remarkGfm) // Support GitHub Flavored Markdown (tables, strikethrough, etc.)
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert markdown syntax tree to HTML syntax tree
    .use(rehypeRaw) // Support raw HTML in the markdown
    .use(rehypeStringify); // Convert HTML syntax tree to HTML string
  
  // Process the markdown
  const file = await processor.process(markdown);
  
  // Return the HTML string
  return String(file);
}