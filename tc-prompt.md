**Initialize a new Obsidian plugin called "Triple-Crown" that integrates claude-code npm package into Obsidian as an intelligent writing assistant.**

Key requirements:
- Fork obsidian-sample-plugin as base
- Install @anthropic-ai/claude-code as core dependency
- Desktop-only plugin (mobile later)

Core architecture:
- Main service: ClaudeService wrapping claude-code npm package with subprocess management
- Authentication: Support both OAuth (primary) and API key (fallback)
- Terminal view: Pseudo-terminal interface at bottom of Obsidian
- Context management: Track active file, respect .claude folder configs in vault

Signature feature - "Duplicate & Edit":
- Creates timestamped copies (filename-claude-edit-YYYY-MM-DD.md)
- Shows changes inline: ~~strikethrough~~ deletions, **bold** additions
- Adds Claude's reasoning in blockquotes
- Bidirectional links between original and edited versions
- Non-destructive - never modifies originals

Actions to implement:
- writing-assistant (improve/expand/simplify)
- tag-builder (smart tagging)
- connection-finder (discover note relationships)
- therapist-mode (reflective journaling)
- code-reviewer
- peer-reviewer

Folder-level configuration via .claude/config.json:
- Scoped permissions (file/folder/vault)
- Action availability
- Privacy controls (never-share patterns)

Start with basic structure: main.ts, settings.ts, claude-service.ts, manifest.json, and one working action (writing-assistant). Focus on getting the terminal view working with claude-code integration first.