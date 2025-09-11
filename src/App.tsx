
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import i18n from './i18n';
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BookViewing from "./pages/BookViewing";
import QAHub from "./pages/FAQ";
import QA from "./pages/QA";
import QAPost from "./pages/QAPost";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <I18nextProvider i18n={i18n}>
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
              <Route path="/book-viewing" element={<BookViewing />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </I18nextProvider>
  </HelmetProvider>
);

export default App;
