import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SupportedLanguage } from '@/i18n';

export interface FAQItem {
  id: string;
  slug: string;
  question: string;
  answer_short: string;
  answer_long?: string;
  category: string;
  funnel_stage: string;
  view_count: number;
  is_featured: boolean;
  is_speakable: boolean;
  tags?: string[];
  author_name: string;
  author_url?: string;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
}

export interface FAQCategory {
  key: string;
  name: string;
  description?: string;
  count?: number;
}

export interface FAQAnalytics {
  totalViews: number;
  topQuestions: Array<{
    question: string;
    slug: string;
    views: number;
  }>;
  categoryStats: Record<string, number>;
  funnelStats: {
    TOFU: number;
    MOFU: number;
    BOFU: number;
  };
}

export const useFAQData = (language: SupportedLanguage) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [analytics, setAnalytics] = useState<FAQAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch FAQs
      const { data: faqData, error: faqError } = await supabase
        .from('faqs')
        .select(`
          id, slug, question, answer_short, answer_long, category, 
          funnel_stage, view_count, is_featured, is_speakable, tags,
          author_name, author_url, reviewed_at, created_at, updated_at
        `)
        .eq('language', language)
        .order('is_featured', { ascending: false })
        .order('view_count', { ascending: false })
        .order('sort_order', { ascending: true });

      if (faqError) throw faqError;

      // Fetch categories
      const { data: categoryData, error: categoryError } = await supabase
        .from('faq_categories')
        .select('key, name, description')
        .eq('language', language)
        .order('sort_order', { ascending: true });

      if (categoryError) throw categoryError;

      // Calculate category counts
      const categoriesWithCount = categoryData?.map(cat => ({
        ...cat,
        count: faqData?.filter(faq => faq.category === cat.key).length || 0
      })) || [];

      // Calculate analytics
      const totalViews = faqData?.reduce((sum, faq) => sum + (faq.view_count || 0), 0) || 0;
      const topQuestions = faqData
        ?.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 5)
        .map(faq => ({
          question: faq.question,
          slug: faq.slug,
          views: faq.view_count || 0
        })) || [];

      const categoryStats = categoriesWithCount.reduce((acc, cat) => {
        acc[cat.key] = cat.count || 0;
        return acc;
      }, {} as Record<string, number>);

      const funnelStats = {
        TOFU: faqData?.filter(f => f.funnel_stage === 'TOFU').length || 0,
        MOFU: faqData?.filter(f => f.funnel_stage === 'MOFU').length || 0,
        BOFU: faqData?.filter(f => f.funnel_stage === 'BOFU').length || 0
      };

      setFaqs(faqData || []);
      setCategories(categoriesWithCount);
      setAnalytics({
        totalViews,
        topQuestions,
        categoryStats,
        funnelStats
      });

    } catch (err) {
      console.error('Error fetching FAQ data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch FAQ data');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (slug: string) => {
    try {
      await supabase.rpc('increment_faq_view_count', { faq_slug: slug });
      // Refresh the specific FAQ's view count
      setFaqs(prev => 
        prev.map(faq => 
          faq.slug === slug 
            ? { ...faq, view_count: faq.view_count + 1 }
            : faq
        )
      );
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };

  const getRelatedFAQs = async (faqId: string, limit = 3) => {
    try {
      const { data, error } = await supabase
        .rpc('get_related_faqs', {
          current_faq_id: faqId,
          current_language: language,
          limit_count: limit
        });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching related FAQs:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, [language]);

  return {
    faqs,
    categories,
    analytics,
    loading,
    error,
    refetch: fetchFAQs,
    incrementViewCount,
    getRelatedFAQs
  };
};