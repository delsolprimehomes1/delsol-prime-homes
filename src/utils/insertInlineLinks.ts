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
  // Escape special regex characters in the exact text
  const escapedText = exactText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create regex that:
  // 1. Matches the exact text
  // 2. Is NOT already inside a link: [text] or (url)
  // 3. Is NOT inside code blocks: ` or ```
  const regex = new RegExp(
    `(?<!\\[)(?<!\\]\\()(?<!\`)\b${escapedText}\b(?!\`)(?!\\])(?!\\)\\()`,
    'i'
  );

  // Check if the text exists and is not already linked
  const match = content.match(regex);
  
  if (!match) {
    return { content, inserted: false };
  }

  // Find all existing markdown links to avoid conflicts
  const existingLinks = findExistingLinks(content);
  const matchIndex = match.index!;
  
  // Check if this position conflicts with an existing link
  const hasConflict = existingLinks.some(link => 
    matchIndex >= link.start && matchIndex <= link.end
  );

  if (hasConflict) {
    return { content, inserted: false };
  }

  // Insert the link (only first occurrence)
  const updatedContent = content.replace(regex, `[${exactText}](${url})`);
  
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
  const escapedText = exactText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(?<!\\[)(?<!\\]\\()(?<!\`)\b${escapedText}\b(?!\`)(?!\\])(?!\\)\\()`,
    'i'
  );
  
  const match = content.match(regex);
  if (!match) return false;

  const existingLinks = findExistingLinks(content);
  const matchIndex = match.index!;
  
  return !existingLinks.some(link => 
    matchIndex >= link.start && matchIndex <= link.end
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
