/**
 * Triple-Crown Obsidian Plugin - Context Generator for CLAUDE.md
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { App, TFile, Notice } from 'obsidian';
import { PluginEcosystemDetector, DetectedPlugin } from './plugin-ecosystem';
import { TripleCrownSettings } from './settings';

export class ContextGenerator {
  private app: App;
  private settings: TripleCrownSettings;
  private pluginDetector: PluginEcosystemDetector;
  private claudeFile: TFile | null = null;

  constructor(app: App, settings: TripleCrownSettings, pluginDetector: PluginEcosystemDetector) {
    this.app = app;
    this.settings = settings;
    this.pluginDetector = pluginDetector;
  }

  async initializeOrUpdateContext(): Promise<void> {
    try {
      // Find or create CLAUDE.md in vault root
      this.claudeFile = this.app.vault.getAbstractFileByPath('CLAUDE.md') as TFile;
      
      if (!this.claudeFile) {
        // Create new CLAUDE.md
        await this.createInitialContext();
      } else {
        // Update existing CLAUDE.md
        await this.updateContext();
      }
    } catch (error) {
      console.error('Failed to initialize CLAUDE.md context:', error);
    }
  }

  private async createInitialContext(): Promise<void> {
    const content = await this.generateContextContent();
    this.claudeFile = await this.app.vault.create('CLAUDE.md', content);
    new Notice('Created CLAUDE.md for AI context');
  }

  private async updateContext(): Promise<void> {
    if (!this.claudeFile) return;
    
    const content = await this.generateContextContent();
    await this.app.vault.modify(this.claudeFile, content);
  }

  private async generateContextContent(): Promise<string> {
    const timestamp = new Date().toLocaleString();
    const vaultStats = await this.getVaultStatistics();
    const plugins = await this.pluginDetector.detectInstalledPlugins();
    const recentFiles = await this.getRecentFiles();
    const projectContext = await this.detectProjectContext();

    return `# Claude Context for ${this.app.vault.getName()}

*Last updated: ${timestamp}*

## 🧠 Vault Overview

This is my Obsidian vault where I ${projectContext.primaryUse}. Please help me work effectively within this knowledge base.

### Vault Statistics
- **Total Notes**: ${vaultStats.totalNotes}
- **Total Folders**: ${vaultStats.totalFolders}
- **Recent Activity**: ${vaultStats.recentActivity}
- **Primary Topics**: ${projectContext.topics.join(', ')}

## 🎯 Current Focus

### Recent Files
${recentFiles.map(f => `- [[${f.basename}]] - ${this.getFileContext(f)}`).join('\n')}

### Active Projects
${projectContext.activeProjects.map((p: any) => `- **${p.name}**: ${p.description}`).join('\n')}

## 🔌 Available Plugin Capabilities

You can leverage these installed Obsidian plugins to enhance your assistance:

${this.formatPluginCapabilities(plugins)}

## 📋 My Preferences

### Writing Style
- ${projectContext.writingStyle}

### Common Tasks
${projectContext.commonTasks.map((task: string) => `- ${task}`).join('\n')}

### Important Context
${projectContext.importantNotes}

## 🛡️ Privacy Notes

Please remember:
- You only have access to files within this Obsidian vault
- Respect any patterns marked as private in my .claude/config.json files
- Some folders may have restricted access based on my privacy settings

## 💡 How to Best Assist Me

1. **Understand my vault structure** - I organize content by ${projectContext.organizationMethod}
2. **Use available plugins** - Leverage the capabilities listed above
3. **Maintain consistency** - Follow my existing patterns and conventions
4. **Suggest connections** - Help me discover relationships between notes
5. **Respect my workflow** - Enhance rather than replace my processes

## 🚀 Triple-Crown Capabilities

You're integrated through Triple-Crown, which provides:
- **Actions**: Writing Assistant, Tag Builder, Connection Finder, Research Assistant, Code Reviewer, Peer Reviewer
- **Custom Actions**: ${this.settings.customActions.length} custom actions configured
- **Enhanced Context**: Automatic vault awareness and plugin integration

---
*This file is automatically maintained by Triple-Crown to provide context for AI assistance.*`;
  }

  private async getVaultStatistics(): Promise<any> {
    const files = this.app.vault.getFiles();
    const folders = this.getAllFolders();
    const recentFiles = files
      .filter(f => f.extension === 'md')
      .sort((a, b) => b.stat.mtime - a.stat.mtime)
      .slice(0, 5);

    return {
      totalNotes: files.filter(f => f.extension === 'md').length,
      totalFolders: folders.length,
      recentActivity: recentFiles.length > 0 ? `Last modified ${this.getRelativeTime(recentFiles[0].stat.mtime)}` : 'No recent activity'
    };
  }

  private getAllFolders(): string[] {
    const folders = new Set<string>();
    this.app.vault.getFiles().forEach(file => {
      const parts = file.path.split('/');
      for (let i = 1; i < parts.length; i++) {
        folders.add(parts.slice(0, i).join('/'));
      }
    });
    return Array.from(folders);
  }

  private async getRecentFiles(): Promise<TFile[]> {
    return this.app.vault.getFiles()
      .filter(f => f.extension === 'md' && f.path !== 'CLAUDE.md')
      .sort((a, b) => b.stat.mtime - a.stat.mtime)
      .slice(0, 10);
  }

  private getFileContext(file: TFile): string {
    const age = this.getRelativeTime(file.stat.mtime);
    const folder = file.parent?.path || 'root';
    return `${folder}, modified ${age}`;
  }

  private getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  private async detectProjectContext(): Promise<any> {
    const files = this.app.vault.getFiles();
    const folders = this.getAllFolders();
    
    // Analyze vault to understand user's context
    const hasResearch = folders.some(f => f.toLowerCase().includes('research'));
    const hasJournal = folders.some(f => f.toLowerCase().includes('journal') || f.toLowerCase().includes('daily'));
    const hasProjects = folders.some(f => f.toLowerCase().includes('project'));
    const hasCode = files.some(f => ['js', 'ts', 'py', 'java'].includes(f.extension));
    
    // Detect primary use
    let primaryUse = 'manage my knowledge and ideas';
    if (hasResearch) primaryUse = 'conduct research and organize academic materials';
    else if (hasJournal) primaryUse = 'maintain a personal journal and reflect on ideas';
    else if (hasProjects) primaryUse = 'manage projects and track progress';
    else if (hasCode) primaryUse = 'document code and technical knowledge';

    // Detect topics from folder names and file names
    const topics = this.extractTopics(files, folders);
    
    // Detect writing style from recent content
    const writingStyle = await this.detectWritingStyle(files);
    
    // Common tasks based on vault structure
    const commonTasks = this.detectCommonTasks(folders, files);

    // Active projects
    const activeProjects = this.detectActiveProjects(folders, files);

    return {
      primaryUse,
      topics: topics.slice(0, 5),
      writingStyle,
      commonTasks,
      activeProjects,
      organizationMethod: this.detectOrganizationMethod(folders),
      importantNotes: 'Please check .claude/config.json files for folder-specific instructions.'
    };
  }

  private extractTopics(files: TFile[], folders: string[]): string[] {
    const topicWords = new Map<string, number>();
    
    // Extract from folder names
    folders.forEach(folder => {
      const words = folder.split('/').pop()?.split(/[-_\s]/) || [];
      words.forEach(word => {
        if (word.length > 3) {
          topicWords.set(word, (topicWords.get(word) || 0) + 2);
        }
      });
    });

    // Extract from file names
    files.forEach(file => {
      const words = file.basename.split(/[-_\s]/);
      words.forEach(word => {
        if (word.length > 3) {
          topicWords.set(word, (topicWords.get(word) || 0) + 1);
        }
      });
    });

    // Sort by frequency and return top topics
    return Array.from(topicWords.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic)
      .filter(topic => !['note', 'notes', 'file', 'folder', 'new'].includes(topic.toLowerCase()));
  }

  private async detectWritingStyle(files: TFile[]): Promise<string> {
    // This is a simplified detection - could be enhanced
    const recentMdFiles = files
      .filter(f => f.extension === 'md')
      .sort((a, b) => b.stat.mtime - a.stat.mtime)
      .slice(0, 5);

    if (recentMdFiles.length === 0) return 'Concise and organized';

    // Check for common patterns
    let hasHeaders = false;
    let hasBullets = false;
    let hasCode = false;

    for (const file of recentMdFiles) {
      try {
        const content = await this.app.vault.cachedRead(file);
        if (content.includes('#')) hasHeaders = true;
        if (content.includes('- ') || content.includes('* ')) hasBullets = true;
        if (content.includes('```')) hasCode = true;
      } catch (e) {
        // Skip files that can't be read
      }
    }

    if (hasCode) return 'Technical with code examples';
    if (hasHeaders && hasBullets) return 'Structured with clear hierarchies';
    if (hasBullets) return 'List-oriented and concise';
    return 'Paragraph-based and descriptive';
  }

  private detectCommonTasks(folders: string[], files: TFile[]): string[] {
    const tasks: string[] = [];

    if (folders.some(f => f.includes('daily') || f.includes('journal'))) {
      tasks.push('Daily journaling and reflection');
    }
    if (folders.some(f => f.includes('meeting'))) {
      tasks.push('Meeting notes and follow-ups');
    }
    if (folders.some(f => f.includes('research'))) {
      tasks.push('Research documentation and synthesis');
    }
    if (folders.some(f => f.includes('project'))) {
      tasks.push('Project planning and tracking');
    }
    if (files.some(f => f.basename.toLowerCase().includes('todo') || f.basename.includes('task'))) {
      tasks.push('Task management and planning');
    }

    if (tasks.length === 0) {
      tasks.push('Note-taking and knowledge management');
    }

    return tasks;
  }

  private detectActiveProjects(folders: string[], files: TFile[]): any[] {
    const projects: any[] = [];
    const projectFolders = folders.filter(f => 
      f.toLowerCase().includes('project') || 
      f.toLowerCase().includes('work') ||
      f.toLowerCase().includes('research')
    );

    // Get recently modified files in project folders
    const recentProjectFiles = files
      .filter(f => projectFolders.some(pf => f.path.startsWith(pf)))
      .sort((a, b) => b.stat.mtime - a.stat.mtime)
      .slice(0, 3);

    recentProjectFiles.forEach(file => {
      const projectName = file.path.split('/')[0];
      if (!projects.find(p => p.name === projectName)) {
        projects.push({
          name: projectName,
          description: `Active work in ${projectName} folder`
        });
      }
    });

    return projects.slice(0, 3);
  }

  private detectOrganizationMethod(folders: string[]): string {
    if (folders.some(f => f.match(/^\d{4}/) || f.includes('archive'))) {
      return 'chronological/temporal organization';
    }
    if (folders.some(f => f.includes('project'))) {
      return 'project-based folders';
    }
    if (folders.some(f => f.includes('topic') || f.includes('subject'))) {
      return 'topic-based categorization';
    }
    if (folders.length > 20) {
      return 'hierarchical folder structure';
    }
    return 'simple folder organization';
  }

  private formatPluginCapabilities(plugins: DetectedPlugin[]): string {
    const enabledPlugins = plugins.filter(p => p.enabled && p.integration.supportLevel !== 'none');
    
    if (enabledPlugins.length === 0) {
      return '- No integrated plugins detected. Install plugins like Dataview, Templater, or Citations to enhance my capabilities.';
    }

    return enabledPlugins.map(plugin => {
      let capabilities = '';
      
      switch (plugin.id) {
        case 'dataview':
          capabilities = `
- **${plugin.name}** - I can help you create dataview queries to analyze your vault:
  - \`\`\`dataview LIST\`\`\` queries to find and filter notes
  - \`\`\`dataview TABLE\`\`\` for structured data views
  - Complex queries with WHERE, SORT, and GROUP BY clauses`;
          break;
          
        case 'templater-obsidian':
          capabilities = `
- **${plugin.name}** - I can generate Templater-compatible templates:
  - Dynamic variables like <% tp.date.now() %>
  - JavaScript expressions for advanced automation
  - Template suggestions for your common note types`;
          break;
          
        case 'obsidian-citation-plugin':
          capabilities = `
- **${plugin.name}** - I can help with academic citations:
  - Format citations in various styles (APA, MLA, Chicago)
  - Generate bibliographies from your references
  - Convert between citation formats`;
          break;
          
        case 'calendar':
          capabilities = `
- **${plugin.name}** - I understand your date-based organization:
  - Reference daily notes and weekly reviews
  - Create time-aware content
  - Suggest date-based connections`;
          break;
          
        case 'obsidian-kanban':
          capabilities = `
- **${plugin.name}** - I can work with your kanban boards:
  - Suggest task organization strategies
  - Format content for kanban cards
  - Help with project workflow optimization`;
          break;
          
        default:
          if (plugin.integration.enhancedPrompts) {
            capabilities = `
- **${plugin.name}** - Enhanced integration available`;
          }
      }
      
      return capabilities;
    }).join('\n');
  }

  async updateContextPeriodically(): Promise<void> {
    // Update context every hour while plugin is active
    setInterval(() => {
      this.updateContext();
    }, 3600000); // 1 hour
  }
}