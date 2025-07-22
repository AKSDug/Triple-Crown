# Installation and Setup

Get Triple-Crown up and running in your Obsidian vault in under 5 minutes.

## 📋 Prerequisites

- **Obsidian**: Version 0.15.0 or higher
- **Platform**: Desktop only (Windows, macOS, Linux)
- **API Key**: Anthropic Claude API key ([get one here](https://console.anthropic.com))

## 🚀 Installation Methods

### Method 1: Manual Installation (Recommended)

1. **Download the Plugin**
   - Go to [Triple-Crown Releases](https://github.com/AKSDug/Triple-Crown/releases)
   - Download the latest `triple-crown.zip` file
   - Extract the ZIP file

2. **Install in Obsidian**
   ```
   your-vault/.obsidian/plugins/triple-crown/
   ├── main.js
   ├── manifest.json
   ├── styles.css
   └── versions.json
   ```
   - Copy the extracted files to: `VaultFolder/.obsidian/plugins/triple-crown/`
   - Create the `triple-crown` folder if it doesn't exist

3. **Enable the Plugin**
   - Open Obsidian Settings (`Ctrl/Cmd + ,`)
   - Navigate to **Community Plugins**
   - Find **Triple-Crown** in the list
   - Toggle it **ON**

### Method 2: Git Clone (for Developers)

```bash
# Navigate to your plugins directory
cd /path/to/your/vault/.obsidian/plugins/

# Clone the repository
git clone https://github.com/AKSDug/Triple-Crown.git triple-crown

# Build the plugin
cd triple-crown
npm install
npm run build
```

### Method 3: Community Plugin Store (Coming Soon)

Triple-Crown will be available in the Obsidian Community Plugin store once approved.

## ⚙️ Initial Configuration

### 1. Get Your Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Sign up or log in to your account
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-`)

> **💰 Cost Note**: Claude API uses pay-per-use pricing. Typical usage costs $1-5/month for regular writing assistance.

### 2. Configure Triple-Crown

1. **Open Plugin Settings**
   - Settings → Community Plugins → Triple-Crown (gear icon)

2. **API Configuration**
   - **Claude API Key**: Paste your API key
   - **API Endpoint**: Leave as default (`https://api.anthropic.com/v1/messages`)
   - **Model Name**: Choose your preferred model:
     - `claude-3-5-sonnet-20241022` (Recommended - balanced speed/quality)
     - `claude-3-5-haiku-20241022` (Faster, more economical)
     - `claude-3-opus-20240229` (Highest quality, slower)

3. **Feature Settings**
   - ✅ **Auto-save duplicates**: Automatically save duplicate & edit results
   - ✅ **Show inline changes**: Display strikethrough deletions and bold additions
   - ✅ **Include reasoning**: Add Claude's reasoning in blockquotes

4. **Enable Actions** (see [Action Guide](Action-Guide) for details)
   - ✅ **Writing Assistant**: Core writing improvement features
   - ✅ **Tag Builder**: Automatic tag generation
   - ✅ **Connection Finder**: Note relationship discovery
   - ⚠️ **Therapist Mode**: Reflective journaling (disabled by default)
   - ✅ **Code Reviewer**: Technical code analysis
   - ✅ **Peer Reviewer**: Academic paper review

## 🧪 Test Your Installation

### 1. Test Terminal Interface

1. Click the **terminal icon** in the ribbon (left sidebar)
2. Type a simple question: `What is the capital of France?`
3. Press **Enter**
4. You should see Claude's response

### 2. Test Writing Assistant

1. Create a new note
2. Write some text: `This is a test sentence that could be improved.`
3. Select the text
4. Open Command Palette (`Ctrl/Cmd + P`)
5. Search for "Writing Assistant"
6. Choose an improvement option
7. Claude should provide suggestions

### 3. Test Duplicate & Edit

1. Create a note with some content
2. Open Command Palette (`Ctrl/Cmd + P`)
3. Search for "Duplicate & Edit"
4. Claude should create an improved version in a new file

## 🔧 Advanced Configuration

### Folder-Level Settings

Create `.claude/config.json` in any folder for custom settings:

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
    "neverShare": ["*password*", "*secret*", "*api-key*"],
    "requireConfirmation": true
  },
  "context": {
    "includeNearbyFiles": true,
    "includeBacklinks": true,
    "maxContextSize": 10000
  }
}
```

### Privacy Patterns

Add patterns to never share with Claude:

```json
{
  "privacySettings": {
    "neverSharePatterns": [
      "*.key",
      "*.pem", 
      "*.cert",
      "*password*",
      "*secret*",
      "*token*",
      "*personal-info*"
    ]
  }
}
```

## 🔒 Security Best Practices

### Vault Boundary Protection
- Triple-Crown can **only** access files within your Obsidian vault
- **Cannot** browse your computer or access system files
- **Cannot** access other applications or personal data

### API Key Security
- Store your API key securely in Obsidian settings
- Never commit API keys to version control
- Rotate your API key periodically
- Monitor your API usage at [Anthropic Console](https://console.anthropic.com)

### Privacy Controls
- Review which actions you enable
- Use folder-level configs for sensitive areas
- Consider disabling "Therapist Mode" unless needed
- Set up privacy patterns for sensitive file types

## 🎯 Command Reference

Once installed, these commands are available in Command Palette:

| Command | Description | Shortcut |
|---------|-------------|----------|
| **Open Claude Terminal** | Opens terminal interface | Customizable |
| **Writing Assistant** | AI writing improvements | Customizable |
| **Duplicate & Edit** | Create improved copy | Customizable |
| **Generate Tags** | Auto-generate content tags | None |
| **Find Connections** | Discover note relationships | None |
| **Review Code** | Technical code review | None |
| **Academic Peer Review** | Scholarly paper review | None |

## 🐛 Troubleshooting Installation

### Plugin Won't Enable
- **Check Obsidian version**: Must be 0.15.0+
- **Verify file structure**: Ensure all files are in correct locations
- **Restart Obsidian**: Close and reopen the application
- **Check console**: Press F12 → Console for error messages

### API Connection Issues
- **Verify API key**: Check for typos, must start with `sk-ant-`
- **Test endpoint**: Leave as default unless using proxy
- **Check internet**: Ensure stable connection
- **Review quotas**: Check [Anthropic Console](https://console.anthropic.com) for usage limits

### Commands Not Appearing
- **Reload plugin**: Disable and re-enable in settings
- **Clear cache**: Restart Obsidian
- **Check installation**: Verify all files are present

### Performance Issues
- **Model selection**: Try Claude 3.5 Haiku for faster responses
- **Context size**: Reduce `maxContextSize` in config
- **Action selection**: Disable unused actions
- **Network**: Check for stable internet connection

## 🆘 Getting Help

### Quick Fixes
1. **Restart Obsidian** (fixes 90% of issues)
2. **Check API key** in settings
3. **Verify internet connection**
4. **Review console errors** (F12)

### Support Resources
- 📖 **Wiki**: Browse other pages in this wiki
- 🐛 **GitHub Issues**: [Report bugs](https://github.com/AKSDug/Triple-Crown/issues)
- 💬 **Discussions**: [Ask questions](https://github.com/AKSDug/Triple-Crown/discussions)
- 📧 **Email**: Contact via GitHub profile

## 🎉 Next Steps

Now that Triple-Crown is installed:

1. **Explore Actions**: Read the [Action Guide](Action-Guide)
2. **Create Custom Actions**: See [Custom Actions](Custom-Actions)
3. **Configure Privacy**: Review [Configuration](Configuration)
4. **Join Community**: Star the [GitHub repo](https://github.com/AKSDug/Triple-Crown)

---

**Installation complete!** Ready to enhance your writing with AI assistance.

➡️ **Next**: [Basic Usage](Basic-Usage) - Learn the core features