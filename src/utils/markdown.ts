/**
 * Processes markdown in titles to remove header syntax and convert bold text
 * @param title - The title string that may contain markdown
 * @returns Clean HTML for the title
 */
export function processMarkdownTitle(title: string): string {
  if (!title) return '';
  
  let processed = title;
  
  // Remove header markdown (##, ###, etc.)
  processed = processed.replace(/^#{1,6}\s*/gm, '');
  
  // Convert bold text **text** to <strong> tags
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // Remove any remaining markdown artifacts
  processed = processed.replace(/[*_~`]/g, '');
  
  return processed.trim();
}

/**
 * Converts markdown content to HTML with proper formatting
 * Handles headers, bold text, lists, and line breaks
 */
export function processMarkdownContent(content: string): string {
  if (!content) return '';

  let processed = content;

  // Remove AI citation artifacts
  processed = processed.replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, '');
  
  // Fix malformed markdown at start of content (e.g., "Málaga**:" -> "**Málaga**:")
  processed = processed.replace(/^([^*]+)\*\*:/gm, '**$1**:');

  // Convert markdown links [text](url) to HTML anchor tags
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors">$1</a>');

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