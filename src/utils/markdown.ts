/**
 * Converts markdown content to HTML with proper formatting
 * Handles headers, bold text, lists, and line breaks
 */
export function processMarkdownContent(content: string): string {
  if (!content) return '';

  let processed = content;

  // Convert headers (order matters: longest patterns first)
  // Convert #### headers (h4)
  processed = processed.replace(/#### \*\*(.*?)\*\*/g, '<h4 class="text-lg font-semibold mb-3 mt-6 text-foreground">$1</h4>');
  processed = processed.replace(/#### (.*?)$/gm, '<h4 class="text-lg font-semibold mb-3 mt-6 text-foreground">$1</h4>');
  
  // Convert ### headers (h3)
  processed = processed.replace(/### \*\*(.*?)\*\*/g, '<h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">$1</h3>');
  processed = processed.replace(/### (.*?)$/gm, '<h3 class="text-xl font-semibold mb-4 mt-8 text-foreground">$1</h3>');
  
  // Convert ## headers (h2)
  processed = processed.replace(/## \*\*(.*?)\*\*/g, '<h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">$1</h2>');
  processed = processed.replace(/## (.*?)$/gm, '<h2 class="text-2xl font-semibold mb-6 mt-10 text-foreground">$1</h2>');
  
  // Convert # headers (h1)
  processed = processed.replace(/# \*\*(.*?)\*\*/g, '<h1 class="text-3xl font-bold mb-8 mt-12 text-foreground">$1</h1>');
  processed = processed.replace(/# (.*?)$/gm, '<h1 class="text-3xl font-bold mb-8 mt-12 text-foreground">$1</h1>');

  // Convert bold text (but not headers which we already processed)
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');

  // Convert unordered lists with enhanced styling
  processed = processed.replace(/^- (.+)$/gm, '<li class="mb-3 text-muted-foreground flex items-start gap-3"><span class="w-2 h-2 bg-primary/60 rounded-full mt-2 flex-shrink-0"></span><span>$1</span></li>');
  processed = processed.replace(/^(\* .+)$/gm, '<li class="mb-3 text-muted-foreground flex items-start gap-3"><span class="w-2 h-2 bg-primary/60 rounded-full mt-2 flex-shrink-0"></span><span>$1</span></li>');
  
  // Wrap consecutive list items in proper containers
  processed = processed.replace(/((<li[^>]*>.*?<\/li>\s*)+)/gs, '<ul class="space-y-1 mb-8 p-4 bg-muted/20 rounded-lg border-l-4 border-l-primary/30">$1</ul>');
  
  // Convert line breaks and paragraphs with better spacing
  processed = processed.split('\n\n')
    .map(paragraph => {
      const trimmed = paragraph.trim();
      if (trimmed && 
          !trimmed.includes('<h') && 
          !trimmed.includes('<ul') && 
          !trimmed.includes('<li') &&
          !trimmed.includes('<strong>')) {
        return `<p class="mb-6 text-muted-foreground leading-relaxed text-lg">${trimmed}</p>`;
      }
      return paragraph;
    })
    .join('\n\n');

  // Convert remaining single line breaks to proper spacing
  processed = processed.replace(/\n(?!<)/g, '<br class="mb-2" />');

  // Clean up empty paragraphs and extra spacing
  processed = processed.replace(/<p[^>]*><\/p>/g, '');
  processed = processed.replace(/<br[^>]*>\s*<br[^>]*>/g, '<br />');

  return processed;
}