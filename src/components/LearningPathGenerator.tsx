import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Target, 
  ArrowRight,
  Users,
  Clock,
  CheckCircle2,
  Map,
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateLearningPathSchema } from '@/utils/phase3-funnel-intelligence';

interface LearningPath {
  topic: string;
  stages: {
    TOFU: any[];
    MOFU: any[];
    BOFU: any[];
  };
  totalArticles: number;
  completionTime: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const LearningPathGenerator: React.FC = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [learningPaths, setLearningPaths] = React.useState<LearningPath[]>([]);
  const [generatedSchema, setGeneratedSchema] = React.useState<any>(null);
  const [isApplying, setIsApplying] = React.useState(false);

  const handleGeneratePaths = async () => {
    setIsGenerating(true);
    try {
      toast({
        title: "Generating Learning Paths",
        description: "Creating AI-understandable content journeys...",
      });

      // Fetch all articles
      const { data: articles, error } = await supabase
        .from('qa_articles')
        .select('*')
        .order('topic');

      if (error) throw error;
      if (!articles) return;

      // Group articles by topic and create learning paths
      const topicGroups = articles.reduce((groups, article) => {
        const key = article.topic || 'General';
        if (!groups[key]) {
          groups[key] = { TOFU: [], MOFU: [], BOFU: [] };
        }
        
        const stage = article.funnel_stage || 'TOFU';
        if (groups[key][stage]) {
          groups[key][stage].push(article);
        }
        
        return groups;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to learning paths
      const paths: LearningPath[] = Object.entries(topicGroups)
        .filter(([_, stages]) => 
          stages.TOFU.length > 0 || stages.MOFU.length > 0 || stages.BOFU.length > 0
        )
        .map(([topic, stages]) => {
          const totalArticles = stages.TOFU.length + stages.MOFU.length + stages.BOFU.length;
          const avgReadingTime = articles
            .filter(a => a.topic === topic)
            .reduce((sum, a) => sum + (Math.ceil((a.content?.split(/\s+/).length || 0) / 200) || 2), 0) / totalArticles || 2;

          return {
            topic,
            stages: {
              TOFU: stages.TOFU,
              MOFU: stages.MOFU, 
              BOFU: stages.BOFU
            },
            totalArticles,
            completionTime: Math.ceil(avgReadingTime * totalArticles),
            difficulty: getDifficultyLevel(stages)
          };
        })
        .sort((a, b) => b.totalArticles - a.totalArticles);

      setLearningPaths(paths);

      // Generate schema for AI systems
      const schema = generateLearningPathSchema(articles);
      setGeneratedSchema(schema);

      toast({
        title: "Learning Paths Generated",
        description: `Created ${paths.length} structured learning paths for AI consumption.`,
      });

    } catch (error) {
      console.error('Learning path generation failed:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating learning paths.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySchema = async () => {
    if (!generatedSchema) return;

    setIsApplying(true);
    try {
      toast({
        title: "Applying Learning Path Schema",
        description: "Updating articles with AI-understandable learning paths...",
      });

      // Update articles with learning path metadata
      let updatedCount = 0;

      for (const path of learningPaths) {
        const pathArticles = [
          ...path.stages.TOFU,
          ...path.stages.MOFU,
          ...path.stages.BOFU
        ];

        for (const article of pathArticles) {
          const updatedFrontmatter = {
            ...(typeof article.markdown_frontmatter === 'object' && article.markdown_frontmatter !== null ? article.markdown_frontmatter : {}),
            learning_path: {
              topic: path.topic,
              stage: article.funnel_stage,
              position: getPathPosition(article.funnel_stage),
              total_stages: 3,
              completion_time: path.completionTime,
              difficulty: path.difficulty.toLowerCase(),
              schema_applied: true,
              phase3_enhanced: true
            }
          };

          const { error } = await supabase
            .from('qa_articles')
            .update({
              markdown_frontmatter: updatedFrontmatter as any
            })
            .eq('id', article.id);

          if (error) {
            console.error(`Error updating article ${article.slug}:`, error);
          } else {
            updatedCount++;
          }
        }
      }

      toast({
        title: "Schema Applied Successfully",
        description: `Updated ${updatedCount} articles with learning path schema.`,
      });

    } catch (error) {
      console.error('Schema application failed:', error);
      toast({
        title: "Application Failed",
        description: "There was an error applying learning path schema.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const getDifficultyLevel = (stages: Record<string, any[]>): 'Beginner' | 'Intermediate' | 'Advanced' => {
    const totalArticles = stages.TOFU.length + stages.MOFU.length + stages.BOFU.length;
    const bofuRatio = stages.BOFU.length / totalArticles;
    
    if (bofuRatio > 0.4) return 'Advanced';
    if (bofuRatio > 0.2) return 'Intermediate';
    return 'Beginner';
  };

  const getPathPosition = (stage: string): number => {
    switch (stage) {
      case 'TOFU': return 1;
      case 'MOFU': return 2;
      case 'BOFU': return 3;
      default: return 1;
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'TOFU': return <Users className="w-4 h-4 text-blue-600" />;
      case 'MOFU': return <Target className="w-4 h-4 text-yellow-600" />;
      case 'BOFU': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'Awareness';
      case 'MOFU': return 'Research';
      case 'BOFU': return 'Decision';
      default: return stage;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Map className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Learning Path Schema Generator
            </h3>
            <p className="text-muted-foreground mb-4">
              Create AI-understandable learning journeys that help AI systems understand content relationships and user progression
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleGeneratePaths}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Generate Learning Paths
                  </>
                )}
              </Button>

              {generatedSchema && (
                <Button 
                  onClick={handleApplySchema}
                  disabled={isApplying}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      Apply Schema ({learningPaths.length} paths)
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Learning Paths Display */}
      {learningPaths.length > 0 && (
        <div className="grid gap-6">
          {learningPaths.map((path, index) => (
            <Card key={path.topic} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {path.topic} Learning Path
                  </h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {path.completionTime} min total
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        path.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' :
                        path.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}
                    >
                      {path.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {path.totalArticles} articles
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['TOFU', 'MOFU', 'BOFU'].map((stage) => (
                  <div key={stage} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      {getStageIcon(stage)}
                      <h5 className="font-medium">
                        Stage {getPathPosition(stage)}: {getStageLabel(stage)}
                      </h5>
                      <Badge variant="outline" className="text-xs">
                        {path.stages[stage as keyof typeof path.stages].length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {path.stages[stage as keyof typeof path.stages].slice(0, 3).map((article) => (
                        <div 
                          key={article.id}
                          className="p-2 bg-white rounded border text-xs"
                        >
                          <div className="font-medium truncate">{article.title}</div>
                          <div className="text-muted-foreground truncate">
                            {Math.ceil((article.content?.split(/\s+/).length || 0) / 200) || 2} min read
                          </div>
                        </div>
                      ))}
                      
                      {path.stages[stage as keyof typeof path.stages].length > 3 && (
                        <div className="p-2 bg-gray-100 rounded border text-xs text-center text-muted-foreground">
                          +{path.stages[stage as keyof typeof path.stages].length - 3} more articles
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="w-4 h-4" />
                <span>Learners progress from Awareness → Research → Decision</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Schema Preview */}
      {generatedSchema && (
        <Card className="p-6 bg-green-50/50 border-green-200">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-600" />
            Generated Learning Path Schema
          </h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">
                  {generatedSchema.hasPart?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Learning Paths</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">
                  {learningPaths.reduce((sum, path) => sum + path.totalArticles, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Articles</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(learningPaths.reduce((sum, path) => sum + path.completionTime, 0) / 60)}
                </div>
                <div className="text-xs text-muted-foreground">Hours Content</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-xs text-muted-foreground">AI Ready</div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-green-100">
              <h5 className="font-medium mb-2">Schema Benefits for AI Systems:</h5>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  AI systems can understand content progression and dependencies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Learning paths enable personalized content recommendations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Structured data helps with voice assistant responses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Educational schema improves search engine understanding
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* No Paths Generated */}
      {learningPaths.length === 0 && !isGenerating && (
        <Card className="p-6 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Generate Learning Paths
          </h4>
          <p className="text-muted-foreground">
            Click "Generate Learning Paths" to create AI-understandable content journeys from your articles.
          </p>
        </Card>
      )}

    </div>
  );
};

export default LearningPathGenerator;