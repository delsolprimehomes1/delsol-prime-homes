
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { I18nWrapper } from './components/I18nWrapper';
import { LanguageProvider } from './contexts/LanguageContext';
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BookViewing from "./pages/BookViewing";
import QAHub from "./pages/FAQ";
import QA from "./pages/QA";
import QAPost from "./pages/QAPost";
import ContentManager from "./pages/ContentManager";
import ClusterTracker from "./pages/ClusterTracker";
import QACategoryMigration from "./pages/QACategoryMigration";
import ClusterReorganization from "./pages/ClusterReorganization";
import AIOptimizationDashboard from "./pages/AIOptimizationDashboard";
import BlogBuilderPage from "./pages/BlogBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <I18nWrapper>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/:lang/blog/:slug" element={<BlogPost />} />
              <Route path="/faq" element={<QAHub />} />
              <Route path="/qa" element={<QAHub />} />
              <Route path="/qa/:slug" element={<QAPost />} />
              <Route path="/:lang/qa/:slug" element={<QAPost />} />
              <Route path="/:lang/qa" element={<QAHub />} />
              <Route path="/:lang/faq" element={<QAHub />} />
              <Route path="/content-manager" element={<ContentManager />} />
              <Route path="/ai-optimization" element={<AIOptimizationDashboard />} />
              <Route path="/blog-builder" element={<BlogBuilderPage />} />
              <Route path="/book-viewing" element={<BookViewing />} />
          <Route path="/admin/qa-migration" element={<QACategoryMigration />} />
          <Route path="/admin/cluster-reorganization" element={<ClusterReorganization />} />
          <Route path="/admin/cluster-tracker" element={<ClusterTracker />} />
              
              {/* Location-specific landing pages for enhanced SEO */}
              <Route path="/marbella" element={<QAHub />} />
              <Route path="/marbella/villas" element={<QAHub />} />
              <Route path="/marbella/apartments" element={<QAHub />} />
              <Route path="/estepona" element={<QAHub />} />
              <Route path="/estepona/villas" element={<QAHub />} />
              <Route path="/estepona/apartments" element={<QAHub />} />
              <Route path="/fuengirola" element={<QAHub />} />
              <Route path="/fuengirola/villas" element={<QAHub />} />
              <Route path="/fuengirola/apartments" element={<QAHub />} />
              <Route path="/benalmadena" element={<QAHub />} />
              <Route path="/benalmadena/villas" element={<QAHub />} />
              <Route path="/benalmadena/apartments" element={<QAHub />} />
              <Route path="/mijas" element={<QAHub />} />
              <Route path="/mijas/villas" element={<QAHub />} />
              <Route path="/mijas/apartments" element={<QAHub />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </I18nWrapper>
</HelmetProvider>
);

export default App;
