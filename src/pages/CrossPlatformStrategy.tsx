import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function CrossPlatformStrategy() {
  const copyTemplate = (template: string, platform: string) => {
    navigator.clipboard.writeText(template);
    toast.success(`${platform} template copied to clipboard!`);
  };

  const redditTemplate = `**[Question Title - Natural & Conversational]**

Hi everyone! I've been researching [topic] and have a specific question about [specific aspect].

[2-3 sentences explaining your situation or what you've already tried]

**My main questions are:**
1. [Specific question 1]
2. [Specific question 2]

I came across this article that helped: [Your article title + link]

But I'm still wondering about [follow-up question]. Has anyone here dealt with this? Would really appreciate any insights!

**Additional context:**
- [Relevant detail 1]
- [Relevant detail 2]

Thanks in advance! 🙏`;

  const youtubeDescriptionTemplate = `🏡 [Video Title with Question Format]

In this video, I answer one of the most common questions about [topic]: [main question]

📌 What you'll learn:
✅ [Key point 1]
✅ [Key point 2]
✅ [Key point 3]
✅ [Key point 4]

⏱️ TIMESTAMPS:
0:00 - Introduction
0:45 - [Section 1]
2:15 - [Section 2]
4:30 - [Section 3]
6:20 - Key Takeaways

📚 READ THE FULL ARTICLE:
[Your article title]
👉 [Direct link to your article]

💡 RELATED VIDEOS:
• [Related video 1] - [Link]
• [Related video 2] - [Link]

📧 GET MORE INSIGHTS:
Subscribe to our newsletter: [Link]
Book a consultation: [Link]

🔔 Don't forget to SUBSCRIBE for weekly insights on [your niche]!

---
#[Topic] #[Keyword1] #[Keyword2] #[Location]

DISCLAIMER: [Add any necessary disclaimers]`;

  const quoraAnswerTemplate = `**Short answer:** [1-2 sentence direct answer to the question]

---

Let me break this down based on my experience working with [your expertise area]:

**[Subheading 1 - First Key Point]**

[2-3 paragraphs with specific details, examples, or data]

For instance, [specific example or case study].

**[Subheading 2 - Second Key Point]**

[2-3 paragraphs diving deeper]

Here's what most people don't realize: [insight or common misconception].

**[Subheading 3 - Practical Application]**

[Actionable advice with specific steps]

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Key Takeaways:**
• [Takeaway 1]
• [Takeaway 2]
• [Takeaway 3]

---

*I wrote a detailed guide on this topic that covers [additional aspects]. You can read it here:* [Article title + link]

Hope this helps! Feel free to ask if you have follow-up questions.`;

  const linkedInPostTemplate = `🔍 [Hook - Surprising stat or bold statement]

Most people get this wrong when it comes to [topic].

Here's what actually works:

1️⃣ [Point 1 with brief explanation]
→ [Specific example or data point]

2️⃣ [Point 2 with brief explanation]
→ [Specific example or data point]

3️⃣ [Point 3 with brief explanation]
→ [Specific example or data point]

[Personal insight or controversial take]

I've seen this play out countless times with [your experience].

The bottom line: [Key takeaway in one sentence]

---

Want the complete breakdown? I wrote a comprehensive guide covering:
✅ [Benefit 1]
✅ [Benefit 2]
✅ [Benefit 3]

Read it here: [link in comments]

What's been your experience with [topic]? Drop a comment below 👇

#[Industry] #[Topic] #[Keyword1] #[Keyword2]`;

  const contentPillarStrategy = [
    {
      pillar: "Educational (60%)",
      description: "How-to guides, tutorials, explanations",
      example: "How to calculate property taxes in Spain",
      platforms: ["All platforms"]
    },
    {
      pillar: "Inspirational (20%)",
      description: "Success stories, case studies, transformations",
      example: "How a UK couple found their dream villa in 30 days",
      platforms: ["LinkedIn, YouTube"]
    },
    {
      pillar: "Conversational (15%)",
      description: "Questions, polls, discussions",
      example: "What's your biggest concern about buying abroad?",
      platforms: ["Reddit, LinkedIn"]
    },
    {
      pillar: "Promotional (5%)",
      description: "Direct CTAs, service offerings",
      example: "Book a free property consultation",
      platforms: ["LinkedIn only"]
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cross-Platform Content Strategy</h1>
        <p className="text-muted-foreground mt-2">
          Templates and strategies for Reddit, YouTube, Quora, and LinkedIn
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">🎯 Core Strategy Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Content Pillar Distribution</h3>
              <div className="space-y-2">
                {contentPillarStrategy.map((pillar) => (
                  <div key={pillar.pillar} className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{pillar.pillar}</span>
                      <Badge variant="outline">{pillar.description.split(',')[0]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{pillar.example}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Universal Best Practices</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Link strategically:</strong> Natural placement in context, not spammy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Provide value first:</strong> 90% helpful content, 10% self-promotion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Engage authentically:</strong> Reply to comments within 2 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Track performance:</strong> Click-through rates, engagement, conversions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Repurpose content:</strong> One article → 4 platform-specific posts</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reddit" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reddit">Reddit</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="quora">Quora</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
        </TabsList>

        <TabsContent value="reddit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔴</span>
                Reddit Strategy
              </CardTitle>
              <CardDescription>
                Community-first approach with authentic engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Target Subreddits</h3>
                  <div className="space-y-1 text-sm">
                    <div>• r/expats - 500K members</div>
                    <div>• r/spain - 200K members</div>
                    <div>• r/realestate - 800K members</div>
                    <div>• r/internationalliving - 50K members</div>
                    <div>• r/digitalnomad - 1.5M members</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Golden Rules</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex gap-2"><span>✓</span> Build karma first (10+ posts)</li>
                    <li className="flex gap-2"><span>✓</span> Follow subreddit rules strictly</li>
                    <li className="flex gap-2"><span>✓</span> Never lead with links</li>
                    <li className="flex gap-2"><span>✓</span> Engage in comments genuinely</li>
                    <li className="flex gap-2"><span>✓</span> Post during peak hours (EST)</li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Reddit Post Template</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTemplate(redditTemplate, 'Reddit')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                  {redditTemplate}
                </pre>
              </div>

              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-amber-900 mb-2">⚠️ Reddit Don'ts</h4>
                  <ul className="space-y-1 text-sm text-amber-800">
                    <li>• Don't drop links in every comment (instant ban)</li>
                    <li>• Don't use salesy language (community will downvote)</li>
                    <li>• Don't ignore negative comments (engage constructively)</li>
                    <li>• Don't post same content across multiple subreddits same day</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">▶️</span>
                YouTube Strategy
              </CardTitle>
              <CardDescription>
                Long-form educational content with SEO optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Video Types</h3>
                  <div className="space-y-2 text-sm">
                    <Badge className="w-full justify-start">Q&A Format (8-12 min)</Badge>
                    <Badge className="w-full justify-start" variant="secondary">Property Tours (15-20 min)</Badge>
                    <Badge className="w-full justify-start" variant="outline">Process Walkthroughs (10-15 min)</Badge>
                    <Badge className="w-full justify-start" variant="outline">Expert Interviews (20-30 min)</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Content Frequency</h3>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Week 1-4:</strong> 2 videos/week</li>
                    <li><strong>Month 2-3:</strong> 3 videos/week</li>
                    <li><strong>Month 4+:</strong> Daily shorts + 3 long-form</li>
                    <li><strong>Shorts:</strong> 60-90 sec daily</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Optimization Tips</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Front-load keywords in title</li>
                    <li>✓ Custom thumbnail with text</li>
                    <li>✓ 3+ hashtags in description</li>
                    <li>✓ Detailed timestamps</li>
                    <li>✓ Pin first comment with link</li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">YouTube Description Template</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTemplate(youtubeDescriptionTemplate, 'YouTube')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                  {youtubeDescriptionTemplate}
                </pre>
              </div>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-purple-900 mb-2">💡 YouTube Growth Hacks</h4>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li><strong>Hook in 3 seconds:</strong> "I'm going to show you exactly how..."</li>
                    <li><strong>Pattern interrupt:</strong> Change scene every 5-7 seconds</li>
                    <li><strong>Open loops:</strong> "And at the end, I'll reveal the #1 mistake..."</li>
                    <li><strong>CTAs:</strong> Ask for specific actions (like, subscribe, comment)</li>
                    <li><strong>Shorts strategy:</strong> Repurpose article key points into 60-sec videos</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quora" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🅠</span>
                Quora Strategy
              </CardTitle>
              <CardDescription>
                Authority-building through comprehensive answers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Target Questions</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded border text-sm">
                      <div className="font-medium mb-1">High-intent keywords:</div>
                      <div className="text-muted-foreground">"cost to buy property in Spain"</div>
                      <Badge variant="outline" className="mt-1">500+ followers</Badge>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border text-sm">
                      <div className="font-medium mb-1">Process questions:</div>
                      <div className="text-muted-foreground">"How does buying property in Spain work"</div>
                      <Badge variant="outline" className="mt-1">200+ followers</Badge>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border text-sm">
                      <div className="font-medium mb-1">Location-specific:</div>
                      <div className="text-muted-foreground">"Best areas in Costa del Sol"</div>
                      <Badge variant="outline" className="mt-1">100+ followers</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Answer Structure</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">1.</span>
                      <div>
                        <strong>Direct answer first</strong>
                        <p className="text-muted-foreground">1-2 sentences, front-loaded</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">2.</span>
                      <div>
                        <strong>Detailed explanation</strong>
                        <p className="text-muted-foreground">3-4 paragraphs with subheadings</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">3.</span>
                      <div>
                        <strong>Examples & data</strong>
                        <p className="text-muted-foreground">Real cases, numbers, specifics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">4.</span>
                      <div>
                        <strong>Actionable steps</strong>
                        <p className="text-muted-foreground">Numbered list of what to do</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">5.</span>
                      <div>
                        <strong>Link to deep-dive</strong>
                        <p className="text-muted-foreground">Natural mention of your article</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Quora Answer Template</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTemplate(quoraAnswerTemplate, 'Quora')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                  {quoraAnswerTemplate}
                </pre>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-green-900 mb-2">📈 Quora Ranking Factors</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-green-800">
                    <div>
                      <strong>Answer Quality:</strong>
                      <ul className="mt-1 space-y-1 ml-4">
                        <li>• 500+ words ideal length</li>
                        <li>• Use formatting (bold, lists)</li>
                        <li>• Add relevant images</li>
                        <li>• Link to 1-2 credible sources</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Engagement Signals:</strong>
                      <ul className="mt-1 space-y-1 ml-4">
                        <li>• Upvotes (ask network to upvote)</li>
                        <li>• Shares (promote on LinkedIn)</li>
                        <li>• Comments (engage within 1 hour)</li>
                        <li>• Views (follow high-traffic topics)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💼</span>
                LinkedIn Strategy
              </CardTitle>
              <CardDescription>
                Professional thought leadership and networking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Post Types</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <strong>Text posts:</strong> 1300 chars max
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <strong>Document carousels:</strong> 5-10 slides
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <strong>Native video:</strong> 2-5 minutes
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <strong>Polls:</strong> Engagement boosters
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Posting Schedule</h3>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Best days:</strong> Tue-Thu</li>
                    <li><strong>Best times:</strong> 8am, 12pm, 5pm EST</li>
                    <li><strong>Frequency:</strong> 1 post/day</li>
                    <li><strong>Stories:</strong> 2-3/week</li>
                    <li><strong>Comments:</strong> 5-10/day on others</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Algorithm Hacks</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ No links in initial post</li>
                    <li>✓ Add link in first comment</li>
                    <li>✓ Tag 2-3 relevant people</li>
                    <li>✓ Use 3-5 hashtags max</li>
                    <li>✓ Reply to comments quickly</li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">LinkedIn Post Template</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTemplate(linkedInPostTemplate, 'LinkedIn')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </div>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                  {linkedInPostTemplate}
                </pre>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 mb-2">🎯 High-Performing Hooks</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>"• I made a $500K mistake so you don't have to..."</li>
                      <li>"• Everyone gets this wrong about [topic]..."</li>
                      <li>"• 3 years ago I thought [misconception]..."</li>
                      <li>"• Here's what nobody tells you about [topic]..."</li>
                      <li>"• I analyzed 100+ [cases] and found this..."</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-orange-900 mb-2">📊 Content Mix (Weekly)</h4>
                    <div className="space-y-2 text-sm text-orange-800">
                      <div className="flex justify-between">
                        <span>Educational posts</span>
                        <Badge>3/week</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Personal stories</span>
                        <Badge variant="secondary">2/week</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Industry news/trends</span>
                        <Badge variant="outline">1/week</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Engagement (polls/questions)</span>
                        <Badge variant="outline">1/week</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">🚀 30-Day Launch Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="font-bold text-green-900">Week 1: Setup</h3>
              <ul className="text-sm space-y-1">
                <li>• Optimize all profiles</li>
                <li>• Join target communities</li>
                <li>• Build karma on Reddit</li>
                <li>• Follow 100+ relevant people</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-green-900">Week 2: Engage</h3>
              <ul className="text-sm space-y-1">
                <li>• Comment on 20+ posts/day</li>
                <li>• Answer 5 Quora questions</li>
                <li>• Post 3 LinkedIn updates</li>
                <li>• No self-promotion yet</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-green-900">Week 3: Launch</h3>
              <ul className="text-sm space-y-1">
                <li>• Post first Reddit thread</li>
                <li>• Upload first YouTube video</li>
                <li>• Share articles naturally</li>
                <li>• Track engagement metrics</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-green-900">Week 4: Scale</h3>
              <ul className="text-sm space-y-1">
                <li>• 2 posts/platform/week</li>
                <li>• Repurpose top content</li>
                <li>• A/B test headlines</li>
                <li>• Double down on winners</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
