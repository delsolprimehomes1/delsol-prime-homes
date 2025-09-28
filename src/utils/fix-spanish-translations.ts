// Fix existing Spanish articles that have English content
import { supabase } from '@/integrations/supabase/client';
import { translateToSpanish } from './multilingual-translator';

export interface FixResult {
  totalFixed: number;
  fixedArticles: {
    id: string;
    oldTitle: string;
    newTitle: string;
    slug: string;
  }[];
  errors: string[];
}

export const fixExistingSpanishArticles = async (): Promise<FixResult> => {
  console.log('🔧 Fixing existing Spanish articles with English content...');
  
  // Get all existing Spanish articles
  const { data: spanishArticles, error } = await supabase
    .from('qa_articles')
    .select('*')
    .eq('language', 'es');

  if (error) throw error;

  const fixedArticles: any[] = [];
  const errors: string[] = [];
  let totalFixed = 0;

  for (const article of spanishArticles || []) {
    try {
      // Generate proper Spanish translation
      const translation = translateToSpanish(article);
      
      // Update the article with translated content
      const { error: updateError } = await supabase
        .from('qa_articles')
        .update({
          title: translation.title,
          slug: translation.slug,
          content: translation.content,
          excerpt: translation.excerpt,
          tags: translation.tags,
          markdown_frontmatter: {
            lang: 'es',
            alternates: translation.alternates,
            sameAs: translation.sameAs,
            translation_updated: new Date().toISOString(),
            ...(article.markdown_frontmatter as Record<string, any> || {})
          } as any
        })
        .eq('id', article.id);

      if (updateError) throw updateError;

      fixedArticles.push({
        id: article.id,
        oldTitle: article.title,
        newTitle: translation.title,
        slug: translation.slug
      });

      totalFixed++;
      console.log(`✅ Fixed: ${article.title} → ${translation.title}`);
      
    } catch (error) {
      const errorMsg = `Error fixing article ${article.id}: ${error}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  console.log(`🎉 Fixed ${totalFixed} Spanish articles!`);
  
  return {
    totalFixed,
    fixedArticles,
    errors
  };
};

// Quick function to run the fix
export const runSpanishContentFix = async (): Promise<void> => {
  const result = await fixExistingSpanishArticles();
  
  console.log('\n📊 SPANISH CONTENT FIX RESULTS:');
  console.log(`Total articles fixed: ${result.totalFixed}`);
  console.log(`Errors encountered: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(error));
  }
  
  console.log('\n✅ Spanish content translation complete!');
};