/**
 * Triple-Crown Obsidian Plugin - Connection Finder Action
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { App, Editor, MarkdownView, Notice } from 'obsidian';
import { ClaudeService, ClaudeRequest } from '../claude-service';
import { BaseAction, ActionConfig, ActionCategory } from './base-action';

export class ConnectionFinderAction extends BaseAction {
  constructor(app: App, claudeService: ClaudeService) {
    const config: ActionConfig = {
      id: 'connection-finder',
      name: 'Connection Finder',
      description: 'Discover relationships and connections between notes, concepts, and ideas',
      enabled: true,
      category: ActionCategory.ANALYSIS,
      requiresSelection: false,
      supportedFileTypes: ['md']
    };
    
    super(app, claudeService, config);
  }

  async execute(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.canExecute(editor, view)) {
      new Notice('Connection Finder cannot be executed in current context');
      return;
    }

    const selectedText = editor.getSelection();
    const content = selectedText || editor.getValue();
    const file = view.file;

    if (!content.trim()) {
      new Notice('No content to analyze for connections');
      return;
    }

    try {
      new Notice('Analyzing content for connections...');

      const vaultContext = await this.getVaultContext();
      const fileContext = file ? await this.getFileContext(file) : '';
      
      const request: ClaudeRequest = {
        prompt: this.buildUserMessage(content, vaultContext + '\n\n' + fileContext),
        context: vaultContext,
        action: 'connection-finder',
        file: file?.path
      };

      const response = await this.claudeService.sendRequest(request);
      
      const connections = this.parseConnections(response.content);
      
      if (connections.length > 0) {
        await this.insertConnections(editor, connections, selectedText ? true : false);
        new Notice(`Found ${connections.length} potential connections`);
      } else {
        new Notice('No meaningful connections identified');
      }

    } catch (error) {
      console.error('Connection finder error:', error);
      new Notice('Error finding connections: ' + error.message);
    }
  }

  protected getSystemPrompt(): string {
    return `You are a connection finder for Obsidian notes. Your job is to identify meaningful relationships, patterns, and connections within content and across the vault.

ANALYSIS FOCUS:
- Conceptual relationships between ideas
- Cross-references to other notes or topics
- Thematic patterns and recurring concepts
- Causal relationships and dependencies
- Similar methodologies or approaches
- Historical or temporal connections
- Contradictions or opposing viewpoints

OUTPUT FORMAT:
Provide connections in this format:

## Potential Connections

### Direct Links
- [[Note Name]] - Brief explanation of connection
- [[Another Note]] - Why this relates

### Conceptual Relationships
- **Theme**: Connection description
- **Pattern**: Pattern description

### Questions for Exploration
- Question that could lead to new connections
- Another investigative question

Keep suggestions concrete and actionable. Focus on connections that would genuinely help with knowledge management and understanding.`;
  }

  private parseConnections(response: string): Connection[] {
    const connections: Connection[] = [];
    const lines = response.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('### ')) {
        currentSection = trimmed.substring(4);
        continue;
      }
      
      if (trimmed.startsWith('- ')) {
        const connectionText = trimmed.substring(2);
        
        // Parse different connection types
        if (connectionText.includes('[[') && connectionText.includes(']]')) {
          // Direct link connection
          const match = connectionText.match(/\[\[([^\]]+)\]\]\s*-\s*(.+)/);
          if (match) {
            connections.push({
              type: 'link',
              target: match[1],
              description: match[2],
              section: currentSection
            });
          }
        } else if (connectionText.includes('**') && connectionText.includes('**:')) {
          // Conceptual connection
          const match = connectionText.match(/\*\*([^*]+)\*\*:\s*(.+)/);
          if (match) {
            connections.push({
              type: 'concept',
              target: match[1],
              description: match[2],
              section: currentSection
            });
          }
        } else if (currentSection.toLowerCase().includes('question')) {
          // Question connection
          connections.push({
            type: 'question',
            target: '',
            description: connectionText,
            section: currentSection
          });
        }
      }
    }
    
    return connections;
  }

  private async insertConnections(editor: Editor, connections: Connection[], hasSelection: boolean): Promise<void> {
    let output = '\n\n## Discovered Connections\n\n';
    
    const linkConnections = connections.filter(c => c.type === 'link');
    const conceptConnections = connections.filter(c => c.type === 'concept');
    const questionConnections = connections.filter(c => c.type === 'question');
    
    if (linkConnections.length > 0) {
      output += '### Related Notes\n';
      linkConnections.forEach(conn => {
        output += `- [[${conn.target}]] - ${conn.description}\n`;
      });
      output += '\n';
    }
    
    if (conceptConnections.length > 0) {
      output += '### Conceptual Links\n';
      conceptConnections.forEach(conn => {
        output += `- **${conn.target}**: ${conn.description}\n`;
      });
      output += '\n';
    }
    
    if (questionConnections.length > 0) {
      output += '### Exploration Questions\n';
      questionConnections.forEach(conn => {
        output += `- ${conn.description}\n`;
      });
      output += '\n';
    }
    
    if (hasSelection) {
      const selection = editor.getSelection();
      editor.replaceSelection(selection + output);
    } else {
      const content = editor.getValue();
      editor.setValue(content + output);
    }
  }

  private async getVaultContext(): Promise<string> {
    try {
      const files = this.app.vault.getMarkdownFiles();
      const recentFiles = files
        .sort((a, b) => b.stat.mtime - a.stat.mtime)
        .slice(0, 20)
        .map(f => f.basename);
      
      return `Available notes in vault (recent): ${recentFiles.join(', ')}`;
    } catch (error) {
      return '';
    }
  }

  private async getFileContext(file: any): Promise<string> {
    try {
      return await this.claudeService.getContextForFile(file.path);
    } catch (error) {
      return '';
    }
  }
}

interface Connection {
  type: 'link' | 'concept' | 'question';
  target: string;
  description: string;
  section: string;
}