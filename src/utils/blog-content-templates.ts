/**
 * Blog Content Templates
 * Pre-structured markdown templates for different funnel stages
 * following the enhanced blog layout structure
 */

export type FunnelStage = 'TOFU' | 'MOFU' | 'BOFU';

export interface BlogTemplate {
  structure: string;
  placeholder: string;
  guidance: string[];
}

export const BLOG_TEMPLATES: Record<FunnelStage, BlogTemplate> = {
  TOFU: {
    structure: `## Introduction

[Write an engaging introduction that captures attention and introduces the topic. Focus on education and awareness.]

## Key Takeaways

- [Main point 1 - Keep it actionable and clear]
- [Main point 2 - Focus on what readers will learn]
- [Main point 3 - Make it specific and valuable]
- [Main point 4 - Address a common pain point]
- [Main point 5 - End with an inspiring insight]

## Main Content

### [Subheading 1: Core Topic Area]

[Detailed explanation with examples, statistics, or case studies. Use natural language and conversational tone.]

### [Subheading 2: Supporting Details]

[Continue building on the topic with more depth. Include relevant information that helps readers understand the basics.]

### [Subheading 3: Additional Context]

[Provide context, background, or related information that enriches the topic.]

## Visual Guide: [Process/Comparison/Timeline]

[DIAGRAM PLACEHOLDER: Describe what visual element should go here - process flow, comparison chart, timeline, or map]

## Data Insights

| Metric | Value | Context |
|--------|-------|---------|
| [Metric 1] | [Value] | [Brief explanation] |
| [Metric 2] | [Value] | [Brief explanation] |
| [Metric 3] | [Value] | [Brief explanation] |

## Frequently Asked Questions

### What is [relevant question]?

[Clear, conversational answer that provides value]

### How does [related concept] work?

[Explain in simple terms with practical examples]

### When should I [take action]?

[Provide timing guidance with reasoning]

### Where can I [find resources]?

[Direct readers to relevant resources or next steps]

## Next Steps

Ready to learn more? Here are your next steps:

1. [Action item 1 with internal link]
2. [Action item 2 with resource]
3. [Action item 3 - consultation or guide]
`,
    placeholder: `# Your Blog Title Here

Write an engaging blog post about Costa del Sol real estate...`,
    guidance: [
      'Focus on education and awareness building',
      'Use data and statistics to build credibility',
      'Include 4-6 key takeaways at the beginning',
      'Add 3-5 FAQ items addressing common questions',
      'Keep tone informative and approachable',
      'Include visual elements (diagrams, charts, tables)',
      'End with soft CTAs that encourage further exploration'
    ]
  },

  MOFU: {
    structure: `## Introduction

[Write an introduction that acknowledges the reader's research journey and positions this content as a solution-focused resource.]

## Key Takeaways

- [Main benefit 1 - Focus on problem-solving]
- [Main benefit 2 - Highlight unique advantages]
- [Main benefit 3 - Address specific concerns]
- [Main benefit 4 - Provide comparison insights]
- [Main benefit 5 - Guide decision-making]

## Understanding Your Options

### [Option/Approach 1]

**Pros:**
- [Advantage 1]
- [Advantage 2]

**Cons:**
- [Consideration 1]
- [Consideration 2]

### [Option/Approach 2]

**Pros:**
- [Advantage 1]
- [Advantage 2]

**Cons:**
- [Consideration 1]
- [Consideration 2]

## Comparison Guide

| Feature | Option 1 | Option 2 | Option 3 |
|---------|----------|----------|----------|
| [Criterion 1] | [Value] | [Value] | [Value] |
| [Criterion 2] | [Value] | [Value] | [Value] |
| [Criterion 3] | [Value] | [Value] | [Value] |

## Step-by-Step Process

### Step 1: [Initial Action]

[Detailed explanation with practical guidance]

### Step 2: [Next Action]

[Continue the process with clear instructions]

### Step 3: [Following Action]

[Build momentum toward decision-making]

### Step 4: [Final Action]

[Guide toward next phase or consultation]

## Real Results: Case Study

[Include a brief case study or example showing how this approach worked for someone similar to your reader]

## Frequently Asked Questions

### How long does [process] take?

[Provide realistic timelines with reasoning]

### What are the costs involved?

[Give transparent cost guidance without exact figures]

### What if [common concern]?

[Address objections with reassurance and solutions]

### Who is this best suited for?

[Help readers self-qualify and understand fit]

## Ready to Take Action?

Based on everything we've covered, here's what we recommend:

1. [Specific action item with clear benefit]
2. [Consultation or assessment offer]
3. [Resource download or guide access]

[Include clear CTA button or form]
`,
    placeholder: `# Guide to [Solution/Process]

Help readers compare options and make informed decisions...`,
    guidance: [
      'Focus on comparison and evaluation',
      'Include pros/cons for different approaches',
      'Use comparison tables and data visualizations',
      'Address common objections and concerns',
      'Include case studies or real examples',
      'Provide step-by-step processes',
      'Guide readers toward consultation or next evaluation step',
      'Balance education with gentle persuasion'
    ]
  },

  BOFU: {
    structure: `## Introduction

[Write a direct introduction that acknowledges the reader is ready to take action and positions your service as the solution.]

## Why Choose DelSolPrimeHomes?

### [Unique Value Proposition 1]

[Specific benefit and how it addresses client needs]

### [Unique Value Proposition 2]

[Concrete advantage with supporting evidence]

### [Unique Value Proposition 3]

[Differentiator that sets you apart]

## Our Process: What to Expect

### Phase 1: [Initial Stage]

**Timeline:** [Duration]
**What happens:** [Detailed explanation]
**What you need:** [Requirements or preparations]

### Phase 2: [Development Stage]

**Timeline:** [Duration]
**What happens:** [Detailed explanation]
**What you need:** [Requirements or preparations]

### Phase 3: [Completion Stage]

**Timeline:** [Duration]
**What happens:** [Detailed explanation]
**What you need:** [Requirements or preparations]

## Investment & Value

| Service | Investment Range | What's Included |
|---------|------------------|-----------------|
| [Service 1] | [Range] | [Key deliverables] |
| [Service 2] | [Range] | [Key deliverables] |
| [Service 3] | [Range] | [Key deliverables] |

## Client Success Stories

### [Client Name/Type]

"[Compelling testimonial quote that addresses specific benefits and results]"

**Results:**
- [Specific outcome 1]
- [Specific outcome 2]
- [Specific outcome 3]

## Your Questions Answered

### What makes you different from other agents?

[Clear differentiation with specific examples]

### How do you ensure the best deal for me?

[Explain process, track record, and commitment]

### What if I need to move quickly?

[Address urgency with concrete solutions]

### What happens after we work together?

[Explain ongoing support and follow-through]

## Ready to Start?

You've done your research. Now it's time to take the next step.

### Book Your Consultation

[Strong CTA with clear next steps]
- Schedule: [Booking link or form]
- Call us: [Phone number]
- Email: [Contact email]

### What Happens Next?

1. [Step 1 of onboarding process]
2. [Step 2 of onboarding process]
3. [Step 3 of onboarding process]

We're ready when you are. Let's make your Costa del Sol dreams a reality.

[Booking form or prominent CTA button]
`,
    placeholder: `# Work With DelSolPrimeHomes

Guide ready-to-buy clients through the final decision...`,
    guidance: [
      'Focus on conversion and action',
      'Highlight unique value propositions',
      'Include clear pricing or investment information',
      'Feature testimonials and case studies prominently',
      'Provide detailed process explanation',
      'Address final objections directly',
      'Multiple strong CTAs throughout',
      'Make booking/contact extremely easy',
      'Build trust with credentials and proof',
      'Create urgency without pressure'
    ]
  }
};

/**
 * Get template for specific funnel stage
 */
export function getTemplateForStage(stage: FunnelStage): BlogTemplate {
  return BLOG_TEMPLATES[stage];
}

/**
 * Generate guided content structure with placeholders
 */
export function generateGuidedContent(stage: FunnelStage, title: string, topic?: string): string {
  const template = BLOG_TEMPLATES[stage];
  
  return `# ${title}

${template.structure}

---

**Writing Guidance for ${stage} Content:**

${template.guidance.map((guide, idx) => `${idx + 1}. ${guide}`).join('\n')}
`;
}
