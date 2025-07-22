/**
 * Triple-Crown Obsidian Plugin - Tag Builder Action
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

export class TagBuilderAction extends BaseAction {
  constructor(app: App, claudeService: ClaudeService) {
    const config: ActionConfig = {
      id: 'tag-builder',
      name: 'Tag Builder',
      description: 'Generate smart tags for content based on themes, topics, and context',
      enabled: true,
      category: ActionCategory.ORGANIZATION,
      requiresSelection: false,
      supportedFileTypes: ['md']
    };
    
    super(app, claudeService, config);
  }

  async execute(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.canExecute(editor, view)) {
      new Notice('Tag Builder cannot be executed in current context');
      return;
    }

    const selectedText = editor.getSelection();
    const content = selectedText || editor.getValue();
    const file = view.file;

    if (!content.trim()) {
      new Notice('No content to analyze for tags');
      return;
    }

    try {
      new Notice('Analyzing content and generating tags...');

      const context = file ? await this.getFileContext(file) : '';
      
      const request: ClaudeRequest = {
        prompt: this.buildUserMessage(content, context),
        context: context,
        action: 'tag-builder',
        file: file?.path
      };

      const response = await this.claudeService.sendRequest(request);
      
      // Parse suggested tags from response
      const tags = this.parseTags(response.content);
      
      if (tags.length > 0) {
        await this.insertTags(editor, tags, selectedText ? true : false);
        new Notice(`Generated ${tags.length} tags successfully`);
      } else {
        new Notice('No suitable tags could be generated');
      }

    } catch (error) {
      console.error('Tag builder error:', error);
      new Notice('Error generating tags: ' + error.message);
    }
  }

  protected getSystemPrompt(): string {
    return `You are a smart tag generator for Obsidian notes. Your job is to analyze content and suggest relevant, useful tags.

GUIDELINES:
- Generate 3-8 relevant tags based on the content
- Use lowercase, hyphenated format (e.g., "machine-learning", "personal-development")
- Focus on themes, topics, concepts, and categories
- Avoid generic tags like "note" or "text"
- Consider the vault context if provided
- Make tags specific enough to be useful for filtering and organization

OUTPUT FORMAT:
Return only the tags, one per line, starting each with #
Example:
#artificial-intelligence
#research-methods
#productivity-tools
#personal-notes`;
  }

  private parseTags(response: string): string[] {
    const lines = response.split('\n');
    const tags: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        // Clean up the tag (remove # and validate format)
        const tag = trimmed.substring(1).toLowerCase().replace(/[^a-z0-9-]/g, '-');
        if (tag && tag.length > 1) {
          tags.push(tag);
        }
      }
    }
    
    return tags;
  }

  private async insertTags(editor: Editor, tags: string[], hasSelection: boolean): Promise<void> {
    const tagText = tags.map(tag => `#${tag}`).join(' ');
    
    if (hasSelection) {
      // Append tags to selection
      const selection = editor.getSelection();
      const newText = `${selection}\n\nTags: ${tagText}`;
      editor.replaceSelection(newText);
    } else {
      // Check if file already has frontmatter
      const content = editor.getValue();
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (frontmatterMatch) {
        // Add to existing frontmatter
        const frontmatter = frontmatterMatch[1];
        if (frontmatter.includes('tags:')) {
          // Append to existing tags
          const newContent = content.replace(
            /tags:\s*\[(.*?)\]/,
            (match, existingTags) => {
              const existing = existingTags ? existingTags.split(',').map((t: string) => t.trim()) : [];
              const allTags = [...existing, ...tags.map(t => `"${t}"`)];
              return `tags: [${allTags.join(', ')}]`;
            }
          );
          editor.setValue(newContent);
        } else {
          // Add tags field to frontmatter
          const newFrontmatter = frontmatter + `\ntags: [${tags.map(t => `"${t}"`).join(', ')}]`;
          const newContent = content.replace(frontmatterMatch[0], `---\n${newFrontmatter}\n---`);
          editor.setValue(newContent);
        }
      } else {
        // Add frontmatter with tags
        const frontmatter = `---\ntags: [${tags.map(t => `"${t}"`).join(', ')}]\n---\n\n`;
        editor.setValue(frontmatter + content);
      }
    }
  }

  private async getFileContext(file: any): Promise<string> {
    try {
      const vaultPath = (this.app.vault.adapter as any).path || '';
      return await this.claudeService.getContextForFile(file.path);
    } catch (error) {
      return '';
    }
  }
}