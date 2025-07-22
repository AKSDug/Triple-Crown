# Development Guide

Complete guide for contributing to Triple-Crown development.

## 🛠️ Development Setup

### Prerequisites

**Required Tools:**
- **Node.js**: 16.x or higher
- **npm**: 7.x or higher  
- **Git**: Latest version
- **Code Editor**: VS Code recommended

**Recommended VS Code Extensions:**
- TypeScript and JavaScript Language Features
- Obsidian Plugin Development
- ESLint
- Prettier

### Local Development Setup

**1. Fork and Clone**
```bash
# Fork the repository on GitHub first
git clone https://github.com/YOUR-USERNAME/Triple-Crown.git
cd Triple-Crown

# Add upstream remote
git remote add upstream https://github.com/AKSDug/Triple-Crown.git
```

**2. Install Dependencies**
```bash
npm install
```

**3. Build for Development**
```bash
# Development build with file watching
npm run dev

# Or one-time build
npm run build
```

**4. Link to Obsidian**
```bash
# Create symlink to your test vault
ln -s $(pwd) /path/to/your/test-vault/.obsidian/plugins/triple-crown

# Windows equivalent:
mklink /D "C:\path\to\vault\.obsidian\plugins\triple-crown" "C:\path\to\Triple-Crown"
```

**5. Enable in Obsidian**
- Open your test vault in Obsidian
- Settings → Community Plugins → Enable "Triple-Crown"
- The plugin will auto-reload on file changes

## 🏗️ Project Architecture

### Directory Structure

```
Triple-Crown/
├── src/                          # Source code
│   ├── actions/                  # Action implementations
│   │   ├── base-action.ts        # Base action class
│   │   ├── writing-assistant.ts  # Core writing features
│   │   ├── tag-builder.ts        # Tag generation
│   │   ├── connection-finder.ts  # Note relationships
│   │   ├── therapist-mode.ts     # Reflective journaling
│   │   ├── code-reviewer.ts      # Code analysis
│   │   ├── peer-reviewer.ts      # Academic review
│   │   └── custom-action.ts      # Custom action framework
│   ├── security/                 # Security implementations
│   │   └── vault-boundary.ts     # Vault access controls
│   ├── claude-service.ts         # Claude API integration
│   ├── settings.ts              # Plugin settings
│   └── terminal-view.ts         # Terminal interface
├── main.ts                      # Plugin entry point
├── styles.css                   # Plugin styles
├── manifest.json               # Plugin metadata
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── esbuild.config.mjs         # Build configuration
└── version-bump.mjs           # Version management
```

### Core Components

#### 1. Plugin Main Class (`main.ts`)
```typescript
export default class TripleCrownPlugin extends Plugin {
  settings: TripleCrownSettings;
  claudeService: ClaudeService;
  // Action instances
  // Command registration
  // Settings management
}
```

#### 2. Claude Service (`src/claude-service.ts`)
```typescript
export class ClaudeService {
  // API communication
  // Security validation  
  // Context generation
  // Response processing
}
```

#### 3. Base Action Class (`src/actions/base-action.ts`)
```typescript
export abstract class BaseAction {
  abstract execute(editor: Editor, view: MarkdownView): Promise<void>;
  abstract getSystemPrompt(): string;
  // Common functionality
}
```

#### 4. Vault Security (`src/security/vault-boundary.ts`)
```typescript
export class VaultBoundary {
  // Path validation
  // Access control
  // Security enforcement
}
```

## 🎯 Contributing Guidelines

### Code Style

**TypeScript Standards:**
- Use TypeScript strict mode
- Explicit return types for public methods
- Proper error handling with try/catch
- Async/await over Promises where appropriate

**Formatting:**
```typescript
// ✅ Good: Clear interfaces
interface ActionConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// ✅ Good: Descriptive function names
async executeWritingAssistant(editor: Editor, view: MarkdownView): Promise<void>

// ✅ Good: Error handling
try {
  const response = await this.claudeService.sendRequest(request);
  await this.processResponse(response);
} catch (error) {
  console.error('Action execution failed:', error);
  new Notice('Error: ' + error.message);
}

// ❌ Bad: Generic names, no error handling
async doThing(e: any): Promise<any> {
  return this.service.call(e);
}
```

**Security Requirements:**
- All file paths must be validated by VaultBoundary
- User input must be sanitized
- API keys never logged or exposed
- Privacy patterns strictly enforced

### Development Workflow

**1. Feature Development**
```bash
# Create feature branch
git checkout -b feature/action-name

# Make changes
# Write tests
# Update documentation

# Commit with descriptive message
git commit -m "feat: add custom action framework with UI

- Implement CustomAction and CustomActionManager classes
- Add settings UI for creating/managing custom actions  
- Include prompt engineering best practices
- Add comprehensive error handling"
```

**2. Code Quality Checks**
```bash
# Type checking
npm run build

# Linting (if configured)
npm run lint

# Manual testing in Obsidian
# Test edge cases and error conditions
```

**3. Pull Request Process**
- Fork repository and create feature branch
- Make focused, atomic commits
- Write clear commit messages
- Update documentation if needed
- Submit PR with detailed description

### Adding New Actions

**1. Create Action Class**
```typescript
// src/actions/new-action.ts
import { App, Editor, MarkdownView, Notice } from 'obsidian';
import { ClaudeService, ClaudeRequest } from '../claude-service';
import { BaseAction, ActionConfig, ActionCategory } from './base-action';

export class NewAction extends BaseAction {
  constructor(app: App, claudeService: ClaudeService) {
    const config: ActionConfig = {
      id: 'new-action',
      name: 'New Action',
      description: 'Description of what this action does',
      enabled: true,
      category: ActionCategory.WRITING, // or ANALYSIS, ORGANIZATION, REVIEW, CUSTOM
      requiresSelection: false, // or true if selection needed
      supportedFileTypes: ['md'] // file extensions
    };
    
    super(app, claudeService, config);
  }

  async execute(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.canExecute(editor, view)) {
      new Notice('Action cannot be executed in current context');
      return;
    }

    try {
      // Get content
      const selectedText = editor.getSelection();
      const content = selectedText || editor.getValue();
      
      // Build request
      const request: ClaudeRequest = {
        prompt: this.buildUserMessage(content),
        context: 'Action-specific context',
        action: this.config.id,
        file: view.file?.path
      };

      // Send to Claude
      const response = await this.claudeService.sendRequest(request);
      
      // Process response
      await this.handleResponse(editor, response, selectedText ? true : false);
      
      new Notice('Action completed successfully');
    } catch (error) {
      console.error('Action error:', error);
      new Notice('Error: ' + error.message);
    }
  }

  protected getSystemPrompt(): string {
    return `You are a specialist who performs [specific task].

TASK: [Clear description of what Claude should do]

GUIDELINES:
- [Specific guideline 1]
- [Specific guideline 2]
- [Specific guideline 3]

OUTPUT FORMAT:
[Exact format specification]`;
  }

  private async handleResponse(editor: Editor, response: string, hasSelection: boolean): Promise<void> {
    // Process and insert Claude's response
    const formattedResponse = `\n\n---\n## ${this.config.name} - ${new Date().toLocaleString()}\n\n${response}\n\n---\n`;
    
    if (hasSelection) {
      const selection = editor.getSelection();
      editor.replaceSelection(selection + formattedResponse);
    } else {
      const content = editor.getValue();
      editor.setValue(content + formattedResponse);
    }
  }
}
```

**2. Register in Main Plugin**
```typescript
// main.ts - Add imports
import { NewAction } from './src/actions/new-action';

// Add property
export default class TripleCrownPlugin extends Plugin {
  newAction: NewAction;
  
  async onload() {
    // Initialize action
    this.newAction = new NewAction(this.app, this.claudeService);
    
    // Register command
    this.addCommand({
      id: 'new-action',
      name: 'New Action Name',
      editorCallback: (editor, ctx) => {
        const view = ctx as MarkdownView;
        if (view && this.settings.enabledActions.newAction) {
          this.newAction.execute(editor, view);
        }
      }
    });
  }
}
```

**3. Update Settings**
```typescript
// src/settings.ts - Add to interface
export interface TripleCrownSettings {
  enabledActions: {
    newAction: boolean; // Add this line
    // ... other actions
  };
}

// Add to defaults
export const DEFAULT_SETTINGS: TripleCrownSettings = {
  enabledActions: {
    newAction: true, // Add this line
    // ... other actions
  }
};
```

**4. Add Settings UI**
```typescript
// main.ts - In settings tab display() method
new Setting(containerEl)
  .setName('New Action')
  .setDesc('Description of the new action')
  .addToggle(toggle => toggle
    .setValue(this.plugin.settings.enabledActions.newAction)
    .onChange(async (value) => {
      this.plugin.settings.enabledActions.newAction = value;
      await this.plugin.saveSettings();
    }));
```

### Testing Guidelines

**Manual Testing Checklist:**
- [ ] Action appears in Command Palette
- [ ] Action respects enable/disable setting
- [ ] Works with and without text selection (as appropriate)
- [ ] Handles empty/invalid content gracefully
- [ ] Error messages are user-friendly
- [ ] Performance is acceptable (< 30 seconds)
- [ ] Respects privacy settings
- [ ] Output format is consistent

**Edge Cases to Test:**
- Very large documents (>50KB)
- Very small content (1-2 words)
- Special characters and Unicode
- Markdown formatting preservation
- Multiple rapid executions
- Network disconnection during execution
- Invalid API keys
- Rate limiting scenarios

### Security Testing

**Required Security Checks:**
- [ ] All file access goes through VaultBoundary
- [ ] No access to files outside vault
- [ ] Privacy patterns are respected
- [ ] No API keys in logs or error messages
- [ ] User input is properly sanitized
- [ ] No XSS vulnerabilities in output

**Security Test Cases:**
```typescript
// Test path traversal prevention
const maliciousPath = '../../../etc/passwd';
// Should be blocked by VaultBoundary

// Test privacy pattern enforcement
const sensitiveFile = 'my-passwords.md';
// Should be blocked by privacy settings

// Test input sanitization
const maliciousInput = '<script>alert("xss")</script>';
// Should be safely handled
```

## 🧪 Testing & Quality Assurance

### Unit Testing Setup

**Install Testing Dependencies:**
```bash
npm install --save-dev jest @types/jest ts-jest
```

**Jest Configuration (`jest.config.js`):**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
```

**Example Tests:**
```typescript
// src/actions/__tests__/base-action.test.ts
describe('BaseAction', () => {
  test('canExecute respects enabled setting', () => {
    const action = new TestAction(mockApp, mockService, {
      enabled: false,
      // ... other config
    });
    
    expect(action.canExecute(mockEditor, mockView)).toBe(false);
  });
  
  test('canExecute checks selection requirements', () => {
    const action = new TestAction(mockApp, mockService, {
      requiresSelection: true,
      // ... other config
    });
    
    mockEditor.getSelection.mockReturnValue('');
    expect(action.canExecute(mockEditor, mockView)).toBe(false);
    
    mockEditor.getSelection.mockReturnValue('selected text');
    expect(action.canExecute(mockEditor, mockView)).toBe(true);
  });
});
```

### Integration Testing

**Test with Real Obsidian:**
1. Create test vault with various content types
2. Test all actions with different document structures
3. Verify settings persistence across restarts
4. Test error recovery and edge cases

**Automated Testing Script:**
```bash
#!/bin/bash
# test-plugin.sh

echo "Building plugin..."
npm run build

echo "Copying to test vault..."
cp main.js manifest.json styles.css ~/test-vault/.obsidian/plugins/triple-crown/

echo "Testing in Obsidian..."
# Manual testing required - open Obsidian and verify functionality
```

## 📦 Release Process

### Version Management

**Update Version:**
```bash
# This script updates manifest.json and versions.json
npm run version

# Or manually update:
# 1. Edit manifest.json version
# 2. Edit versions.json mapping
# 3. Create git tag
```

**Release Checklist:**
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated with changes
- [ ] Version bumped in manifest.json
- [ ] Build successful (`npm run build`)
- [ ] Test in clean Obsidian vault

### GitHub Release

**Create Release:**
```bash
# Tag the release
git tag v1.2.0
git push origin v1.2.0

# GitHub Actions will automatically:
# 1. Build the plugin
# 2. Create release with assets
# 3. Upload main.js, manifest.json, styles.css
```

**Release Notes Template:**
```markdown
## What's New in v1.2.0

### ✨ New Features
- Added custom action framework
- New connection finder action
- Enhanced privacy controls

### 🐛 Bug Fixes  
- Fixed API timeout issues
- Improved error handling
- Resolved settings persistence

### 🔧 Improvements
- Better performance for large documents
- Updated Claude API integration
- Enhanced security measures

### 📚 Documentation
- Added comprehensive wiki
- Updated installation guide
- New troubleshooting section

### 🔄 Breaking Changes
- None in this release

**Full Changelog**: https://github.com/AKSDug/Triple-Crown/compare/v1.1.0...v1.2.0
```

## 🤝 Community Guidelines

### Issue Reporting

**Bug Reports Should Include:**
- Clear reproduction steps
- Expected vs actual behavior
- Environment details (OS, Obsidian version)
- Console error messages
- Relevant configuration

**Feature Requests Should Include:**
- Clear use case description
- Expected behavior
- Why existing features don't meet the need
- Suggested implementation approach

### Code Review Process

**Review Criteria:**
- [ ] **Functionality**: Does it work as intended?
- [ ] **Security**: No security vulnerabilities?
- [ ] **Performance**: Acceptable response times?
- [ ] **Code Quality**: Readable, maintainable code?
- [ ] **Documentation**: Adequate comments and docs?
- [ ] **Testing**: Appropriate test coverage?

**Review Guidelines:**
- Be constructive and specific
- Suggest improvements, don't just identify problems
- Consider user experience and edge cases
- Verify security implications

### Documentation Standards

**Code Comments:**
```typescript
/**
 * Executes the writing assistant action on the provided content.
 * 
 * @param editor The Obsidian editor instance
 * @param view The markdown view containing the document
 * @returns Promise that resolves when action completes
 * @throws Error if API request fails or content is invalid
 */
async execute(editor: Editor, view: MarkdownView): Promise<void> {
  // Implementation details...
}
```

**README Updates:**
- Keep feature list current
- Update installation instructions if needed
- Maintain example configurations
- Update troubleshooting section

## 🏆 Recognition

### Contributors

All contributors are recognized in:
- GitHub contributor list
- CONTRIBUTORS.md file
- Release notes acknowledgments
- Wiki maintainer credits

### Types of Contributions

**Code Contributions:**
- New features and actions
- Bug fixes and improvements
- Performance optimizations
- Security enhancements

**Documentation:**
- Wiki page improvements
- Tutorial creation
- Translation efforts
- Video guides

**Community Support:**
- Answering user questions
- Triaging issues
- Testing new features
- Providing feedback

---

**Ready to contribute?**

➡️ **[Fork Repository](https://github.com/AKSDug/Triple-Crown/fork)** - Start coding  
➡️ **[View Issues](https://github.com/AKSDug/Triple-Crown/issues)** - Find tasks  
➡️ **[Join Discussions](https://github.com/AKSDug/Triple-Crown/discussions)** - Ask questions