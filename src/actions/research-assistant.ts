/**
 * Triple-Crown Obsidian Plugin - Research Assistant Action
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

export class ResearchAssistantAction extends BaseAction {
  constructor(app: App, claudeService: ClaudeService) {
    const config: ActionConfig = {
      id: 'research-assistant',
      name: 'Research Assistant',
      description: 'Aggregate sources, create link trees, and organize research materials',
      enabled: true,
      category: ActionCategory.ANALYSIS,
      requiresSelection: false,
      supportedFileTypes: ['md']
    };
    
    super(app, claudeService, config);
  }

  async execute(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.canExecute(editor, view)) {
      new Notice('Research Assistant cannot be executed in current context');
      return;
    }

    const selectedText = editor.getSelection();
    const content = selectedText || editor.getValue();
    const file = view.file;

    if (!content.trim()) {
      new Notice('No content to analyze for research aggregation');
      return;
    }

    try {
      new Notice('Analyzing sources and creating research structure...');

      const vaultContext = await this.getVaultContext();
      const fileContext = file ? await this.getFileContext(file) : '';
      
      const request: ClaudeRequest = {
        prompt: this.buildResearchMessage(content, vaultContext, fileContext),
        context: `Research analysis for ${file?.name || 'untitled'}`,
        action: 'research-assistant',
        file: file?.path
      };

      const response = await this.claudeService.sendRequest(request);
      
      await this.insertResearchStructure(editor, response.content, selectedText ? true : false);
      new Notice('Research structure generated successfully');

    } catch (error) {
      console.error('Research assistant error:', error);
      new Notice('Error generating research structure: ' + error.message);
    }
  }

  protected getSystemPrompt(): string {
    return `You are a research assistant specialized in organizing and structuring research materials, sources, and creating comprehensive link trees.

CORE FUNCTIONS:
1. SOURCE AGGREGATION: Extract and categorize all sources, references, and citations
2. LINK TREE CREATION: Build hierarchical structures showing relationships between concepts
3. RESEARCH ORGANIZATION: Create systematic frameworks for knowledge management
4. GAP ANALYSIS: Identify missing information and suggest research directions

ANALYSIS APPROACH:
- Extract all URLs, citations, and references
- Identify key themes, topics, and concepts
- Map relationships between sources and ideas
- Create actionable research pathways
- Suggest organizational structures

OUTPUT REQUIREMENTS:
- Clear hierarchical link trees
- Categorized source lists with descriptions
- Research roadmaps and next steps
- Cross-references and connections
- Actionable recommendations

FORMAT SPECIFICATIONS:
- Use markdown linking for internal connections
- Create collapsible sections for complex hierarchies
- Include metadata and context for each source
- Provide both overview and detailed breakdowns
- Maintain academic rigor and citation standards

Focus on creating practical, navigable research structures that enhance knowledge discovery and organization.`;
  }

  private buildResearchMessage(content: string, vaultContext: string, fileContext: string): string {
    return `Please analyze this research content and create a comprehensive research structure:

CONTENT TO ANALYZE:
${content}

VAULT CONTEXT:
${vaultContext}

FILE CONTEXT:
${fileContext}

Please provide:
1. Source aggregation and categorization
2. Link tree showing concept relationships
3. Research organization framework
4. Identified gaps and next steps
5. Cross-reference suggestions`;
  }

  private async insertResearchStructure(editor: Editor, structure: string, hasSelection: boolean): Promise<void> {
    const timestamp = new Date().toLocaleString();
    const researchText = `\n\n---\n## Research Structure - ${timestamp}\n\n${structure}\n\n---\n`;
    
    if (hasSelection) {
      const selection = editor.getSelection();
      editor.replaceSelection(selection + researchText);
    } else {
      const content = editor.getValue();
      editor.setValue(content + researchText);
    }
  }

  private async getVaultContext(): Promise<string> {
    try {
      const files = this.app.vault.getMarkdownFiles();
      
      // Get research-related files
      const researchFiles = files.filter(f => 
        f.name.toLowerCase().includes('research') ||
        f.name.toLowerCase().includes('source') ||
        f.name.toLowerCase().includes('reference') ||
        f.path.includes('research') ||
        f.path.includes('sources')
      );

      const recentFiles = files
        .sort((a, b) => b.stat.mtime - a.stat.mtime)
        .slice(0, 10);

      return `
VAULT RESEARCH CONTEXT:
Research files found: ${researchFiles.map(f => f.basename).join(', ')}
Recent files: ${recentFiles.map(f => f.basename).join(', ')}
Total notes: ${files.length}
      `.trim();
    } catch (error) {
      return 'Vault context unavailable';
    }
  }

  private async getFileContext(file: any): Promise<string> {
    try {
      const context = await this.claudeService.getContextForFile(file.path);
      
      // Also check for related files
      const files = this.app.vault.getMarkdownFiles();
      const relatedFiles = files.filter(f => 
        f.path !== file.path && (
          f.name.includes(file.basename) ||
          file.basename.includes(f.name) ||
          this.sharesSimilarPath(f.path, file.path)
        )
      );

      return `${context}

RELATED FILES:
${relatedFiles.map(f => `- [[${f.basename}]]`).join('\n')}`;
    } catch (error) {
      return '';
    }
  }

  private sharesSimilarPath(path1: string, path2: string): boolean {
    const parts1 = path1.split('/');
    const parts2 = path2.split('/');
    
    // Check if they share the same directory structure
    for (let i = 0; i < Math.min(parts1.length - 1, parts2.length - 1); i++) {
      if (parts1[i] === parts2[i]) {
        return true;
      }
    }
    
    return false;
  }
}