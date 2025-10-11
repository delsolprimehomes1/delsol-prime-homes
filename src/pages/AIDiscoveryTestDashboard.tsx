import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Database, 
  Code, 
  Globe, 
  Bot,
  Search,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'pending' | 'warning';
  message?: string;
  value?: string | number;
  target?: string | number;
  lastChecked?: Date;
}

interface PhaseProgress {
  phase: string;
  total: number;
  completed: number;
  critical: number;
  criticalCompleted: number;
}

const AIDiscoveryTestDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [databaseTests, setDatabaseTests] = useState<TestResult[]>([]);
  const [schemaTests, setSchemaTests] = useState<TestResult[]>([]);
  const [apiTests, setApiTests] = useState<TestResult[]>([]);
  const [configTests, setConfigTests] = useState<TestResult[]>([]);
  const [aiModelTests, setAIModelTests] = useState<TestResult[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    runAllTests();
  }, []);

  const runAllTests = async () => {
    setLoading(true);
    try {
      await Promise.all([
        runDatabaseTests(),
        runSchemaTests(),
        runAPITests(),
        runConfigTests(),
        initializeAIModelTests()
      ]);
      calculateOverallProgress();
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Failed to run some tests');
    } finally {
      setLoading(false);
    }
  };

  const runDatabaseTests = async () => {
    const tests: TestResult[] = [];

    try {
      // Test 1: Speakable Answer Coverage
      const { data: speakableData, error: speakableError } = await supabase
        .from('qa_articles')
        .select('id, speakable_answer', { count: 'exact' })
        .eq('published', true);

      if (!speakableError && speakableData) {
        const total = speakableData.length;
        const withSpeakable = speakableData.filter(a => a.speakable_answer).length;
        const coverage = (withSpeakable / total * 100).toFixed(1);
        
        tests.push({
          id: 'speakable-coverage',
          name: 'Speakable Answer Coverage',
          status: withSpeakable === total ? 'pass' : withSpeakable > total * 0.95 ? 'warning' : 'fail',
          message: `${withSpeakable} of ${total} articles have speakable answers`,
          value: coverage,
          target: '100',
          lastChecked: new Date()
        });
      }

      // Test 2: AI Optimization Scores
      const { data: scoreData, error: scoreError } = await supabase
        .from('qa_articles')
        .select('ai_optimization_score')
        .eq('published', true)
        .not('ai_optimization_score', 'is', null);

      if (!scoreError && scoreData && scoreData.length > 0) {
        const scores = scoreData.map(a => a.ai_optimization_score || 0);
        const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
        const excellentCount = scores.filter(s => s >= 85).length;
        const goodCount = scores.filter(s => s >= 70).length;

        tests.push({
          id: 'ai-scores',
          name: 'Average AI Optimization Score',
          status: parseFloat(avgScore) >= 80 ? 'pass' : parseFloat(avgScore) >= 70 ? 'warning' : 'fail',
          message: `${excellentCount} articles ≥85, ${goodCount} articles ≥70`,
          value: avgScore,
          target: '80',
          lastChecked: new Date()
        });
      }

      // Test 3: Citation Ready Flags
      const { data: flagData, error: flagError } = await supabase
        .from('qa_articles')
        .select('citation_ready, voice_search_ready', { count: 'exact' })
        .eq('published', true);

      if (!flagError && flagData) {
        const total = flagData.length;
        const citationReady = flagData.filter(a => a.citation_ready).length;
        const voiceReady = flagData.filter(a => a.voice_search_ready).length;
        const coverage = Math.min(citationReady, voiceReady);
        const percentage = (coverage / total * 100).toFixed(1);

        tests.push({
          id: 'readiness-flags',
          name: 'Citation & Voice Ready Flags',
          status: coverage >= total * 0.9 ? 'pass' : coverage >= total * 0.8 ? 'warning' : 'fail',
          message: `Citation: ${citationReady}, Voice: ${voiceReady}`,
          value: percentage,
          target: '90',
          lastChecked: new Date()
        });
      }

      // Test 4: Metadata Completeness
      const { data: metaData, error: metaError } = await supabase
        .from('qa_articles')
        .select('geo_coordinates, area_served, tags', { count: 'exact' })
        .eq('published', true);

      if (!metaError && metaData) {
        const total = metaData.length;
        const withGeo = metaData.filter(a => a.geo_coordinates).length;
        const withArea = metaData.filter(a => a.area_served && a.area_served.length > 0).length;
        const withTags = metaData.filter(a => a.tags && a.tags.length > 0).length;
        const avgCompletion = ((withGeo + withArea + withTags) / (total * 3) * 100).toFixed(1);

        tests.push({
          id: 'metadata-complete',
          name: 'Metadata Completeness',
          status: parseFloat(avgCompletion) >= 80 ? 'pass' : parseFloat(avgCompletion) >= 60 ? 'warning' : 'fail',
          message: `Geo: ${withGeo}, Area: ${withArea}, Tags: ${withTags}`,
          value: avgCompletion,
          target: '80',
          lastChecked: new Date()
        });
      }

    } catch (error) {
      console.error('Database tests error:', error);
    }

    setDatabaseTests(tests);
  };

  const runSchemaTests = async () => {
    // Schema tests would require actual page testing
    // For now, provide manual test guidance
    const tests: TestResult[] = [
      {
        id: 'schema-validation',
        name: 'Schema Markup Validation',
        status: 'pending',
        message: 'Test 10 sample articles with Google Rich Results Test',
        lastChecked: new Date()
      },
      {
        id: 'speakable-markup',
        name: 'Speakable Content Markup',
        status: 'pending',
        message: 'Verify speakable selectors on QA pages',
        lastChecked: new Date()
      },
      {
        id: 'faq-schema',
        name: 'FAQ Schema Implementation',
        status: 'pending',
        message: 'Test articles with FAQ sections',
        lastChecked: new Date()
      }
    ];

    setSchemaTests(tests);
  };

  const runAPITests = async () => {
    const tests: TestResult[] = [];
    const baseUrl = window.location.origin;

    try {
      // Test AI Feed endpoint
      const feedResponse = await fetch(`${baseUrl}/api/ai-feed.json`);
      tests.push({
        id: 'ai-feed',
        name: 'AI Feed Endpoint',
        status: feedResponse.ok ? 'pass' : 'fail',
        message: `Status: ${feedResponse.status} ${feedResponse.statusText}`,
        lastChecked: new Date()
      });

      if (feedResponse.ok) {
        const feedData = await feedResponse.json();
        tests.push({
          id: 'ai-feed-content',
          name: 'AI Feed Article Count',
          status: feedData.articles?.length >= 688 ? 'pass' : 'warning',
          message: `${feedData.articles?.length || 0} articles in feed`,
          value: feedData.articles?.length || 0,
          target: '688',
          lastChecked: new Date()
        });
      }

      // Test AI Sitemap endpoint
      const sitemapResponse = await fetch(`${baseUrl}/api/sitemap-ai.xml`);
      tests.push({
        id: 'ai-sitemap',
        name: 'AI Sitemap Endpoint',
        status: sitemapResponse.ok ? 'pass' : 'fail',
        message: `Status: ${sitemapResponse.status} ${sitemapResponse.statusText}`,
        lastChecked: new Date()
      });

      // Test sample QA JSON endpoint
      const sampleSlug = 'buying-process-costa-del-sol';
      const qaJsonResponse = await fetch(`${baseUrl}/api/qa/${sampleSlug}.json`);
      tests.push({
        id: 'qa-json',
        name: 'Individual QA JSON',
        status: qaJsonResponse.ok ? 'pass' : 'fail',
        message: `Tested: /api/qa/${sampleSlug}.json`,
        lastChecked: new Date()
      });

    } catch (error) {
      console.error('API tests error:', error);
      tests.push({
        id: 'api-error',
        name: 'API Tests',
        status: 'fail',
        message: 'Failed to run API tests',
        lastChecked: new Date()
      });
    }

    setApiTests(tests);
  };

  const runConfigTests = async () => {
    const tests: TestResult[] = [];
    const baseUrl = window.location.origin;

    try {
      // Test robots.txt
      const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
      tests.push({
        id: 'robots-txt',
        name: 'Robots.txt Accessible',
        status: robotsResponse.ok ? 'pass' : 'fail',
        message: `Status: ${robotsResponse.status}`,
        lastChecked: new Date()
      });

      // Test main sitemap
      const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
      tests.push({
        id: 'main-sitemap',
        name: 'Main Sitemap Accessible',
        status: sitemapResponse.ok ? 'pass' : 'fail',
        message: `Status: ${sitemapResponse.status}`,
        lastChecked: new Date()
      });

      // Check CORS headers on AI feed
      const corsResponse = await fetch(`${baseUrl}/api/ai-feed.json`);
      const corsHeader = corsResponse.headers.get('Access-Control-Allow-Origin');
      tests.push({
        id: 'cors-headers',
        name: 'CORS Headers Configured',
        status: corsHeader === '*' ? 'pass' : 'warning',
        message: corsHeader ? `CORS: ${corsHeader}` : 'No CORS headers found',
        lastChecked: new Date()
      });

    } catch (error) {
      console.error('Config tests error:', error);
    }

    setConfigTests(tests);
  };

  const initializeAIModelTests = () => {
    // AI model tests are manual - provide status tracking
    const tests: TestResult[] = [
      {
        id: 'chatgpt-test',
        name: 'ChatGPT Citation Test',
        status: 'pending',
        message: 'Test 5 queries manually at chat.openai.com',
        lastChecked: new Date()
      },
      {
        id: 'claude-test',
        name: 'Claude Citation Test',
        status: 'pending',
        message: 'Test 5 queries manually at claude.ai',
        lastChecked: new Date()
      },
      {
        id: 'perplexity-test',
        name: 'Perplexity Citation Test',
        status: 'pending',
        message: 'Test 5 queries manually at perplexity.ai',
        lastChecked: new Date()
      },
      {
        id: 'google-test',
        name: 'Google SGE Test',
        status: 'pending',
        message: 'Test queries in Google Search',
        lastChecked: new Date()
      }
    ];

    setAIModelTests(tests);
  };

  const calculateOverallProgress = () => {
    const allTests = [
      ...databaseTests,
      ...schemaTests,
      ...apiTests,
      ...configTests,
      ...aiModelTests
    ];

    const completed = allTests.filter(t => t.status === 'pass').length;
    const total = allTests.length;
    const progress = total > 0 ? (completed / total * 100) : 0;

    setOverallProgress(progress);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const TestCard = ({ test }: { test: TestResult }) => (
    <div className="flex items-start justify-between p-4 border rounded-lg">
      <div className="flex items-start gap-3 flex-1">
        {getStatusIcon(test.status)}
        <div className="flex-1">
          <h4 className="font-medium">{test.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
          {test.value && test.target && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-mono">{test.value}</span>
              <span className="text-sm text-muted-foreground">/ {test.target}</span>
            </div>
          )}
        </div>
      </div>
      {getStatusBadge(test.status)}
    </div>
  );

  const phaseProgress: PhaseProgress[] = [
    {
      phase: 'Database Content',
      total: databaseTests.length,
      completed: databaseTests.filter(t => t.status === 'pass').length,
      critical: databaseTests.length,
      criticalCompleted: databaseTests.filter(t => t.status === 'pass').length
    },
    {
      phase: 'Schema Validation',
      total: schemaTests.length,
      completed: schemaTests.filter(t => t.status === 'pass').length,
      critical: 1,
      criticalCompleted: schemaTests.filter(t => t.status === 'pass').length > 0 ? 1 : 0
    },
    {
      phase: 'API Endpoints',
      total: apiTests.length,
      completed: apiTests.filter(t => t.status === 'pass').length,
      critical: apiTests.length,
      criticalCompleted: apiTests.filter(t => t.status === 'pass').length
    },
    {
      phase: 'Configuration',
      total: configTests.length,
      completed: configTests.filter(t => t.status === 'pass').length,
      critical: configTests.length,
      criticalCompleted: configTests.filter(t => t.status === 'pass').length
    },
    {
      phase: 'AI Model Testing',
      total: aiModelTests.length,
      completed: aiModelTests.filter(t => t.status === 'pass').length,
      critical: 0,
      criticalCompleted: 0
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Discovery Testing Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive validation of AI optimization and discoverability
              </p>
            </div>
            <Button onClick={runAllTests} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Running Tests...' : 'Refresh All'}
            </Button>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Readiness</CardTitle>
              <CardDescription>Your site's AI discovery score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">{Math.round(overallProgress)}%</span>
                  <Badge variant={overallProgress >= 90 ? 'default' : overallProgress >= 70 ? 'secondary' : 'outline'}>
                    {overallProgress >= 90 ? 'Excellent' : overallProgress >= 70 ? 'Good' : 'Needs Work'}
                  </Badge>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <div className="grid grid-cols-5 gap-4 pt-4">
                  {phaseProgress.map((phase) => (
                    <div key={phase.phase} className="text-center">
                      <div className="text-sm font-medium mb-1">{phase.phase}</div>
                      <div className="text-2xl font-bold text-primary">
                        {phase.completed}/{phase.total}
                      </div>
                      {phase.critical > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {phase.criticalCompleted}/{phase.critical} critical
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Tabs */}
          <Tabs defaultValue="database" className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </TabsTrigger>
              <TabsTrigger value="schema" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Schema
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                API
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Config
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Models
              </TabsTrigger>
            </TabsList>

            <TabsContent value="database" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Database Content Validation</CardTitle>
                  <CardDescription>
                    Verify content quality, speakable answers, and AI optimization scores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {databaseTests.map(test => (
                    <TestCard key={test.id} test={test} />
                  ))}
                  {databaseTests.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No tests run yet. Click "Refresh All" to start.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schema" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Schema Markup Validation</CardTitle>
                  <CardDescription>
                    Test structured data with Google Rich Results Test
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {schemaTests.map(test => (
                    <TestCard key={test.id} test={test} />
                  ))}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Manual Testing Required:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Test 10 sample articles with <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Google Rich Results Test <ExternalLink className="h-3 w-3" /></a></li>
                      <li>• Verify QAPage, FAQPage, and Organization schemas</li>
                      <li>• Check speakable content markup</li>
                      <li>• Ensure author and reviewer schemas are present</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoint Testing</CardTitle>
                  <CardDescription>
                    Verify AI discovery endpoints are accessible and returning data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apiTests.map(test => (
                    <TestCard key={test.id} test={test} />
                  ))}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Test URLs:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <a href="/api/ai-feed.json" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                          /api/ai-feed.json <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>
                        <a href="/api/sitemap-ai.xml" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                          /api/sitemap-ai.xml <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>
                        <a href="/api/qa/buying-process-costa-del-sol.json" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                          /api/qa/buying-process-costa-del-sol.json <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Testing</CardTitle>
                  <CardDescription>
                    Verify robots.txt, sitemaps, and CORS configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {configTests.map(test => (
                    <TestCard key={test.id} test={test} />
                  ))}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Configuration Files:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <a href="/robots.txt" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                          /robots.txt <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>
                        <a href="/sitemap.xml" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
                          /sitemap.xml <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Model Citation Testing</CardTitle>
                  <CardDescription>
                    Test if AI models can find and cite your content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiModelTests.map(test => (
                    <TestCard key={test.id} test={test} />
                  ))}
                  <div className="pt-4 border-t space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Test Queries to Use:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>1. "What are the property taxes in Marbella, Spain?"</li>
                        <li>2. "How much does it cost to buy a villa in Costa del Sol?"</li>
                        <li>3. "What is the buying process for property in Spain?"</li>
                        <li>4. "Best areas to invest in Costa del Sol real estate"</li>
                        <li>5. "Can foreigners buy property in Marbella?"</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Test Platforms:</h4>
                      <ul className="space-y-2">
                        <li>
                          <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                            ChatGPT <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                        <li>
                          <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                            Claude <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                        <li>
                          <a href="https://www.perplexity.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                            Perplexity <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                        <li>
                          <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                            Google Search <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Documentation Link */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Complete Testing Checklist</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    For the full testing checklist with detailed instructions, see the comprehensive guide:
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/docs/ai-discovery-testing-checklist.md" target="_blank">
                      View Complete Testing Guide
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIDiscoveryTestDashboard;
