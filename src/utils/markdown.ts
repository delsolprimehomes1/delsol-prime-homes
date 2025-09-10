/**
 * Converts markdown content to HTML with proper formatting
 * Handles headers, bold text, lists, and line breaks
 */
export function processMarkdownContent(content: string): string {
  if (!content) return '';

  let processed = content;

  // Convert headers (### **Header** or ### Header)
  processed = processed.replace(/### \*\*(.*?)\*\*/g, '<h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">$1</h3>');
  processed = processed.replace(/### (.*?)$/gm, '<h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">$1</h3>');
  
  // Convert ## headers
  processed = processed.replace(/## \*\*(.*?)\*\*/g, '<h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">$1</h2>');
  processed = processed.replace(/## (.*?)$/gm, '<h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">$1</h2>');

  // Convert bold text (but not headers which we already processed)
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');

  // Convert unordered lists
  processed = processed.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
  processed = processed.replace(/(<li.*?>.*?<\/li>)/gs, '<ul class="list-disc list-inside mb-2 space-y-0 text-muted-foreground">$1</ul>');

  // Convert line breaks
  processed = processed.replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">');
  processed = processed.replace(/\n/g, '<br />');

  // Wrap in paragraph tags if not already wrapped
  if (!processed.startsWith('<')) {
    processed = '<p class="mb-4 text-muted-foreground leading-relaxed">' + processed + '</p>';
  }

  // Clean up any double paragraph tags
  processed = processed.replace(/<\/p><p[^>]*><\/p>/g, '</p>');
  processed = processed.replace(/<p[^>]*><\/p>/g, '');

  return processed;
}