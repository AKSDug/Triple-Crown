# Action Guide

Complete guide to all Triple-Crown actions - from built-in tools to custom creations.

## 🎯 Quick Reference

| Action | Status | Purpose | Selection Required |
|--------|---------|---------|-------------------|
| **Writing Assistant** | ✅ Enabled | Improve, expand, simplify text | Optional |
| **Tag Builder** | ✅ Enabled | Generate relevant tags | No |
| **Connection Finder** | ✅ Enabled | Discover note relationships | No |
| **Therapist Mode** | ⚠️ Disabled | Reflective journaling | No |
| **Code Reviewer** | ✅ Enabled | Technical code analysis | Yes |
| **Peer Reviewer** | ✅ Enabled | Academic paper review | No |
| **Custom Actions** | 🎯 User-defined | Unlimited possibilities | Configurable |

## ✍️ Writing Assistant

**Purpose**: AI-powered writing improvement and assistance  
**Command**: "Writing Assistant"  
**Status**: ✅ Enabled by default

### How It Works

1. **Select text** (or place cursor for whole document)
2. **Run "Writing Assistant"** from Command Palette
3. **Choose improvement type**:
   - **Improve**: Enhance clarity, grammar, flow
   - **Expand**: Add detail, examples, depth
   - **Simplify**: Reduce complexity, increase clarity
   - **Summarize**: Create concise overview

### Example Transformations

**Original:**
```
The meeting went okay I guess but there were some issues with the presentation 
and people seemed confused about the next steps.
```

**After "Improve":**
```
The meeting had mixed results. While the core content was delivered, the 
presentation faced several challenges that left attendees unclear about 
next steps. We should clarify action items and timeline in a follow-up email.
```

**After "Expand":**
```
The meeting had mixed results overall. While we successfully covered the main 
agenda items and delivered the core content, several challenges emerged during 
the presentation phase. Technical difficulties with the slides disrupted the 
flow, and the Q&A session revealed that key concepts weren't clearly 
communicated. Many attendees expressed confusion about next steps, timeline, 
and individual responsibilities. 

Recommended follow-up actions:
- Send clarifying email with action items
- Schedule brief check-in meeting
- Revise presentation materials for clarity
```

### Best Practices

- **Be specific**: "Improve tone for academic audience" vs "improve this"
- **Use context**: Claude considers your vault's writing style
- **Iterate**: Use multiple improvements for complex revisions
- **Review changes**: Always review suggestions before accepting

## 🏷️ Tag Builder

**Purpose**: Automatically generate relevant tags based on content analysis  
**Command**: "Generate Tags"  
**Status**: ✅ Enabled by default

### How It Works

1. **Open any markdown document**
2. **Run "Generate Tags"** from Command Palette
3. **Claude analyzes content** for themes, topics, concepts
4. **Tags added** to frontmatter or inline

### Example Output

**Input document about machine learning:**
```markdown
# Understanding Neural Networks

Neural networks are computational models inspired by biological neural networks...
```

**Generated tags:**
```yaml
---
tags: ["machine-learning", "neural-networks", "artificial-intelligence", "deep-learning", "computational-models"]
---
```

### Tag Features

- **Smart analysis**: Identifies themes, not just keywords
- **Consistent format**: Lowercase, hyphenated style
- **Appropriate quantity**: 3-8 relevant tags
- **Frontmatter integration**: Adds to existing tag structure
- **Vault awareness**: Considers existing tag patterns

### Configuration

Control tag generation in settings:
```json
{
  "tagBuilder": {
    "maxTags": 8,
    "minTags": 3,
    "format": "hyphenated",
    "location": "frontmatter"
  }
}
```

## 🔗 Connection Finder

**Purpose**: Discover relationships and connections between notes and concepts  
**Command**: "Find Connections"  
**Status**: ✅ Enabled by default

### How It Works

1. **Open document** to analyze
2. **Run "Find Connections"** from Command Palette
3. **Claude analyzes** content for relationships
4. **Connections appended** to document

### Example Output

```markdown
## Discovered Connections

### Related Notes
- [[Machine Learning Basics]] - Shares foundation concepts with current discussion
- [[Data Science Workflow]] - Similar methodology and tools mentioned
- [[Python Programming]] - Implementation language referenced throughout

### Conceptual Links
- **Pattern Recognition**: Both current topic and [[Computer Vision]] involve pattern detection
- **Automation**: Common theme with [[Workflow Optimization]] and [[Task Management]]
- **Data Processing**: Connects to [[Database Design]] and [[ETL Processes]]

### Exploration Questions
- How do these machine learning concepts apply to your existing data science projects?
- What connections exist between these techniques and your workflow automation notes?
- Which tools mentioned here could enhance your current Python development setup?
```

### Connection Types

**Direct Links**
- References to existing notes
- Shared topics and themes
- Common methodologies

**Conceptual Relationships**
- Abstract pattern connections
- Thematic similarities
- Complementary concepts

**Exploration Opportunities**
- Questions for further investigation
- Potential research directions
- Knowledge gaps to explore

### Vault Integration

- **Scans existing notes** for relevant connections
- **Respects privacy settings** (won't scan excluded folders)
- **Suggests realistic links** based on actual vault content
- **Creates actionable insights** for knowledge development

## 🧠 Therapist Mode

**Purpose**: Reflective journaling assistant for self-exploration and emotional processing  
**Command**: "Therapist Mode (Reflection)"  
**Status**: ⚠️ Disabled by default for privacy

### ⚠️ Privacy Notice

**Why Disabled by Default:**
- Processes personal and potentially sensitive content
- Requires explicit user consent for sharing personal thoughts
- Best used for private journaling and reflection
- Claude AI is not a licensed therapist

### Enabling Therapist Mode

**To Enable:**
1. **Settings** → **Community Plugins** → **Triple-Crown**
2. **Actions section** → Toggle **"Therapist Mode"** ON
3. **Consider privacy**: Only enable if comfortable sharing personal content with Claude API

### How It Works

1. **Write personal thoughts, experiences, or feelings**
2. **Run "Therapist Mode"** from Command Palette
3. **Receive compassionate, reflective response**
4. **Continue journaling** with insights and questions

### Example Session

**Your input:**
```
I've been feeling really overwhelmed at work lately. There's so much to do 
and I feel like I'm not making progress on anything important. I keep second-
guessing my decisions and wondering if I'm in the right role.
```

**Claude's response:**
```markdown
---
## Reflection - 2024-01-15, 2:30 PM

### Reflection
I hear that you're experiencing significant overwhelm at work, which sounds 
really challenging. The feeling of not making progress despite being busy, 
combined with self-doubt about your decisions and role, creates a difficult 
emotional space to navigate.

### Gentle Insights
There seems to be a disconnect between being busy and feeling productive - 
this often happens when we're caught in reactive mode rather than intentional 
action. The self-doubt you're experiencing might be both a symptom of the 
overwhelm and a contributor to it.

### Exploratory Questions
- When you think about "important" progress, what would that look like specifically?
- What were you feeling most confident about in your role before this overwhelm started?
- If a trusted friend came to you with this exact situation, what gentle advice would you offer them?

### Affirmation
Your awareness of these feelings and willingness to reflect on them shows emotional intelligence and self-care. Sometimes the path forward becomes clearer when we pause to process rather than pushing through.
---
```

### Therapeutic Approach

**Compassionate Listening**
- Non-judgmental acknowledgment
- Validation of emotions
- Empathetic understanding

**Gentle Insights**
- Pattern observations
- Gentle reframing
- Emotional validation

**Reflective Questions**
- Open-ended exploration
- Self-discovery prompts
- Alternative perspectives

**Supportive Affirmations**
- Strength recognition
- Growth acknowledgment
- Encouragement

### Safe Usage Guidelines

1. **Private vaults only**: Don't use in shared or work vaults
2. **Avoid real names**: Use initials or generic terms for privacy
3. **Focus on feelings**: Emphasize emotions over specific events
4. **Remember limitations**: Claude is AI, not a licensed therapist
5. **Seek professional help**: For serious mental health concerns

### Configuration for Privacy

```json
{
  "therapistMode": {
    "requireConfirmation": true,
    "logInteractions": false,
    "privateMode": true,
    "neverShare": ["*name*", "*address*", "*phone*"]
  }
}
```

## 💻 Code Reviewer

**Purpose**: Technical code review focusing on security, performance, and best practices  
**Command**: "Review Code"  
**Status**: ✅ Enabled by default

### How It Works

1. **Select code block** in your document
2. **Run "Review Code"** from Command Palette
3. **Claude analyzes** for security, performance, best practices
4. **Detailed review** appended to document

### Supported Languages

- **JavaScript/TypeScript** - Frontend and Node.js
- **Python** - Scripts, web apps, data science
- **Java** - Enterprise applications
- **C/C++** - System programming
- **Go** - Microservices and CLI tools
- **Rust** - System programming
- **PHP** - Web development
- **Ruby** - Web applications
- **Swift** - iOS/macOS development
- **Kotlin** - Android/JVM development

### Example Review

**Input code:**
```javascript
function processUserData(userData) {
    var sql = "SELECT * FROM users WHERE id = " + userData.id;
    db.query(sql, function(err, result) {
        if (result) {
            return result[0];
        }
    });
}
```

**Generated review:**
```markdown
---
## Code Review - 2024-01-15, 2:30 PM

### Summary
This function has a critical SQL injection vulnerability and lacks proper error handling. The core functionality is sound but requires immediate security fixes.

### Issues Found

**🔴 Critical Issues**
- **Line 2**: SQL injection vulnerability - user input concatenated directly into query
- **Line 3**: No error handling for database failures
- **Line 4**: Function doesn't return anything due to async callback

**🟡 Improvements**
- Use prepared statements or parameterized queries
- Implement proper error handling and logging
- Convert to Promise/async-await for better control flow
- Add input validation for userData.id

**🟢 Minor Suggestions**
- Use `const` instead of `var` for sql variable
- Add JSDoc comments for function documentation
- Consider adding timeout handling for database queries

### Positive Aspects
- Clear function naming
- Simple, focused functionality
- Readable code structure

### Recommendations

**Priority 1: Security Fix**
```javascript
async function processUserData(userData) {
    try {
        const query = 'SELECT * FROM users WHERE id = ?';
        const result = await db.query(query, [userData.id]);
        return result[0] || null;
    } catch (error) {
        console.error('Database query failed:', error);
        throw new Error('Failed to process user data');
    }
}
```

**Priority 2: Add Input Validation**
```javascript
if (!userData || !userData.id || typeof userData.id !== 'number') {
    throw new Error('Invalid user data provided');
}
```
---
```

### Review Focus Areas

**Security Analysis**
- SQL injection vulnerabilities
- XSS prevention
- Authentication/authorization issues
- Input validation gaps
- Data exposure risks

**Performance Review**
- Algorithm efficiency
- Memory usage optimization
- Database query optimization
- Caching opportunities
- Scalability concerns

**Best Practices**
- Code organization
- Error handling patterns
- Documentation quality
- Testing considerations
- Maintainability factors

### Configuration

```json
{
  "codeReviewer": {
    "focusAreas": ["security", "performance", "maintainability"],
    "severityLevels": ["critical", "major", "minor"],
    "includeExamples": true,
    "suggestAlternatives": true
  }
}
```

## 📚 Peer Reviewer

**Purpose**: Academic peer review for research papers, proposals, and scholarly writing  
**Command**: "Academic Peer Review"  
**Status**: ✅ Enabled by default

### How It Works

1. **Open research document** (paper, proposal, thesis chapter)
2. **Run "Academic Peer Review"** from Command Palette
3. **Claude analyzes** methodology, arguments, clarity, rigor
4. **Comprehensive review** appended to document

### Document Types Supported

- **Research Papers** - Full academic papers
- **Literature Reviews** - Systematic and narrative reviews
- **Research Proposals** - Grant applications, thesis proposals
- **Thesis Chapters** - Individual thesis sections
- **Conference Papers** - Short form academic papers
- **Book Chapters** - Academic book contributions

### Example Review

**Input: Research paper excerpt**

**Generated review:**
```markdown
---
## Peer Review - 2024-01-15, 2:30 PM

### Summary
This paper presents a well-designed study on machine learning interpretability with solid experimental methodology. The contribution is significant and timely, though some methodological details need clarification and the discussion could be strengthened.

### Strengths
- **Novel approach**: The proposed interpretability framework addresses a genuine gap in current methods
- **Rigorous methodology**: Experimental design is appropriate with good control variables
- **Comprehensive evaluation**: Testing across multiple datasets strengthens generalizability claims
- **Clear writing**: Paper is well-structured and generally easy to follow
- **Practical relevance**: Results have clear implications for real-world applications

### Areas for Improvement

**Major Issues**
- **Statistical analysis** (Section 4.2): No significance testing reported for performance comparisons between methods
- **Methodology gaps** (Section 3.1): Hyperparameter selection process not described in sufficient detail
- **Scalability discussion**: Limited analysis of computational complexity and scalability to larger datasets
- **Limitations section**: Missing discussion of method limitations and boundary conditions

**Minor Issues**
- **Table 2**: Caption should specify what the baseline methods are
- **Figure 3**: Axis labels are too small and difficult to read
- **References**: Several recent papers on interpretability methods should be cited (Lundberg & Lee 2017, Ribeiro et al. 2018)
- **Abstract**: Could be more specific about the quantitative improvements achieved

### Specific Comments

**Page 5, Line 12**: The claim of "unprecedented accuracy" needs supporting evidence - what specific benchmarks support this claim?

**Section 3.2**: Consider adding comparison with simpler baseline methods to demonstrate the necessity of the proposed complexity.

**Section 4.3**: The user study section would benefit from more details about participant selection criteria and potential biases.

**Conclusion**: Should acknowledge limitations more explicitly and provide specific directions for future work.

### Methodological Assessment

**Research Design**: ✅ Strong - appropriate experimental setup with good controls  
**Data Quality**: ✅ Good - multiple datasets with proper validation splits  
**Statistical Analysis**: ⚠️ Needs improvement - missing significance tests  
**Reproducibility**: ⚠️ Partial - code availability mentioned but hyperparameters unclear  

### Recommendation
**Minor Revisions Required**

The paper makes a solid contribution to the interpretability literature and is generally well-executed. Addressing the statistical analysis gaps and methodological details will significantly strengthen the work. The core findings are sound and the approach is novel enough to warrant publication.

### Suggestions for Revision

1. **Add statistical significance testing** for all performance comparisons
2. **Expand methodology section** with hyperparameter details and selection rationale
3. **Include computational complexity analysis** and scalability discussion
4. **Add explicit limitations section** discussing boundary conditions and failure cases
5. **Strengthen related work** with recent interpretability literature
6. **Improve figure quality** and table captions for clarity

### Future Directions
- Extension to other machine learning domains beyond the current scope
- Investigation of the framework's performance with different types of neural architectures
- User study expansion to include domain experts from different fields
- Development of automated parameter tuning for the interpretability framework

---
```

### Review Criteria

**Originality & Significance**
- Novel contributions to field
- Importance of research question
- Advance over existing work
- Practical/theoretical impact

**Methodology**
- Research design appropriateness
- Data collection methods
- Analysis techniques
- Reproducibility considerations

**Clarity & Organization**
- Structure and flow
- Writing quality
- Figure/table effectiveness
- Logical argument development

**Evidence & Support**
- Data quality and quantity
- Citation completeness
- Argument strength
- Claims justification

**Technical Quality**
- Accuracy of methods
- Statistical rigor
- Experimental design
- Results interpretation

## 🎨 Creating Custom Actions

See the dedicated [Custom Actions](Custom-Actions) page for comprehensive guidance on creating your own AI-powered actions.

## ⚙️ Action Configuration

### Enabling/Disabling Actions

**Global Settings**
1. **Settings** → **Community Plugins** → **Triple-Crown**
2. **Actions section** → Toggle actions on/off

**Folder-Level Control**
```json
{
  "actions": {
    "enabled": ["writing-assistant", "tag-builder"],
    "disabled": ["therapist-mode", "code-reviewer"]
  }
}
```

### Privacy Controls

**Never Share Patterns**
```json
{
  "privacy": {
    "neverShare": [
      "*password*", "*secret*", "*api-key*",
      "*confidential*", "*private*"
    ],
    "requireConfirmation": true
  }
}
```

### Performance Optimization

**Context Limits**
```json
{
  "context": {
    "maxFileSize": 50000,
    "maxContextFiles": 5,
    "includeBacklinks": true
  }
}
```

## 🔧 Troubleshooting Actions

### Common Issues

**Action Not Available**
- Check if action is enabled in settings
- Verify file type compatibility
- Ensure selection requirements are met

**Poor Results**
- Provide more specific context
- Check document quality and clarity
- Try different selection sizes

**Performance Issues**
- Reduce context size limits
- Use faster models (Haiku vs Sonnet)
- Check internet connection stability

### Getting Better Results

1. **Clear prompts**: Be specific about what you want
2. **Good context**: Well-written input produces better output
3. **Appropriate selection**: Select relevant text portions
4. **Iterate**: Use multiple actions for complex tasks
5. **Review**: Always check and refine AI suggestions

---

**Master all actions?**

➡️ **Next**: [Custom Actions](Custom-Actions) - Create unlimited AI tools  
➡️ **Or**: [Configuration](Configuration) - Advanced settings and privacy