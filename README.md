# Triple-Crown

An Obsidian plugin that integrates Claude Code as an intelligent writing assistant, featuring duplicate & edit workflows and context-aware suggestions.

## Features

### 🎯 Core Features
- **Terminal Interface**: Pseudo-terminal at bottom of Obsidian for interactive Claude sessions
- **Writing Assistant**: Improve, expand, simplify, and summarize text
- **Duplicate & Edit**: Non-destructive editing with timestamped copies
- **Context Awareness**: Automatic file context and .claude folder configuration
- **Bidirectional Links**: Automatic linking between originals and edits

### ✨ Signature Feature: Duplicate & Edit
- Creates timestamped copies: `filename-claude-edit-YYYY-MM-DD.md`
- Shows changes inline: ~~strikethrough~~ deletions, **bold** additions
- Adds Claude's reasoning in blockquotes
- Maintains bidirectional links between original and edited versions
- Never modifies originals - completely non-destructive

### 🎬 Available Actions
- **writing-assistant**: Improve, expand, or simplify text
- **tag-builder**: Generate smart tags for content
- **connection-finder**: Discover note relationships
- **therapist-mode**: Reflective journaling assistance
- **code-reviewer**: Review and improve code
- **peer-reviewer**: Academic peer review

## Installation

1. Download the plugin files
2. Place in your Obsidian plugins folder: `~/.obsidian/plugins/triple-crown/`
3. Enable the plugin in Obsidian settings
4. Configure your Anthropic API key in the plugin settings

## Configuration

### Global Settings
- **API Key**: Your Anthropic API key (required)
- **Auto-save duplicates**: Automatically save duplicate & edit results
- **Show inline changes**: Display strikethrough deletions and bold additions
- **Include reasoning**: Add Claude's reasoning in blockquotes

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