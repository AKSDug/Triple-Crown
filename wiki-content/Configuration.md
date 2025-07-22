# Configuration

Advanced settings, privacy controls, and customization options for Triple-Crown.

## 🎛️ Plugin Settings Overview

Access all settings via **Settings → Community Plugins → Triple-Crown**.

### API Configuration

| Setting | Purpose | Default | Notes |
|---------|---------|---------|--------|
| **Claude API Key** | Authentication with Anthropic | `(empty)` | Required - get from [console.anthropic.com](https://console.anthropic.com) |
| **API Endpoint** | Claude API URL | `https://api.anthropic.com/v1/messages` | Change only if using proxy |
| **Model Name** | Claude model to use | `claude-3-5-sonnet-20241022` | Balance of speed/quality |

### Feature Settings

| Setting | Purpose | Default | Impact |
|---------|---------|---------|---------|
| **Auto-save duplicates** | Save duplicate & edit results automatically | `✅ True` | Prevents data loss |
| **Show inline changes** | Display strikethrough/bold for changes | `✅ True` | Visual change tracking |
| **Include reasoning** | Add Claude's reasoning in blockquotes | `✅ True` | Transparency in AI decisions |

### Action Controls

| Action | Default | Purpose |
|--------|---------|---------|
| **Writing Assistant** | ✅ Enabled | Core writing improvement |
| **Tag Builder** | ✅ Enabled | Automatic tag generation |
| **Connection Finder** | ✅ Enabled | Note relationship discovery |
| **Therapist Mode** | ⚠️ Disabled | Reflective journaling (privacy) |
| **Code Reviewer** | ✅ Enabled | Technical code analysis |
| **Peer Reviewer** | ✅ Enabled | Academic paper review |

## 🔒 Privacy & Security Settings

### Never Share Patterns

Configure file patterns that Claude should never access:

**Default patterns:**
```json
[
  "*.key",
  "*.pem", 
  "*.cert",
  "*password*",
  "*secret*",
  "*token*"
]
```

**Add custom patterns:**
1. Settings → Triple-Crown → Privacy Settings
2. Add patterns like:
   - `*confidential*`
   - `*personal*`
   - `*private*`
   - `*financial*`

### Confirmation Requirements

**Require confirmation** forces manual approval before sharing content:
- ✅ **Enabled**: Shows preview of what will be shared
- ❌ **Disabled**: Shares content automatically

**Interaction Logging**
- ✅ **Enabled**: Logs interactions for debugging
- ❌ **Disabled**: No local interaction logs (recommended for privacy)

### Data Sharing Transparency

**What Triple-Crown Shares with Claude:**
- ✅ Content of selected text or current document
- ✅ File metadata (title, tags, creation date)
- ✅ Context from related files (if enabled)
- ✅ Vault structure information (file names, not content)

**What Triple-Crown NEVER Shares:**
- ❌ Files outside your Obsidian vault
- ❌ System files or personal directories
- ❌ Files matching "never share" patterns
- ❌ Obsidian configuration or other app data

## 📁 Folder-Level Configuration

Create `.claude/config.json` in any folder for custom settings that apply to that folder and its subfolders.

### Basic Folder Config

```json
{
  "permissions": {
    "scope": "folder",
    "allowedPaths": ["**/*.md"],
    "deniedPaths": ["**/private/**", "**/confidential/**"]
  },
  "actions": {
    "enabled": ["writing-assistant", "tag-builder"],
    "disabled": ["therapist-mode", "code-reviewer"]
  },
  "privacy": {
    "neverShare": ["*password*", "*secret*", "*personal*"],
    "requireConfirmation": true
  },
  "context": {
    "includeNearbyFiles": true,
    "includeBacklinks": true,
    "includeMetadata": true,
    "maxContextSize": 10000
  }
}
```

### Configuration Inheritance

Folder configs follow inheritance rules:

```
vault/
├── .claude/config.json          # Global vault config
├── projects/
│   ├── .claude/config.json      # Project-specific config
│   ├── public/
│   │   └── document.md          # Uses project config
│   └── private/
│       ├── .claude/config.json  # Private folder config  
│       └── secret.md            # Uses private config
```

**Inheritance behavior:**
- **Child overrides parent**: More specific configs take precedence
- **Setting-level merging**: Individual settings can be overridden
- **Array merging**: Lists are combined (enabled + disabled actions)

### Advanced Folder Configuration

#### Project-Specific Settings
```json
{
  "projectType": "academic-research",
  "actions": {
    "enabled": ["peer-reviewer", "connection-finder", "tag-builder"],
    "disabled": ["therapist-mode"],
    "customPrompts": {
      "peer-reviewer": "Focus on methodology and statistical rigor for psychology research."
    }
  },
  "context": {
    "includeNearbyFiles": true,
    "maxNearbyFiles": 5,
    "fileTypeWeights": {
      "*.md": 1.0,
      "*.pdf": 0.5,
      "*.docx": 0.3
    }
  },
  "privacy": {
    "neverShare": ["*participant*", "*raw-data*", "*personal*"],
    "requireConfirmation": true,
    "logInteractions": false
  }
}
```

#### Sensitive Folder Protection
```json
{
  "permissions": {
    "scope": "disabled",
    "reason": "Contains sensitive personal information"
  },
  "actions": {
    "enabled": [],
    "disabled": ["*"]
  },
  "privacy": {
    "neverShare": ["**/*"],
    "requireConfirmation": true,
    "blockAllAccess": true
  }
}
```

#### Development Project Config
```json
{
  "projectType": "software-development", 
  "actions": {
    "enabled": ["code-reviewer", "writing-assistant"],
    "disabled": ["therapist-mode", "peer-reviewer"],
    "customPrompts": {
      "code-reviewer": "Focus on security vulnerabilities and performance optimization for web applications."
    }
  },
  "context": {
    "includeNearbyFiles": true,
    "supportedExtensions": [".md", ".js", ".ts", ".py", ".json"],
    "maxContextSize": 15000
  },
  "privacy": {
    "neverShare": ["*api-key*", "*secret*", "*config*", "*.env"],
    "requireConfirmation": false
  }
}
```

## 🖥️ Terminal Settings

### Appearance Customization

**Font Size**
- Range: 10-24px
- Default: 14px
- Affects terminal display only

**Theme Selection**
- **Dark**: Matches Obsidian dark theme
- **Light**: Matches Obsidian light theme  
- **Auto**: Follows Obsidian theme

**Timestamp Display**
- ✅ **Show**: Displays time for each interaction
- ❌ **Hide**: Cleaner interface without timestamps

**History Management**
- **Max History Size**: Number of terminal interactions to remember
- Default: 1000 interactions
- Range: 100-5000 interactions

### Terminal Behavior

```json
{
  "terminalSettings": {
    "fontSize": 14,
    "theme": "auto",
    "showTimestamps": true,
    "maxHistorySize": 1000,
    "autoScroll": true,
    "persistHistory": true,
    "clearOnRestart": false
  }
}
```

## 🎯 Action-Specific Configuration

### Writing Assistant Settings

```json
{
  "writingAssistant": {
    "defaultMode": "improve",
    "showReasoningByDefault": true,
    "preserveFormatting": true,
    "maxContextLength": 5000
  }
}
```

### Tag Builder Configuration

```json
{
  "tagBuilder": {
    "maxTags": 8,
    "minTags": 3,
    "tagFormat": "hyphenated",
    "placement": "frontmatter",
    "avoidDuplicates": true,
    "considerExistingTags": true
  }
}
```

### Connection Finder Settings

```json
{
  "connectionFinder": {
    "maxConnections": 10,
    "includeBacklinks": true,
    "scanDepth": 2,
    "minimumRelevance": 0.3,
    "groupByType": true
  }
}
```

### Code Reviewer Configuration

```json
{
  "codeReviewer": {
    "focusAreas": ["security", "performance", "maintainability"],
    "severityLevels": ["critical", "major", "minor"],
    "includeExamples": true,
    "suggestAlternatives": true,
    "maxCodeLength": 2000
  }
}
```

## 🌐 Network & Performance Settings

### API Rate Limiting

```json
{
  "apiSettings": {
    "requestTimeout": 30000,
    "maxRetries": 3,
    "retryDelay": 1000,
    "rateLimitBuffer": 100
  }
}
```

### Context Management

```json
{
  "contextSettings": {
    "maxFileSize": 50000,
    "maxContextFiles": 5,
    "includeMetadata": true,
    "cacheEnabled": true,
    "cacheTimeout": 300000
  }
}
```

### Performance Optimization

**For Large Vaults (1000+ files):**
```json
{
  "performance": {
    "indexingEnabled": true,
    "backgroundProcessing": true,
    "maxConcurrentRequests": 2,
    "contextCaching": true
  }
}
```

**For Slow Networks:**
```json
{
  "performance": {
    "requestTimeout": 60000,
    "preferHaikuModel": true,
    "reduceContextSize": true,
    "compressRequests": true
  }
}
```

## 🔧 Model Selection Guide

### Available Models

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| **Claude 3.5 Sonnet** | Medium | High | Medium | Balanced performance (recommended) |
| **Claude 3.5 Haiku** | Fast | Good | Low | Quick tasks, large volumes |
| **Claude 3 Opus** | Slow | Highest | High | Complex analysis, critical tasks |

### Model Selection Strategy

**For Daily Writing:**
- Use **Claude 3.5 Sonnet** for most tasks
- Switch to **Haiku** for simple improvements
- Use **Opus** for important documents

**For Code Review:**
- **Sonnet**: Good balance for most code
- **Opus**: Critical security reviews
- **Haiku**: Quick syntax checks

**For Research:**
- **Opus**: Complex academic analysis
- **Sonnet**: General research tasks
- **Haiku**: Simple summarization

### Cost Management

**Approximate Costs (per 1000 tokens):**
- **Haiku**: $0.25 input, $1.25 output
- **Sonnet**: $3.00 input, $15.00 output  
- **Opus**: $15.00 input, $75.00 output

**Cost Optimization Tips:**
1. **Use Haiku for simple tasks**
2. **Select specific text instead of whole documents**
3. **Configure context limits appropriately**
4. **Monitor usage at [Anthropic Console](https://console.anthropic.com)**

## 🚨 Security Best Practices

### Vault-Level Security

**1. API Key Management**
- Store securely in Obsidian settings only
- Never commit to version control
- Rotate periodically (every 3-6 months)
- Monitor usage for unauthorized access

**2. Privacy Patterns**
```json
{
  "neverSharePatterns": [
    "*.key", "*.pem", "*.cert",
    "*password*", "*secret*", "*token*",
    "*ssn*", "*credit*", "*bank*",
    "*personal-info*", "*confidential*"
  ]
}
```

**3. Sensitive Folder Protection**
```
vault/
├── public/           # Normal Triple-Crown access
├── work/            # Limited action access  
│   └── .claude/config.json
└── personal/        # Blocked completely
    └── .claude/config.json (scope: "disabled")
```

### Network Security

**Proxy Configuration** (if required by organization):
```json
{
  "apiEndpoint": "https://your-proxy.company.com/claude/v1/messages",
  "proxySettings": {
    "timeout": 45000,
    "retries": 2
  }
}
```

**Corporate Environment Setup:**
1. Configure corporate proxy in API endpoint
2. Add company-specific privacy patterns
3. Enable confirmation requirements
4. Disable interaction logging
5. Set restricted action permissions

## 📊 Usage Monitoring

### Built-in Monitoring

**Token Usage Tracking:**
- Settings → Triple-Crown → Usage Statistics
- View daily/monthly token consumption
- Model-specific usage breakdown
- Cost estimation

**Performance Metrics:**
- Average response time
- Success/failure rates  
- Most-used actions
- Error frequency

### External Monitoring

**Anthropic Console:**
- Real-time usage monitoring
- Billing and cost tracking
- Rate limit information
- API key management

**Usage Optimization:**
1. **Review monthly usage patterns**
2. **Identify high-cost actions** 
3. **Optimize frequently-used prompts**
4. **Adjust context settings** based on needs

## 🔄 Backup & Migration

### Configuration Backup

**Export Settings:**
```bash
# Backup all Triple-Crown settings
cp ~/.obsidian/plugins/triple-crown/settings.json ~/triple-crown-backup.json
```

**Backup Folder Configs:**
```bash
# Find all .claude/config.json files
find /path/to/vault -name "config.json" -path "*/.claude/*" -exec cp {} backup-folder/ \;
```

### Migration Between Vaults

**1. Export Current Settings**
- Settings → Triple-Crown → Export Configuration
- Saves all settings to JSON file

**2. Import to New Vault**
- Install Triple-Crown in new vault
- Settings → Triple-Crown → Import Configuration  
- Select exported JSON file

**3. Folder Config Migration**
- Manually copy `.claude/` folders
- Adjust paths in configs if needed
- Test action functionality

## 💡 Configuration Tips

### Workflow-Specific Setups

**Academic Research Vault:**
```json
{
  "defaultActions": ["peer-reviewer", "connection-finder", "tag-builder"],
  "privacy": { "neverShare": ["*participant*", "*raw-data*"] },
  "context": { "maxContextSize": 15000 }
}
```

**Business Documentation:**
```json
{
  "defaultActions": ["writing-assistant", "code-reviewer"],
  "privacy": { "neverShare": ["*confidential*", "*financial*"] },
  "context": { "includeMetadata": true }
}
```

**Personal Knowledge Management:**
```json
{
  "defaultActions": ["writing-assistant", "connection-finder", "tag-builder"],
  "privacy": { "requireConfirmation": false },
  "context": { "includeBacklinks": true }
}
```

### Troubleshooting Configuration

**Common Issues:**
1. **Actions not working**: Check action enable/disable settings
2. **Privacy errors**: Review never-share patterns
3. **Performance issues**: Reduce context size limits
4. **API errors**: Verify API key and endpoint

**Debug Mode:**
```json
{
  "debug": {
    "enableLogging": true,
    "logLevel": "verbose",
    "logApiRequests": true,
    "showConfigSource": true
  }
}
```

---

**Configuration complete?**

➡️ **Next**: [Troubleshooting](Troubleshooting) - Solve common issues  
➡️ **Or**: [Development Guide](Development-Guide) - Contribute to Triple-Crown