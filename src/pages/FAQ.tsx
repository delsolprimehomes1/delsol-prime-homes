
import { LocalizedHead } from '@/components/LocalizedHead';
import Navbar from '@/components/Navbar';
import EnhancedFAQSection from '@/components/EnhancedFAQSection';

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 sm:pt-24">
      <LocalizedHead 
        route="faq"
        currentPath="/faq"
      />
      <Navbar />
      <EnhancedFAQSection />
    </div>
  );
}
