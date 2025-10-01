/**
 * Utility to extract structured content from blog posts
 * Helps parse and organize content for enhanced blog layout
 */

interface FAQ {
  question: string;
  answer: string;
}

interface KeyTakeaway {
  text: string;
}

/**
 * Extract key takeaways from content
 * Looks for bullet points, numbered lists, or summary sections
 */
export const extractKeyTakeaways = (content: string, excerpt?: string): string[] => {
  const takeaways: string[] = [];
  
  // Try to extract from summary sections
  const summaryMatch = content.match(/<h[23]>.*?(?:summary|takeaways|key points).*?<\/h[23]>(.*?)<h[23]>/is);
  if (summaryMatch) {
    const summaryContent = summaryMatch[1];
    const listItems = summaryContent.match(/<li>(.*?)<\/li>/gi);
    if (listItems) {
      listItems.forEach(item => {
        const text = item.replace(/<\/?li>/gi, '').trim();
        if (text) takeaways.push(text);
      });
    }
  }
  
  // If no takeaways found, extract from first paragraph and lists
  if (takeaways.length === 0) {
    const firstParagraphs = content.match(/<p>(.*?)<\/p>/gi);
    if (firstParagraphs && firstParagraphs.length > 0) {
      const firstP = firstParagraphs[0].replace(/<\/?p>/gi, '').trim();
      if (firstP.length > 50) {
        takeaways.push(firstP.substring(0, 200) + '...');
      }
    }
    
    // Extract from first list
    const firstList = content.match(/<ul>(.*?)<\/ul>/is);
    if (firstList) {
      const listItems = firstList[1].match(/<li>(.*?)<\/li>/gi);
      if (listItems) {
        listItems.slice(0, 3).forEach(item => {
          const text = item.replace(/<\/?li>/gi, '').trim();
          if (text) takeaways.push(text);
        });
      }
    }
  }
  
  // Fallback to excerpt if available
  if (takeaways.length === 0 && excerpt) {
    takeaways.push(excerpt);
  }
  
  // Default takeaways if nothing found
  if (takeaways.length === 0) {
    takeaways.push('Expert insights on Costa del Sol real estate market');
    takeaways.push('Comprehensive property investment guidance');
    takeaways.push('Actionable steps for property buyers');
  }
  
  return takeaways.slice(0, 5); // Max 5 takeaways
};

/**
 * Extract FAQ items from content
 * Looks for Q&A patterns in the content
 */
export const extractFAQs = (content: string, cityTag?: string): FAQ[] => {
  const faqs: FAQ[] = [];
  
  // Look for FAQ section
  const faqMatch = content.match(/<h[23]>.*?(?:faq|frequently asked).*?<\/h[23]>(.*?)(?:<h[23]>|$)/is);
  if (faqMatch) {
    const faqContent = faqMatch[1];
    
    // Try to find Q&A pairs in various formats
    const qaPairs = faqContent.match(/<h[3-6]>(.*?)<\/h[3-6]>(.*?)(?=<h[3-6]>|$)/gis);
    if (qaPairs) {
      qaPairs.forEach(pair => {
        const question = pair.match(/<h[3-6]>(.*?)<\/h[3-6]>/i)?.[1]?.trim();
        const answer = pair.match(/<\/h[3-6]>(.*?)(?=<h[3-6]>|$)/is)?.[1]?.trim();
        
        if (question && answer) {
          faqs.push({
            question: question.replace(/<[^>]*>/g, ''),
            answer: answer.replace(/<[^>]*>/g, '').substring(0, 300)
          });
        }
      });
    }
  }
  
  // Default FAQs if none found
  if (faqs.length === 0) {
    const location = cityTag || 'Costa del Sol';
    faqs.push(
      {
        question: `What makes ${location} properties a good investment?`,
        answer: `${location} offers strong rental yields, year-round demand, and excellent capital appreciation potential due to its prime location and luxury amenities.`
      },
      {
        question: 'How long does the buying process typically take?',
        answer: 'The typical property purchase process takes 6-8 weeks from offer acceptance to completion, depending on financing and legal requirements.'
      },
      {
        question: 'What additional costs should I budget for?',
        answer: 'Budget approximately 10-12% of the purchase price for taxes, legal fees, notary costs, and registration fees.'
      }
    );
  }
  
  return faqs.slice(0, 6); // Max 6 FAQs
};

/**
 * Calculate reading time for voice assistants
 * Returns time in seconds for voice output
 */
export const calculateVoiceReadingTime = (content: string): number => {
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/).length;
  const wordsPerMinute = 150; // Average speaking rate
  const minutes = words / wordsPerMinute;
  return Math.ceil(minutes * 60); // Return in seconds
};

/**
 * Extract speakable content for voice search
 */
export const extractSpeakableContent = (content: string, excerpt: string): string => {
  // Get first meaningful paragraph
  const paragraphs = content.match(/<p>(.*?)<\/p>/gi);
  if (paragraphs && paragraphs.length > 0) {
    const firstParagraph = paragraphs[0]
      .replace(/<\/?p>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
    
    if (firstParagraph.length > 100) {
      return firstParagraph.substring(0, 280) + '...';
    }
  }
  
  return excerpt.substring(0, 280);
};

/**
 * Generate voice search keywords based on content
 */
export const generateVoiceKeywords = (title: string, cityTag?: string): string[] => {
  const location = cityTag || 'Costa del Sol';
  const baseKeywords = [
    `What are the best properties in ${location}`,
    `How to buy property in ${location}`,
    `${location} real estate investment guide`,
    `Property prices in ${location}`,
    `Best areas to invest in ${location}`,
    `${location} luxury property market`
  ];
  
  return baseKeywords;
};
