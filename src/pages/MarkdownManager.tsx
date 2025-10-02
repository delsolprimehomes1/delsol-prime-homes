import { Helmet } from 'react-helmet-async';
import { MarkdownContentManager } from '@/components/MarkdownContentManager';
import Navbar from '@/components/Navbar';

const MarkdownManagerPage = () => {
  return (
    <>
      <Helmet>
        <title>Markdown Content Manager | DelSol Prime Homes</title>
        <meta name="description" content="Import and manage GitHub markdown content with YAML frontmatter" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <MarkdownContentManager />
      </div>
    </>
  );
};

export default MarkdownManagerPage;
