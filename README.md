# Triple-Crown

> **"A hat to wear on the hat of Obsidian - a brain for your second brain"**

Triple-Crown brings intelligent AI assistance to your knowledge management system. Just as a crown sits atop one's head, Triple-Crown sits atop Obsidian, enhancing your thinking with Claude's capabilities while respecting the sanctity of your personal knowledge vault.

## Philosophy

Obsidian is your second brain - a place where your thoughts, ideas, and knowledge interconnect and grow. Triple-Crown adds a layer of intelligence on top of this, providing:

- **Contextual Understanding**: Claude understands your vault's structure and content
- **Intelligent Assistance**: From writing improvement to research organization  
- **Respectful Integration**: Your vault remains yours - we enhance, never replace
- **Ecosystem Awareness**: Works with your existing plugins and workflows

And we accidentally created something more - a general-purpose terminal interface that extends beyond just Claude, opening possibilities for development tools, research assistants, and sandboxed execution within your knowledge workspace.

## Features

### 🎯 Core Features
- **Multi-Modal Connection**: API, Claude-Code CLI, or hybrid mode support
- **Enhanced Terminal**: Interactive Claude sessions with development tools and sandboxed execution
- **Plugin Ecosystem Integration**: Automatic detection and integration with Dataview, Templater, Citations, and more
- **Research Assistant**: Advanced source aggregation, link trees, and research organization
- **Writing Suite**: Comprehensive writing assistance with 7 specialized actions
- **Context Awareness**: Intelligent file context and .claude folder configuration

### ✨ Signature Feature: Duplicate & Edit
- Creates timestamped copies: `filename-claude-edit-YYYY-MM-DD.md`
- Shows changes inline: ~~strikethrough~~ deletions, **bold** additions
- Adds Claude's reasoning in blockquotes
- Maintains bidirectional links between original and edited versions
- Never modifies originals - completely non-destructive

### 🎬 Available Actions
- **writing-assistant**: Improve, expand, or simplify text ✅ *enabled by default*
- **tag-builder**: Generate smart tags for content ✅ *enabled by default*
- **connection-finder**: Discover note relationships ✅ *enabled by default*
- **research-assistant**: Aggregate sources and create link trees ✅ *enabled by default*
- **code-reviewer**: Technical code review with security focus ✅ *enabled by default*
- **peer-reviewer**: Academic peer review for scholarly writing ✅ *enabled by default*
- **therapist-mode**: Reflective journaling assistance ⚠️ *disabled by default for privacy*
- **custom-actions**: Create unlimited actions with custom prompts 🎯 *user-defined*

### 🔌 Connection Modes
- **API Mode**: Direct Anthropic API integration (requires API key)
- **CLI Mode**: Claude-Code CLI for Pro/Max subscribers (no API key needed)
- **Hybrid Mode**: CLI preferred with API fallback for maximum reliability

### 🧩 Plugin Integrations (Claude Awareness)
Triple-Crown makes Claude aware of your installed plugins, enabling enhanced assistance:
- **Dataview**: Claude can generate complex queries and help analyze your vault data
- **Templater**: Claude creates dynamic templates with proper Templater syntax
- **Citations**: Claude formats academic citations and manages bibliographies
- **Calendar**: Claude understands your temporal organization and daily notes
- **Kanban**: Claude helps organize tasks and suggests workflow improvements
- **Canvas**: Claude can suggest visual connections and mind map structures

*Claude sees what plugins you have and adapts its responses accordingly!*

### 🖥️ The Accidental Terminal
What started as a simple Claude interface evolved into something more powerful:
- **General Purpose Terminal**: Execute various commands beyond just Claude
- **Development Tools**: Code analysis, formatting, and sandboxed execution
- **Research Commands**: Advanced search, source management, and analysis
- **Vault Analysis**: Understand your knowledge structure and patterns
- **Extensible Architecture**: Add your own commands and tools

This wasn't planned - it emerged naturally from the desire to make Triple-Crown a true enhancement layer for Obsidian.

### 📝 Progressive Context (CLAUDE.md)
Triple-Crown automatically maintains a `CLAUDE.md` file in your vault root that:
- **Tracks your vault statistics** and recent activity
- **Lists installed plugins** that Claude can leverage
- **Understands your projects** and writing patterns
- **Updates automatically** to keep Claude current with your work
- **Respects privacy** while providing useful context

This gives Claude immediate understanding of your vault structure and capabilities every session!

## Installation

1. Download the plugin files
2. Place in your Obsidian plugins folder: `~/.obsidian/plugins/triple-crown/`
3. Enable the plugin in Obsidian settings
4. Configure your Anthropic API key in the plugin settings

## Configuration

### Connection Settings
- **Connection Mode**: Choose API, CLI, or Hybrid mode
- **API Key**: Your Anthropic API key (required for API mode)
- **CLI Path**: Path to claude-code executable (for CLI mode)
- **Fallback Settings**: API fallback configuration for hybrid mode

### Feature Settings
- **Auto-save duplicates**: Automatically save duplicate & edit results
- **Show inline changes**: Display strikethrough deletions and bold additions
- **Include reasoning**: Add Claude's reasoning in blockquotes

### Enhanced Terminal
- **General Tools**: Enable development and analysis tools beyond Claude
- **Sandboxed Execution**: Allow safe code execution with confirmation
- **Plugin Integration**: Automatic detection of other Obsidian plugins

### Folder-Level Configuration
Create `.claude/config.json` in any folder:

```json
{
  "permissions": {
    "scope": "folder",
    "allowedPaths": ["**/*.md"],
    "deniedPaths": ["**/private/**"]
  },
  "actions": {
    "enabled": ["writing-assistant", "tag-builder"],
    "disabled": ["therapist-mode"]
  },
  "privacy": {
    "neverShare": ["*password*", "*secret*"],
    "requireConfirmation": true
  }
}
```

## Usage

### Terminal Interface
1. Click the terminal icon in the ribbon
2. Use commands like `/help`, `/context`, `/config`
3. Ask questions directly or use system commands
4. Navigate command history with arrow keys

### Writing Assistant
1. Select text or place cursor in document
2. Use Command Palette: "Writing Assistant"
3. Or use keyboard shortcut (configurable)
4. Choose from improve, expand, simplify, or summarize

### Duplicate & Edit
1. Open any document
2. Use Command Palette: "Duplicate & Edit"
3. Claude creates an improved version in a new file
4. Original file gets automatic backlink to edited version

## 🎯 Action Management

### Enabling/Disabling Actions

#### Method 1: Plugin Settings (Recommended)
1. Go to **Settings** → **Community Plugins** → **Triple-Crown**
2. Scroll to the **Actions** section
3. Toggle any action on/off:
   - ✅ **Writing Assistant** - AI-powered writing assistance and editing
   - ✅ **Tag Builder** - Automatically generate relevant tags for your content
   - ✅ **Connection Finder** - Discover relationships between notes and concepts
   - ⚠️ **Therapist Mode** - Reflective journaling assistant (*disabled by default for privacy*)
   - ✅ **Code Reviewer** - Technical code review focusing on security and best practices
   - ✅ **Peer Reviewer** - Academic peer review for research papers and scholarly writing

#### Method 2: Command Palette Access
Once enabled, all actions are available via Command Palette (`Ctrl/Cmd + P`):
- "Generate Tags" - Analyzes content and suggests relevant tags
- "Find Connections" - Discovers relationships and cross-references
- "Therapist Mode (Reflection)" - Provides reflective insights and questions
- "Review Code" - Analyzes selected code for security and best practices
- "Academic Peer Review" - Provides scholarly review of research content

### 📝 Custom Actions

Create unlimited custom actions with your own prompts and behaviors.

#### Creating a Custom Action
1. Go to **Settings** → **Community Plugins** → **Triple-Crown**
2. Scroll to **Custom Actions** section
3. Click **"Add Custom Action"**
4. Fill out the form:
   - **Action Name**: Display name (e.g., "Grammar Check")
   - **Description**: Brief explanation of what it does
   - **Category**: Choose from Writing, Analysis, Organization, Review, or Custom
   - **Requires Selection**: Toggle if action needs selected text
   - **System Prompt**: Define how Claude should behave for this action

#### Custom Action Examples

**Grammar & Style Checker:**
```
You are a professional editor focused on grammar, style, and clarity.

GUIDELINES:
- Fix grammatical errors and typos
- Improve sentence structure and flow
- Suggest better word choices
- Maintain the author's voice and tone
- Provide brief explanations for major changes

OUTPUT FORMAT:
Return the corrected text followed by a brief summary of changes made.
```

**Meeting Notes Summarizer:**
```
You are an executive assistant who creates concise meeting summaries.

TASK:
- Identify key decisions and action items
- List attendees and their main contributions
- Highlight next steps and deadlines
- Format as structured summary

OUTPUT FORMAT:
## Meeting Summary
**Date:** [date]
**Attendees:** [list]

### Key Decisions
- [decision points]

### Action Items
- [who] - [what] - [when]

### Next Meeting
[date and agenda items]
```

**Research Paper Outline Generator:**
```
You are an academic writing specialist who creates structured research outlines.

ANALYSIS:
- Identify the main research question or thesis
- Suggest logical section organization
- Recommend evidence and citation strategies
- Ensure academic rigor and clarity

OUTPUT FORMAT:
# [Paper Title]

## I. Introduction
- Hook and context
- Literature gap
- Research question
- Thesis statement

## II. Literature Review
[sections based on themes]

## III. Methodology
[research approach]

## IV. Analysis
[main arguments with evidence]

## V. Conclusion
- Summary of findings
- Implications
- Future research
```

#### Managing Custom Actions
- **Enable/Disable**: Toggle any custom action on/off
- **Delete**: Remove custom actions you no longer need
- **Edit**: Currently requires deleting and recreating (improvement planned)

#### Custom Action Tips
1. **Be Specific**: Clear prompts produce better results
2. **Define Output Format**: Tell Claude exactly how to structure responses
3. **Set Context**: Explain the role Claude should take
4. **Test Iteratively**: Refine prompts based on results
5. **Use Categories**: Organize actions for easy discovery

#### Custom Action Limitations
- **Plugin Reload Required**: New actions require restarting Obsidian to register commands
- **Markdown Only**: Custom actions currently work only with `.md` files
- **No Dynamic Updates**: Prompt changes require creating a new action

### Action Security Notes
- All actions respect vault boundary protection
- Actions cannot access files outside your Obsidian vault
- Custom prompts are stored locally in plugin settings
- No custom action data is sent to external services beyond the Claude API call

### 📖 Complete Actions Documentation
For detailed guides, examples, and troubleshooting, see **[ACTIONS-GUIDE.md](ACTIONS-GUIDE.md)**:
- Step-by-step enabling instructions
- 20+ custom action examples
- Prompt engineering best practices
- Troubleshooting common issues
- Performance optimization tips

## Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Testing
```bash
# Link to Obsidian plugins folder
ln -s $(pwd) ~/.obsidian/plugins/triple-crown
```

## Requirements

- Obsidian 0.15.0 or higher
- Anthropic API key (get one at https://console.anthropic.com)
- Desktop only (mobile support planned)

## 🔒 Security & Privacy

Triple-Crown is designed with security in mind:

### Vault Boundary Protection
- **File Access**: Claude can ONLY access files within your current Obsidian vault
- **No System Access**: Cannot browse your computer or access files outside the vault
- **Path Validation**: All file operations are validated to prevent directory traversal
- **Hidden File Protection**: Blocks access to .obsidian config and other hidden files (except .claude)

### Privacy Features
- **Local Processing**: All file operations happen locally within Obsidian
- **Web Search Only**: When requested, Claude can access web content but no local system data
- **Configuration Respect**: Honors .claude folder privacy settings
- **Size Limits**: File access limited to reasonable sizes (10MB default)

### What Claude CAN Do
- ✅ Read and analyze files within your vault
- ✅ Create new files within your vault
- ✅ Search the web when specifically requested
- ✅ Improve and edit your documents
- ✅ Respect your privacy configurations

### What Claude CANNOT Do
- ❌ Access files outside your vault directory
- ❌ Browse your computer or file system
- ❌ Access other applications or processes
- ❌ Read system configuration files
- ❌ Explore your personal directories

## License

**GPL v3 - Free & Open Source Software**

This project is licensed under the GNU General Public License v3.0.

### ✅ What You CAN Do (FREE)
- **Use anywhere**: Personal, business, commercial, enterprise - completely free
- **Modify the code**: Change, improve, and customize the plugin
- **Redistribute**: Share copies with others
- **Commercial use**: Use in business operations without any fees
- **Study the source**: Learn from and analyze the code

### 📋 GPL v3 Requirements
If you distribute this software (original or modified):
- **Include the license**: Keep the GPL v3 license with any copies
- **Share source code**: Make source code available for distributed versions
- **Same license**: Any modifications must also be GPL v3
- **Document changes**: Note what you've modified

### 🚀 Why GPL v3?
- **Business-friendly**: Free commercial use with no licensing fees
- **Community-driven**: Improvements benefit everyone
- **Code protection**: Prevents proprietary forks that don't share improvements
- **Patent protection**: Includes patent protection clauses

### 💡 Simple Summary
- **Use it freely** for any purpose including commercial
- **If you share it**, you must share the source code too
- **If you improve it**, please share your improvements

See the [LICENSE](LICENSE) file for complete terms.

## Support

- Report issues on GitHub
- Review .claude/config.json for configuration examples