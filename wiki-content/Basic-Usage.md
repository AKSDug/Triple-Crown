# Basic Usage

Learn the core features of Triple-Crown and how to use them effectively.

## 🖥️ Terminal Interface

The terminal interface provides direct access to Claude within Obsidian.

### Opening the Terminal

**Method 1: Ribbon Icon**
- Click the **terminal icon** in the left ribbon

**Method 2: Command Palette**
- Press `Ctrl/Cmd + P`
- Search for "Open Claude Terminal"
- Press Enter

### Using the Terminal

1. **Type your questions directly**
   ```
   > What's the difference between correlation and causation?
   ```

2. **Use system commands**
   ```
   > /help        - Show available commands
   > /context     - Show current context
   > /config      - Show configuration
   > /clear       - Clear terminal history
   ```

3. **Navigate history**
   - **Up Arrow**: Previous commands
   - **Down Arrow**: Next commands
   - **Enter**: Execute command

### Terminal Features

- **Persistent sessions**: History maintained across Obsidian restarts
- **Context awareness**: Automatically includes current file context
- **Markdown rendering**: Responses formatted with proper markdown
- **Copy responses**: Right-click to copy Claude's responses

## ✍️ Writing Assistant

The Writing Assistant improves your text with AI-powered suggestions.

### Basic Writing Assistant

1. **Select text** you want to improve (or place cursor for whole document)
2. **Open Command Palette** (`Ctrl/Cmd + P`)
3. **Search for "Writing Assistant"**
4. **Choose improvement type:**
   - **Improve**: General writing enhancement
   - **Expand**: Add detail and depth
   - **Simplify**: Make more concise and clear
   - **Summarize**: Create brief summary

### Example Workflow

**Original text:**
```
The thing is that we need to do better at communicating with our customers because 
it's really important for business success and stuff.
```

**After "Improve":**
```
Effective customer communication is essential for business success. We should 
prioritize developing clearer, more consistent communication strategies that 
build stronger relationships with our customers and drive better business outcomes.
```

### Writing Assistant Options

| Option | Purpose | Best For |
|--------|---------|----------|
| **Improve** | Enhance clarity, flow, grammar | General text improvement |
| **Expand** | Add detail, examples, depth | Short notes that need more content |
| **Simplify** | Reduce complexity, increase clarity | Academic or technical writing |
| **Summarize** | Create concise overview | Long documents, meeting notes |

## 📄 Duplicate & Edit

Create improved versions of your documents without modifying originals.

### How Duplicate & Edit Works

1. **Open any document**
2. **Command Palette** (`Ctrl/Cmd + P`)
3. **Search "Duplicate & Edit"**
4. **Claude analyzes and improves** the entire document
5. **New file created** with improvements
6. **Bidirectional links** added between original and edited versions

### What You Get

**Original file (`my-notes.md`):**
```markdown
# My Original Notes

Some content here...

---
**Edited version**: [[my-notes-claude-edit-2024-01-15]]
```

**New file (`my-notes-claude-edit-2024-01-15.md`):**
```markdown
# My Enhanced Notes

~~Some content here...~~ **Enhanced content with better structure and clarity...**

> **Claude's reasoning**: I improved the structure by adding clearer headings, 
> enhanced the flow between paragraphs, and clarified technical concepts for 
> better readability.

---
**Original version**: [[my-notes]]
```

### Duplicate & Edit Features

- **Non-destructive**: Original files never modified
- **Change tracking**: See exactly what was changed
- **Reasoning included**: Understand why changes were made
- **Timestamped**: Each edit has unique timestamp
- **Linked**: Easy navigation between versions

## 🎯 Quick Action Access

### Command Palette Actions

All actions available via `Ctrl/Cmd + P`:

| Command | Purpose | Requires Selection |
|---------|---------|-------------------|
| **Writing Assistant** | Improve selected text | Optional |
| **Duplicate & Edit** | Improve entire document | No |
| **Generate Tags** | Create relevant tags | No |
| **Find Connections** | Discover note relationships | No |
| **Review Code** | Analyze code blocks | Yes |
| **Academic Peer Review** | Review research content | No |

### Keyboard Shortcuts (Optional)

You can set custom keyboard shortcuts:

1. **Settings** → **Hotkeys**
2. **Search for "Triple-Crown"**
3. **Assign shortcuts** to frequently used actions

**Suggested shortcuts:**
- `Ctrl/Cmd + Alt + W` - Writing Assistant
- `Ctrl/Cmd + Alt + D` - Duplicate & Edit
- `Ctrl/Cmd + Alt + T` - Open Terminal

## 🔍 Context Awareness

Triple-Crown automatically provides context to Claude for better results.

### What's Included in Context

1. **Current file content**: The document you're working on
2. **File metadata**: Title, tags, creation date
3. **Linked notes**: Files referenced in the current document
4. **Vault structure**: Understanding of your knowledge organization
5. **Folder configuration**: Local `.claude/config.json` settings

### Context Example

When you ask about a topic, Claude knows:
```
Current file: "Machine Learning Notes.md"
Related files: "AI Fundamentals.md", "Neural Networks.md"
File tags: #ai, #machine-learning, #research
Vault context: Academic research vault with 150 ML-related notes
```

This helps Claude provide:
- **Relevant suggestions** based on your existing notes
- **Consistent terminology** with your other documents
- **Cross-references** to related content
- **Appropriate complexity** for your knowledge level

## 📁 Folder-Level Behavior

### .claude Configuration

Place `.claude/config.json` in any folder for custom behavior:

```json
{
  "actions": {
    "enabled": ["writing-assistant", "tag-builder"],
    "disabled": ["therapist-mode"]
  },
  "privacy": {
    "neverShare": ["*confidential*", "*private*"],
    "requireConfirmation": true
  }
}
```

### How It Works

- **Folder inheritance**: Subfolders inherit parent folder configs
- **File-specific**: Apply different rules to different areas of your vault
- **Privacy zones**: Create areas where certain actions are disabled
- **Custom prompts**: Different behavior for different projects

## 🔄 Workflow Examples

### Academic Writing Workflow

1. **Draft ideas** in terminal: Ask Claude about your topic
2. **Create outline** using Writing Assistant to expand bullet points
3. **Write sections** with assistance for clarity and flow
4. **Generate tags** for organization and discovery
5. **Find connections** to link with existing research
6. **Peer review** completed sections for academic rigor

### Business Documentation

1. **Meeting notes** → Use Writing Assistant to create professional format
2. **Draft proposals** → Duplicate & Edit for polished versions
3. **Technical docs** → Code Reviewer for accuracy
4. **Cross-reference** → Connection Finder for related documents
5. **Organize** → Tag Builder for systematic categorization

### Personal Knowledge Management

1. **Daily notes** → Writing Assistant for clarity
2. **Research synthesis** → Find connections between topics
3. **Idea development** → Terminal for exploratory conversations
4. **Content organization** → Tag Builder for systematic tagging
5. **Knowledge linking** → Connection Finder for note relationships

## 🎨 Customization Options

### Settings Overview

**API Configuration**
- Model selection (speed vs quality trade-offs)
- Custom endpoints (for proxy setups)
- Rate limiting preferences

**Feature Toggles**
- Auto-save duplicates
- Show inline changes (strikethrough/bold)
- Include Claude's reasoning
- Action enable/disable

**Privacy Settings**
- File patterns to never share
- Confirmation requirements
- Interaction logging

### Visual Customization

**Terminal Appearance**
- Font size adjustment
- Dark/light theme selection
- Timestamp display options
- History size limits

**Change Display**
- Show/hide reasoning blocks
- Change tracking visualization
- Link formatting preferences

## 🔧 Tips for Effective Use

### Getting Better Results

1. **Be specific**: "Improve clarity and remove jargon" vs "make it better"
2. **Provide context**: Mention your audience, purpose, or constraints
3. **Use selections**: Select specific paragraphs for targeted improvements
4. **Iterate**: Use multiple actions in sequence for complex tasks

### Productivity Tips

1. **Learn shortcuts**: Set up keyboard shortcuts for frequent actions
2. **Use templates**: Create `.claude/config.json` templates for different projects
3. **Batch similar tasks**: Process multiple similar documents together
4. **Review patterns**: Learn from Claude's suggestions to improve your writing

### Collaboration Tips

1. **Share configs**: Include `.claude/config.json` in shared vaults
2. **Document workflows**: Create notes about your team's Triple-Crown usage
3. **Version control**: Use Duplicate & Edit for collaborative document improvement
4. **Privacy awareness**: Configure privacy settings for shared vaults

## 🚨 Common Gotchas

### Things to Remember

- **Selection matters**: Some actions work better with specific text selected
- **Context limits**: Very large documents may hit API limits
- **Rate limits**: Anthropic has usage limits - monitor your usage
- **Internet required**: All AI features require internet connection

### Best Practices

- **Save frequently**: Auto-save is enabled but manual saves are good practice
- **Review suggestions**: Claude's suggestions are starting points, not final answers
- **Maintain style**: Use consistent prompting for consistent results
- **Privacy first**: Review what's being shared, especially in sensitive vaults

---

**Ready for more?** 

➡️ **Next**: [Action Guide](Action-Guide) - Master all available actions  
➡️ **Or**: [Custom Actions](Custom-Actions) - Create your own AI tools