import { Helmet } from 'react-helmet-async';
import { BlogBuilder } from '@/components/blog/BlogBuilder';

const BlogBuilderPage = () => {
  return (
    <>
      <Helmet>
        <title>Blog Builder | DelSol Prime Homes</title>
        <meta name="description" content="Create and manage blog posts with AI assistance" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <h1 className="text-lg font-semibold">Blog Builder</h1>
          </div>
        </header>
        
        <main className="container py-6">
          <BlogBuilder />
        </main>
      </div>
    </>
  );
};

export default BlogBuilderPage;