interface LinkToInsert {
  exactText: string;
  url: string;
}

interface InsertionResult {
  updatedContent: string;
  linksInserted: number;
  skippedLinks: string[];
}

/**
 * Safely inserts markdown links into content without breaking existing links or markdown
 */
export function insertInlineLinks(
  content: string,
  links: LinkToInsert[]
): InsertionResult {
  let updatedContent = content;
  let linksInserted = 0;
  const skippedLinks: string[] = [];

  // Sort links by length (longest first) to avoid partial matches
  const sortedLinks = [...links].sort((a, b) => 
    b.exactText.length - a.exactText.length
  );

  for (const link of sortedLinks) {
    const result = insertSingleLink(updatedContent, link.exactText, link.url);
    
    if (result.inserted) {
      updatedContent = result.content;
      linksInserted++;
    } else {
      skippedLinks.push(link.exactText);
    }
  }

  return {
    updatedContent,
    linksInserted,
    skippedLinks
  };
}

/**
 * Inserts a single link into content, checking for conflicts
 */
function insertSingleLink(
  content: string,
  exactText: string,
  url: string
): { content: string; inserted: boolean } {
  // Case-insensitive search for the exact text
  const contentLower = content.toLowerCase();
  const textLower = exactText.toLowerCase();
  const position = contentLower.indexOf(textLower);
  
  if (position === -1) {
    console.log(`Cannot find "${exactText}" in content (case-insensitive search)`);
    return { content, inserted: false };
  }

  // Get the actual text with original casing from content
  const actualText = content.substring(position, position + exactText.length);
  
  // Check if it's already inside a markdown link
  const beforeContext = content.substring(Math.max(0, position - 3), position);
  const afterContext = content.substring(position + exactText.length, Math.min(content.length, position + exactText.length + 3));
  
  // Skip if already linked: [text](url) or ![alt](url)
  if (beforeContext.includes('[') || beforeContext.includes('![') || 
      afterContext.startsWith(']') || afterContext.startsWith('](')) {
    console.log(`"${exactText}" is already in a markdown link`);
    return { content, inserted: false };
  }

  // Find all existing markdown links to avoid conflicts
  const existingLinks = findExistingLinks(content);
  const hasConflict = existingLinks.some(link => 
    position >= link.start && position <= link.end
  );

  if (hasConflict) {
    console.log(`"${exactText}" conflicts with existing link`);
    return { content, inserted: false };
  }

  // Insert the link using exact position
  const before = content.substring(0, position);
  const after = content.substring(position + exactText.length);
  const updatedContent = `${before}[${actualText}](${url})${after}`;
  
  console.log(`✓ Inserted link: "${actualText}" → ${url}`);
  return { content: updatedContent, inserted: true };
}

/**
 * Finds all existing markdown links and their positions
 */
function findExistingLinks(content: string): Array<{ start: number; end: number }> {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: Array<{ start: number; end: number }> = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      start: match.index,
      end: match.index + match[0].length
    });
  }

  return links;
}

/**
 * Validates if a text can be linked in the content
 */
export function canTextBeLinked(content: string, exactText: string): boolean {
  const contentLower = content.toLowerCase();
  const textLower = exactText.toLowerCase();
  const position = contentLower.indexOf(textLower);
  
  if (position === -1) return false;

  const existingLinks = findExistingLinks(content);
  
  return !existingLinks.some(link => 
    position >= link.start && position <= link.end
  );
}

/**
 * Counts how many links are already in the content
 */
export function countExistingLinks(content: string): {
  total: number;
  internal: number;
  external: number;
} {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let total = 0;
  let internal = 0;
  let external = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    total++;
    const url = match[2];
    if (url.startsWith('/') || url.startsWith('#')) {
      internal++;
    } else {
      external++;
    }
  }

  return { total, internal, external };
}
