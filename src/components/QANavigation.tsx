import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QAArticle {
  id: string;
  slug: string;
  title: string;
  funnel_stage: string;
}

interface QANavigationProps {
  currentArticle: QAArticle;
  allArticles: QAArticle[];
}

export const QANavigation = ({ currentArticle, allArticles }: QANavigationProps) => {
  const currentIndex = allArticles.findIndex(article => article.id === currentArticle.id);
  const previousArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  return (
    <section className="py-12 bg-muted/30 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back to FAQ */}
          <div className="text-center mb-8">
            <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
              <Link to="/faq">
                <ArrowLeft className="mr-2 w-4 h-4" />
                ← Back to FAQ
              </Link>
            </Button>
          </div>

          {/* Previous/Next Navigation */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Previous Article */}
            <div>
              {previousArticle ? (
                <Link to={`/qa/${previousArticle.slug}`} className="block group">
                  <Card className="p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <ArrowLeft className="w-5 h-5 text-primary mt-1 group-hover:-translate-x-1 transition-transform duration-200" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Previous Question</p>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                          {previousArticle.title}
                        </h4>
                      </div>
                    </div>
                  </Card>
                </Link>
              ) : (
                <Card className="p-6 h-full bg-muted/50">
                  <div className="flex items-start gap-3 opacity-50">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Previous Question</p>
                      <p className="text-muted-foreground">This is the first article</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Next Article */}
            <div>
              {nextArticle ? (
                <Link to={`/qa/${nextArticle.slug}`} className="block group">
                  <Card className="p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-start gap-3 text-right">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">Next Question</p>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                          {nextArticle.title}
                        </h4>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary mt-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Card>
                </Link>
              ) : (
                <Card className="p-6 h-full bg-muted/50">
                  <div className="flex items-start gap-3 text-right opacity-50">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">Next Question</p>
                      <p className="text-muted-foreground">This is the last article</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground mt-1" />
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Article Counter */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {allArticles.length}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};