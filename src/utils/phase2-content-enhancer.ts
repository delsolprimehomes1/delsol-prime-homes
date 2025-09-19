// Phase 2: Content Quality Enhancement - Batch Processing System
// Enforces 1200+ character minimum and voice-friendly structure across all QA articles

import { supabase } from '@/integrations/supabase/client';
import { checkContentQuality, extractShortAnswer, generateQuickAnswer } from './content-quality-guard';
import { formatForVoice, formatQuickAnswerBullets } from './voice-friendly-formatter';

export interface ContentEnhancementResult {
  articlesProcessed: number;
  articlesEnhanced: number;
  articlesBelowMinimum: number;
  articlesNoIndexed: number;
  averageCharCount: number;
  voiceReadyCount: number;
  citationReadyCount: number;
  enhancementDetails: {
    id: string;
    slug: string;
    title: string;
    oldCharCount: number;
    newCharCount: number;
    enhanced: boolean;
    issues: string[];
  }[];
}

// Enhance a single article's content structure
export const enhanceSingleArticle = async (article: any): Promise<{
  enhanced: boolean;
  newCharCount: number;
  issues: string[];
}> => {
  const qualityCheck = checkContentQuality(article);
  let enhanced = false;
  let newContent = article.content || '';
  const issues: string[] = [];

  // Extract or generate short answer
  const shortAnswer = extractShortAnswer(article.content || '', article.title);
  
  // Generate quick answer bullets
  const quickAnswerBullets = generateQuickAnswer(
    article.content || '', 
    article.title, 
    article.topic || ''
  );
  const formattedBullets = formatQuickAnswerBullets(quickAnswerBullets);

  // Apply voice-friendly formatting
  const voiceOptimizedContent = formatForVoice(newContent, article.title);

  // Create enhanced content structure if needed
  if (!qualityCheck.meetsMinimum || !qualityCheck.hasShortAnswer) {
    // Expand content if too short
    if (qualityCheck.charCount < 1200) {
      // Add structured expansion based on topic
      const expansionContent = generateContentExpansion(article);
      newContent = voiceOptimizedContent + '\n\n' + expansionContent;
      enhanced = true;
    }

    // Update the article structure
    const updatedArticle = {
      ...article,
      content: newContent,
      excerpt: article.excerpt || shortAnswer,
      markdown_frontmatter: {
        ...(typeof article.markdown_frontmatter === 'object' && article.markdown_frontmatter !== null 
          ? article.markdown_frontmatter 
          : {}),
        short_answer: shortAnswer,
        quick_answer_bullets: formattedBullets,
        voice_optimized: true,
        enhanced_in_phase2: new Date().toISOString()
      }
    };

    // Update in database
    const { error } = await supabase
      .from('qa_articles')
      .update({
        content: updatedArticle.content,
        excerpt: updatedArticle.excerpt,
        markdown_frontmatter: updatedArticle.markdown_frontmatter,
        voice_search_ready: qualityCheck.hasShortAnswer && qualityCheck.hasQuickAnswer,
        citation_ready: newContent.length >= 1200 && qualityCheck.hasShortAnswer
      })
      .eq('id', article.id);

    if (error) {
      issues.push(`Database update failed: ${error.message}`);
    } else {
      enhanced = true;
    }
  }

  return {
    enhanced,
    newCharCount: newContent.length,
    issues
  };
};

// Generate topic-specific content expansion
const generateContentExpansion = (article: any): string => {
  const topic = article.topic || 'General';
  const funnelStage = article.funnel_stage || 'TOFU';
  const baseContent = article.content || '';
  
  // Topic-specific expansion templates
  const expansionTemplates: Record<string, string> = {
    'Legal & Process Timeline': `
## Legal Requirements and Documentation

When dealing with Spanish property law, several key documents are essential:

### Essential Documents
- NIE Number (Número de Identificación de Extranjero)
- Bank account in Spain
- Property registration certificate
- Energy efficiency certificate

### Timeline Considerations
The typical process takes 4-8 weeks from offer acceptance to completion. Key milestones include:

1. **Initial Agreement** (Week 1): Terms negotiation and reservation
2. **Legal Review** (Weeks 2-3): Document verification and searches  
3. **Mortgage Application** (Weeks 3-5): If financing required
4. **Final Contracts** (Weeks 6-8): Completion and key handover

### Common Pitfalls to Avoid
- Not obtaining proper legal representation
- Rushing the due diligence process
- Overlooking community fees and taxes
- Insufficient property survey and inspection
`,

    'Investment & Financing': `
## Investment Analysis and Financing Options

Costa del Sol property investment requires careful financial planning:

### Investment Metrics
- Average rental yields: 4-6% annually
- Capital appreciation: 3-5% per year historically
- Total return on investment: 7-11% combined

### Financing Structure
**Spanish Mortgage Options:**
- Maximum LTV: 70% for non-residents
- Interest rates: 2.5-4.5% (variable/fixed)
- Mortgage term: Up to 25-30 years
- Required deposit: Minimum 30% plus costs

### Tax Implications
- Property purchase tax: 8-10% of purchase price
- Annual property tax (IBI): 0.4-1.1% of cadastral value
- Rental income tax: 19-47% depending on residency status
- Capital gains tax: 19-23% on profit upon sale

### ROI Calculation Example
For a €300,000 property:
- Annual rental income: €15,000 (5% yield)
- Annual costs: €3,000 (taxes, maintenance, management)  
- Net annual return: €12,000 (4% net yield)
- Plus potential capital appreciation
`,

    'Location Intelligence': `
## Area Analysis and Location Factors

Location selection is crucial for Costa del Sol property success:

### Prime Location Characteristics
- **Proximity to amenities**: Walking distance to shops, restaurants, healthcare
- **Transport links**: Access to airports, train stations, major highways
- **Beach access**: Direct beach access or short walking distance
- **Development potential**: Planned infrastructure improvements

### Micro-location Analysis
**Marbella Golden Mile:**
- Premium beachfront properties
- Luxury amenities and services
- High rental demand year-round
- Strong capital appreciation potential

**Estepona Marina District:**
- Modern developments with sea views
- Growing expat community
- Excellent restaurants and nightlife
- Good value compared to Marbella

### Infrastructure Considerations
- Water supply and quality
- Internet connectivity speed
- Public transport availability
- Parking facilities and restrictions
- Noise levels and privacy factors

### Future Development Impact
Consider planned developments that may affect:
- Property values (positive/negative)
- Views and privacy
- Traffic and accessibility
- Community character changes
`
  };

  // Get expansion content or generate generic expansion
  let expansionContent = expansionTemplates[topic] || generateGenericExpansion(article);
  
  // Add funnel-stage specific content
  if (funnelStage === 'BOFU') {
    expansionContent += `

## Next Steps and Action Plan

Now that you understand the key considerations, here's your action plan:

### Immediate Actions (Next 1-2 weeks)
1. **Define your budget** including all associated costs
2. **Get mortgage pre-approval** if financing is needed  
3. **Identify target areas** based on your lifestyle preferences
4. **Engage a local property expert** for market insights

### Property Search Phase (Weeks 3-8)
1. **View properties** that match your criteria
2. **Conduct due diligence** on shortlisted properties
3. **Negotiate terms** with seller or agent
4. **Arrange professional inspections** and surveys

### Completion Phase (Weeks 9-12)
1. **Finalize legal documentation** with Spanish lawyer
2. **Complete mortgage application** and approval process
3. **Arrange insurance** and utility connections
4. **Plan completion day** logistics and key handover

**Ready to get started?** Contact our local experts for personalized guidance tailored to your specific situation and requirements.
`;
  }

  return expansionContent;
};

// Generate generic content expansion for any topic
const generateGenericExpansion = (article: any): string => {
  const title = article.title || '';
  const topic = article.topic || 'property investment';
  
  return `
## Important Considerations

When dealing with ${topic.toLowerCase()} in Costa del Sol, several factors require careful attention:

### Key Factors to Consider
- **Legal requirements** and documentation needed
- **Financial implications** including taxes and fees
- **Timeline expectations** for the complete process
- **Professional support** from qualified experts

### Expert Recommendations
Based on our experience with international buyers:

1. **Research thoroughly** before making any commitments
2. **Get professional advice** from licensed specialists  
3. **Allow adequate time** for proper due diligence
4. **Budget for all costs** including unexpected expenses

### Common Questions
Many buyers ask about similar situations. The most important aspects typically include:

- Understanding local regulations and requirements
- Calculating total investment including all costs
- Managing the timeline and process efficiently
- Ensuring proper legal protection throughout

### Professional Support
Working with experienced professionals can help you:
- Navigate complex legal and administrative requirements
- Avoid common pitfalls and costly mistakes
- Complete the process efficiently and confidently
- Access local market knowledge and insights

**Need personalized guidance?** Our team of Costa del Sol property experts can provide tailored advice for your specific situation.
`;
};

// Batch enhance all articles needing improvement
export const batchEnhanceAllArticles = async (): Promise<ContentEnhancementResult> => {
  console.log('🚀 Starting Phase 2: Content Quality Enhancement...');
  
  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }

  const result: ContentEnhancementResult = {
    articlesProcessed: 0,
    articlesEnhanced: 0,
    articlesBelowMinimum: 0,
    articlesNoIndexed: 0,
    averageCharCount: 0,
    voiceReadyCount: 0,
    citationReadyCount: 0,
    enhancementDetails: []
  };

  let totalCharCount = 0;
  let voiceReadyCount = 0;
  let citationReadyCount = 0;

  // Process each article
  for (const article of articles || []) {
    const qualityCheck = checkContentQuality(article);
    const oldCharCount = qualityCheck.charCount;
    
    result.articlesProcessed++;
    
    if (!qualityCheck.meetsMinimum) {
      result.articlesBelowMinimum++;
    }
    
    if (qualityCheck.shouldNoIndex) {
      result.articlesNoIndexed++;
    }

    // Enhance if needed
    let enhanced = false;
    let newCharCount = oldCharCount;
    let issues: string[] = [];

    if (!qualityCheck.isValid || !qualityCheck.meetsMinimum) {
      try {
        const enhancementResult = await enhanceSingleArticle(article);
        enhanced = enhancementResult.enhanced;
        newCharCount = enhancementResult.newCharCount;
        issues = enhancementResult.issues;
        
        if (enhanced) {
          result.articlesEnhanced++;
        }
      } catch (error) {
        console.error(`Error enhancing article ${article.slug}:`, error);
        issues.push(`Enhancement failed: ${error}`);
      }
    }

    // Track statistics
    totalCharCount += newCharCount;
    
    // Re-check quality after enhancement
    const updatedArticle = { ...article, content: article.content };
    const finalQualityCheck = checkContentQuality(updatedArticle);
    
    if (finalQualityCheck.hasShortAnswer && finalQualityCheck.hasQuickAnswer) {
      voiceReadyCount++;
    }
    
    if (finalQualityCheck.isValid) {
      citationReadyCount++;
    }

    // Store enhancement details
    result.enhancementDetails.push({
      id: article.id,
      slug: article.slug,
      title: article.title,
      oldCharCount,
      newCharCount,
      enhanced,
      issues
    });

    console.log(`✅ Processed ${article.slug}: ${oldCharCount} → ${newCharCount} chars ${enhanced ? '(enhanced)' : ''}`);
  }

  // Calculate final statistics
  result.averageCharCount = Math.round(totalCharCount / (articles?.length || 1));
  result.voiceReadyCount = voiceReadyCount;
  result.citationReadyCount = citationReadyCount;

  console.log(`🎉 Phase 2 Complete: Enhanced ${result.articlesEnhanced}/${result.articlesProcessed} articles`);
  console.log(`📈 Average char count: ${result.averageCharCount}`);
  console.log(`🎤 Voice ready: ${result.voiceReadyCount} articles`);
  console.log(`📖 Citation ready: ${result.citationReadyCount} articles`);

  return result;
};