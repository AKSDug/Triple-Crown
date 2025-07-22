# Triple-Crown Actions Guide

Complete guide to using and creating actions in the Triple-Crown Obsidian plugin.

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Built-in Actions](#built-in-actions)
- [Enabling Disabled Actions](#enabling-disabled-actions)
- [Custom Actions](#custom-actions)
- [Action Examples](#action-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Access Actions via Command Palette
1. Press `Ctrl/Cmd + P` to open Command Palette
2. Type the action name (e.g., "Generate Tags")
3. Press Enter to execute

### Enable/Disable Actions
1. Go to **Settings** → **Community Plugins** → **Triple-Crown**
2. Scroll to **Actions** section
3. Toggle actions on/off as needed

## 🎯 Built-in Actions

### ✅ Writing Assistant
**Status:** Enabled by default  
**Command:** "Writing Assistant"  
**Usage:** Select text or place cursor, then run command  
**Purpose:** Improve, expand, simplify, or summarize text

**Features:**
- Multiple improvement options
- Preserves author voice
- Context-aware suggestions
- Non-destructive editing

### ✅ Tag Builder
**Status:** Enabled by default  
**Command:** "Generate Tags"  
**Usage:** Run on any markdown file  
**Purpose:** Automatically generate relevant tags based on content

**Features:**
- Analyzes content themes and topics
- Suggests 3-8 relevant tags
- Uses lowercase, hyphenated format
- Adds tags to frontmatter or inline

**Example Output:**
```yaml
---
tags: ["artificial-intelligence", "research-methods", "productivity-tools"]
---
```

### ✅ Connection Finder
**Status:** Enabled by default  
**Command:** "Find Connections"  
**Usage:** Run on any markdown file  
**Purpose:** Discover relationships between notes and concepts

**Features:**
- Identifies conceptual relationships
- Suggests note cross-references
- Finds thematic patterns
- Generates exploration questions

**Example Output:**
```markdown
## Discovered Connections

### Related Notes
- [[Machine Learning Basics]] - Shares foundation concepts
- [[Data Science Workflow]] - Similar methodology

### Conceptual Links
- **Pattern Recognition**: Both topics involve identifying patterns
- **Automation**: Common theme of reducing manual work

### Exploration Questions
- How do these methodologies complement each other?
- What are the overlapping tools and techniques?
```

### ⚠️ Therapist Mode
**Status:** Disabled by default (privacy)  
**Command:** "Therapist Mode (Reflection)"  
**Usage:** Run on personal writing or journaling  
**Purpose:** Reflective journaling assistance and emotional processing

**Why Disabled by Default:**
- Contains personal/sensitive content
- Requires explicit user consent
- Best for private journaling

**To Enable:**
1. Settings → Triple-Crown → Actions
2. Toggle "Therapist Mode" ON
3. Confirm you understand this will send personal content to Claude

**Features:**
- Compassionate, non-judgmental responses
- Reflective questions for deeper exploration
- Emotional validation and support
- Privacy-focused approach

**Example Output:**
```markdown
---
## Reflection - 2024-01-15, 2:30 PM

### Reflection
I hear that you're processing some challenging emotions about work transitions. It's completely natural to feel uncertain when facing change, especially when it involves your career path.

### Gentle Insights
There seems to be a pattern of seeking certainty in uncertain situations. The tension between wanting security and desiring growth is very common in career transitions.

### Exploratory Questions
- What aspects of this transition feel most scary, and what feels most exciting?
- When you imagine yourself a year from now, what would make you feel proud of this decision?
- What would you tell a close friend who was facing this same situation?

### Affirmation
Your willingness to reflect deeply on this decision shows wisdom and self-awareness. Trust in your ability to navigate this transition thoughtfully.
---
```

### ✅ Code Reviewer
**Status:** Enabled by default  
**Command:** "Review Code"  
**Usage:** Select code block, then run command  
**Purpose:** Technical code review focusing on security and best practices

**Features:**
- Security vulnerability detection
- Performance optimization suggestions
- Best practice recommendations
- Language-specific analysis

**Supported Languages:**
- JavaScript/TypeScript
- Python
- Java
- C/C++
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin

**Example Output:**
```markdown
---
## Code Review - 2024-01-15, 2:30 PM

### Summary
The function handles user input correctly but could benefit from additional input validation and error handling improvements.

### Issues Found

**🔴 Critical Issues**
- Line 15: SQL injection vulnerability - user input not sanitized
- Line 23: No error handling for database connection failure

**🟡 Improvements**
- Consider using prepared statements for database queries
- Add input validation for email format
- Implement proper logging for debugging

**🟢 Minor Suggestions**
- Variable naming could be more descriptive (e.g., `userData` instead of `data`)
- Add JSDoc comments for better documentation

### Positive Aspects
- Good separation of concerns
- Clean function structure
- Appropriate use of async/await

### Recommendations
1. **Priority 1**: Fix SQL injection vulnerability
2. **Priority 2**: Add comprehensive error handling
3. **Priority 3**: Improve documentation and naming
---
```

### ✅ Peer Reviewer
**Status:** Enabled by default  
**Command:** "Academic Peer Review"  
**Usage:** Run on research papers or academic writing  
**Purpose:** Academic peer review for scholarly content

**Features:**
- Methodological analysis
- Literature review assessment
- Clarity and organization feedback
- Academic rigor evaluation

**Document Types Supported:**
- Research papers
- Literature reviews
- Thesis chapters
- Conference papers
- Research proposals

**Example Output:**
```markdown
---
## Peer Review - 2024-01-15, 2:30 PM

### Summary
This paper presents a novel approach to machine learning interpretability with solid experimental design. The contribution is significant and the writing is generally clear, though some methodological details need clarification.

### Strengths
- Novel algorithmic approach with clear theoretical foundation
- Comprehensive experimental evaluation across multiple datasets
- Well-structured literature review covering recent developments
- Clear practical implications for the field

### Areas for Improvement

**Major Issues**
- Section 3.2: Statistical significance testing not reported for performance comparisons
- Missing details about hyperparameter selection methodology
- Limited discussion of computational complexity and scalability

**Minor Issues**
- Table 2: Caption could be more descriptive
- Several recent papers on interpretability should be cited (see suggestions below)
- Figure 3: Axes labels are too small to read clearly

### Specific Comments
- Page 5, Line 12: The claim about "unprecedented accuracy" needs supporting evidence
- Section 4.1: Consider adding a baseline comparison with simpler methods
- Conclusion: Mention limitations and future work directions

### Recommendation
**Minor Revisions** - The paper is fundamentally sound but needs addressing the methodological gaps and improving clarity in key sections.

### Additional Suggestions
- Consider submitting to Journal of Machine Learning Research
- Future work could explore applications to other domains
- Code availability would enhance reproducibility
---
```

## 🔧 Enabling Disabled Actions

### Method 1: Plugin Settings (Recommended)
1. Open Obsidian Settings (`Ctrl/Cmd + ,`)
2. Navigate to **Community Plugins**
3. Find **Triple-Crown** in the list
4. Click the gear icon to open plugin settings
5. Scroll to **Actions** section
6. Find the disabled action (will show toggle in OFF position)
7. Click the toggle to enable

### Method 2: Folder Configuration
Create or edit `.claude/config.json` in any folder:

```json
{
  "actions": {
    "enabled": ["writing-assistant", "tag-builder", "therapist-mode"],
    "disabled": []
  }
}
```

### Special Considerations for Therapist Mode

**Why It's Disabled:**
- Processes personal and potentially sensitive content
- Requires explicit user consent
- Best used for private journaling and reflection

**Before Enabling:**
1. Understand that your personal writing will be sent to Claude API
2. Ensure you're comfortable with this level of data sharing
3. Consider using it only in private vaults
4. Review your Anthropic account's data handling policies

**Safe Usage Tips:**
- Use in dedicated journaling notes
- Avoid including real names or identifying information
- Focus on emotions and thoughts rather than specific events
- Remember that Claude is an AI, not a licensed therapist

## 🎨 Custom Actions

### Creating Your First Custom Action

1. **Open Settings**
   - Settings → Community Plugins → Triple-Crown
   - Scroll to "Custom Actions" section

2. **Click "Add Custom Action"**

3. **Fill the Form:**
   - **Name**: "Grammar Check" (example)
   - **Description**: "Fix grammar and improve clarity"
   - **Category**: Writing
   - **Requires Selection**: ✅ (for this example)
   - **System Prompt**: See example below

4. **System Prompt Example:**
```
You are a professional editor specialized in grammar and clarity.

TASK: Fix grammatical errors, improve sentence structure, and enhance clarity while preserving the author's voice and intent.

GUIDELINES:
- Correct spelling, grammar, and punctuation errors
- Improve sentence flow and readability
- Suggest better word choices when appropriate
- Maintain the original tone and style
- Fix passive voice where active voice would be stronger

OUTPUT FORMAT:
Return the corrected text, followed by:

## Changes Made
- Brief summary of major corrections
- Explanation of any significant structural changes
```

5. **Save and Test**
   - Click "Create Action"
   - Restart Obsidian (required for new commands)
   - Test via Command Palette: search for "Grammar Check"

### Advanced Custom Action Examples

#### 📝 Meeting Minutes Formatter
```
You are an executive assistant who formats meeting notes into professional minutes.

INPUT: Raw meeting notes (informal, possibly incomplete)
OUTPUT: Structured, professional meeting minutes

FORMAT:
# Meeting Minutes - [Date]

**Attendees:** [List]
**Duration:** [Time]
**Location/Platform:** [Details]

## Agenda Items Discussed
1. [Item with key points and decisions]
2. [Item with key points and decisions]

## Decisions Made
- [Decision 1 with rationale]
- [Decision 2 with rationale]

## Action Items
| Task | Assigned To | Due Date | Status |
|------|-------------|----------|---------|
| [Task] | [Person] | [Date] | Pending |

## Next Meeting
**Date:** [Date]
**Agenda:** [Preview of topics]

## Notes
[Additional context or important discussion points]
```

#### 🔍 Research Synthesis
```
You are a research analyst who synthesizes information from multiple sources.

TASK: Analyze the provided content and create a comprehensive synthesis that identifies:
1. Key themes and patterns
2. Contradictions or disagreements
3. Knowledge gaps
4. Research implications

ANALYSIS APPROACH:
- Identify recurring concepts across sources
- Note methodological differences
- Highlight conflicting findings
- Suggest areas for further investigation

OUTPUT FORMAT:
# Research Synthesis

## Overview
[Brief summary of scope and sources]

## Key Themes
### Theme 1: [Name]
- [Supporting evidence from sources]
- [Relevant findings]

### Theme 2: [Name]
- [Supporting evidence from sources]
- [Relevant findings]

## Contradictions & Debates
- [Area of disagreement]
  - Position A: [Evidence]
  - Position B: [Evidence]
  - Possible explanations: [Analysis]

## Knowledge Gaps
1. [Gap 1 with explanation]
2. [Gap 2 with explanation]

## Research Implications
- [Implication for theory]
- [Implication for practice]
- [Suggested next steps]

## Sources Integration Matrix
[Summary table showing how sources relate to each theme]
```

#### 📊 Data Story Creator
```
You are a data storytelling expert who transforms raw data and analysis into compelling narratives.

TASK: Take data findings and create a narrative that makes the insights accessible and actionable for non-technical audiences.

STORYTELLING PRINCIPLES:
- Start with the most important insight
- Use clear, jargon-free language
- Include context for why the data matters
- Provide actionable recommendations
- Structure information logically

OUTPUT FORMAT:
# [Compelling Title Based on Key Finding]

## The Story in Numbers
**Key Finding:** [One-sentence summary of most important insight]
**Impact:** [Why this matters to the audience]

## Background
[Context: What question were we trying to answer?]

## What We Discovered
### 📈 The Main Story
[Primary insight with supporting data]

### 🔍 Supporting Details
- [Finding 1 with context]
- [Finding 2 with context]
- [Finding 3 with context]

### ⚠️ Important Caveats
[Limitations, confidence levels, what the data doesn't tell us]

## What This Means
### For [Stakeholder Group 1]
- [Specific implication]
- [Recommended action]

### For [Stakeholder Group 2]
- [Specific implication]
- [Recommended action]

## Next Steps
1. [Immediate action based on findings]
2. [Medium-term strategy adjustment]
3. [Future research/monitoring needed]

## The Bottom Line
[One clear sentence summarizing the most important takeaway]
```

### Custom Action Categories

**📝 Writing**
- Grammar and style checkers
- Tone adjusters
- Format converters
- Content expanders

**🔍 Analysis**
- Data interpreters
- Research synthesizers
- Pattern identifiers
- Trend analyzers

**📋 Organization**
- Note structurers
- Index creators
- Category organizers
- Link builders

**👥 Review**
- Peer reviewers
- Quality checkers
- Feedback generators
- Improvement suggesters

**🎯 Custom**
- Domain-specific tools
- Personal workflows
- Specialized formats
- Unique use cases

## 💡 Best Practices

### Prompt Engineering for Actions

#### 1. Define the Role Clearly
```
You are a [specific role] who [specific expertise].
```
Good: "You are a technical writer who specializes in API documentation."
Bad: "You are helpful."

#### 2. Specify the Task
```
TASK: [Exact action to perform]
```
Good: "TASK: Convert informal notes into professional email format."
Bad: "Make this better."

#### 3. Provide Guidelines
```
GUIDELINES:
- [Specific rule 1]
- [Specific rule 2]
- [Specific rule 3]
```

#### 4. Define Output Format
```
OUTPUT FORMAT:
[Exact structure with examples]
```

#### 5. Include Examples When Helpful
```
EXAMPLE INPUT:
[Sample input]

EXAMPLE OUTPUT:
[Expected output]
```

### Action Design Principles

#### Specificity Over Generality
- ✅ "Convert bullet points to paragraph form"
- ❌ "Make this better"

#### Clear Boundaries
- ✅ "Focus only on grammar, preserve all content"
- ❌ "Improve this text"

#### Consistent Output
- ✅ Always use the same format structure
- ❌ Vary format based on content

#### User Control
- ✅ "Suggest changes, preserve original meaning"
- ❌ "Rewrite completely"

### Testing Your Custom Actions

1. **Start Simple**: Test with basic content first
2. **Edge Cases**: Try empty content, very short/long content
3. **Different Contexts**: Test in various types of documents
4. **Iterate**: Refine prompts based on results
5. **Document**: Note what works and what doesn't

## 🔧 Troubleshooting

### Common Issues

#### Action Not Appearing in Command Palette
**Cause**: New custom actions require plugin reload
**Solution**: Restart Obsidian or reload the plugin

#### Action Fails with Error
**Possible Causes**:
- Invalid API key
- Network connectivity issues
- Malformed system prompt

**Solutions**:
1. Check API key in settings
2. Verify internet connection
3. Review system prompt for syntax errors
4. Check plugin console for error details

#### Poor Action Results
**Possible Causes**:
- Vague system prompt
- Insufficient context
- Wrong action for the task

**Solutions**:
1. Make system prompt more specific
2. Provide clearer output format requirements
3. Test with different content types
4. Review successful action examples

#### Custom Action Not Saving
**Cause**: Usually validation errors
**Solution**: Ensure all required fields are filled:
- Action name (unique)
- Description
- System prompt (not empty)

### Getting Help

1. **Check Console**: Press F12 → Console tab for error messages
2. **Review Settings**: Verify API configuration
3. **Test Built-in Actions**: Confirm basic functionality works
4. **GitHub Issues**: Report bugs with detailed steps to reproduce

### Performance Tips

1. **Shorter Prompts**: More efficient processing
2. **Specific Requirements**: Reduces back-and-forth
3. **Batch Similar Tasks**: Use actions on multiple files efficiently
4. **Monitor Usage**: Be aware of API costs and rate limits

## 📚 Additional Resources

- [Claude API Documentation](https://docs.anthropic.com/)
- [Obsidian Plugin Development](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

**Need Help?** Open an issue on [GitHub](https://github.com/AKSDug/Triple-Crown/issues) with:
- Steps to reproduce the problem
- Expected vs actual behavior  
- Console error messages (if any)
- Action configuration details