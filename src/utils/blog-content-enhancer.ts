/**
 * Blog Content Enhancer
 * Auto-generates and enhances blog content with structured sections
 */

import { extractKeyTakeaways, extractFAQs } from './blog-content-extractor';

export interface EnhancedContent {
  content: string;
  hasKeyTakeaways: boolean;
  hasFAQs: boolean;
  hasDiagram: boolean;
  hasDataTable: boolean;
  score: number;
}

/**
 * Check if content has required enhanced sections
 */
export function analyzeContentStructure(content: string): {
  hasKeyTakeaways: boolean;
  hasFAQs: boolean;
  hasDiagram: boolean;
  hasDataTable: boolean;
  hasProperHeadings: boolean;
} {
  const lines = content.split('\n');
  
  return {
    hasKeyTakeaways: /##\s*Key Takeaways|##\s*Quick Summary/i.test(content),
    hasFAQs: /##\s*Frequently Asked Questions|##\s*FAQ/i.test(content),
    hasDiagram: /\[DIAGRAM|Visual Guide/i.test(content),
    hasDataTable: /\|.*\|.*\|/m.test(content), // Basic table detection
    hasProperHeadings: lines.some(line => line.match(/^##\s+/))
  };
}

/**
 * Auto-enhance blog content with missing sections
 */
export function enhanceBlogContent(
  content: string,
  title: string,
  excerpt: string,
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU'
): EnhancedContent {
  let enhancedContent = content;
  const structure = analyzeContentStructure(content);
  let score = 50; // Base score

  // Extract or generate key takeaways
  if (!structure.hasKeyTakeaways) {
    const takeaways = extractKeyTakeaways(content, excerpt);
    if (takeaways.length > 0) {
      const takeawaysSection = `\n## Key Takeaways\n\n${takeaways.map(t => `- ${t}`).join('\n')}\n`;
      // Insert after introduction (first paragraph) or at the beginning
      const firstParagraphEnd = content.indexOf('\n\n');
      if (firstParagraphEnd > 0) {
        enhancedContent = 
          content.slice(0, firstParagraphEnd) + 
          takeawaysSection + 
          content.slice(firstParagraphEnd);
      } else {
        enhancedContent = takeawaysSection + content;
      }
      score += 15;
    }
  } else {
    score += 15;
  }

  // Extract or generate FAQs
  if (!structure.hasFAQs) {
    const faqs = extractFAQs(content);
    if (faqs.length > 0) {
      const faqSection = `\n## Frequently Asked Questions\n\n${faqs.map(faq => 
        `### ${faq.question}\n\n${faq.answer}\n`
      ).join('\n')}\n`;
      enhancedContent += faqSection;
      score += 15;
    }
  } else {
    score += 15;
  }

  // Add diagram placeholder if missing and appropriate
  if (!structure.hasDiagram && funnelStage !== 'BOFU') {
    const diagramSection = `\n## Visual Guide\n\n[DIAGRAM PLACEHOLDER: Consider adding a visual element here - process flow, comparison chart, or infographic to enhance understanding]\n`;
    // Insert before FAQ section if it exists
    if (enhancedContent.includes('## Frequently Asked Questions')) {
      enhancedContent = enhancedContent.replace(
        '## Frequently Asked Questions',
        diagramSection + '## Frequently Asked Questions'
      );
    } else {
      enhancedContent += diagramSection;
    }
    score += 10;
  } else if (structure.hasDiagram) {
    score += 10;
  }

  // Check for data tables
  if (structure.hasDataTable) {
    score += 10;
  }

  return {
    content: enhancedContent,
    hasKeyTakeaways: structure.hasKeyTakeaways || extractKeyTakeaways(content, excerpt).length > 0,
    hasFAQs: structure.hasFAQs || extractFAQs(content).length > 0,
    hasDiagram: structure.hasDiagram,
    hasDataTable: structure.hasDataTable,
    score: Math.min(score, 100)
  };
}

/**
 * Validate content quality for enhanced blog structure
 */
export function validateContentQuality(content: string, funnelStage: 'TOFU' | 'MOFU' | 'BOFU'): {
  isValid: boolean;
  warnings: string[];
  score: number;
} {
  const warnings: string[] = [];
  let score = 100;

  // Check minimum length
  const wordCount = content.split(/\s+/).length;
  const minWords = { TOFU: 800, MOFU: 1000, BOFU: 600 };
  
  if (wordCount < minWords[funnelStage]) {
    warnings.push(`Content is too short. Minimum ${minWords[funnelStage]} words recommended for ${funnelStage} content.`);
    score -= 20;
  }

  // Check structure
  const structure = analyzeContentStructure(content);
  
  if (!structure.hasProperHeadings) {
    warnings.push('Content lacks proper heading structure. Use ## for main sections.');
    score -= 15;
  }

  if (!structure.hasKeyTakeaways) {
    warnings.push('Missing key takeaways section. This helps with AI optimization.');
    score -= 10;
  }

  if (!structure.hasFAQs) {
    warnings.push('Missing FAQ section. FAQs improve voice search optimization.');
    score -= 10;
  }

  if (funnelStage === 'MOFU' && !structure.hasDataTable) {
    warnings.push('MOFU content benefits from comparison tables or data.');
    score -= 5;
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    score: Math.max(score, 0)
  };
}

/**
 * Add voice search optimization markers
 */
export function addVoiceSearchMarkers(content: string): string {
  // Add speakable markers to key sections
  let enhanced = content;

  // Mark introduction as speakable
  enhanced = enhanced.replace(
    /^(#{1,2}\s+Introduction.*?\n\n)([\s\S]*?)(\n\n#{1,2})/m,
    '$1<div data-speakable="true">\n\n$2\n\n</div>$3'
  );

  // Mark key takeaways as speakable
  enhanced = enhanced.replace(
    /(##\s+Key Takeaways[\s\S]*?)(\n\n##)/,
    '<div data-speakable="true">\n\n$1\n\n</div>$2'
  );

  return enhanced;
}

/**
 * Generate author bio section
 */
export function generateAuthorBioSection(authorName: string = 'Hans Beeckman'): string {
  return `
## About the Author

**${authorName}** is an accredited real estate agent specializing in luxury properties along the Costa del Sol. With extensive experience in the Spanish real estate market, ${authorName.split(' ')[0]} helps international clients navigate the complexities of purchasing property in Spain.

*Connect with ${authorName.split(' ')[0]} to discuss your Costa del Sol property needs.*
`;
}

/**
 * Format content for enhanced display
 */
export function formatForEnhancedDisplay(content: string, funnelStage: 'TOFU' | 'MOFU' | 'BOFU'): string {
  let formatted = content;

  // Add reading-friendly spacing
  formatted = formatted.replace(/\n\n/g, '\n\n\n');

  // Ensure proper heading hierarchy
  formatted = formatted.replace(/^# /gm, '## '); // Convert h1 to h2
  formatted = formatted.replace(/^#{5,}/gm, '####'); // Limit to h4 max

  // Add voice search markers
  formatted = addVoiceSearchMarkers(formatted);

  // Add author bio if BOFU
  if (funnelStage === 'BOFU' && !formatted.includes('About the Author')) {
    formatted += generateAuthorBioSection();
  }

  return formatted;
}
