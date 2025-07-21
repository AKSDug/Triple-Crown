/**
 * Triple-Crown Obsidian Plugin - Writing Assistant
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { App, Editor, MarkdownView, Notice, TFile } from 'obsidian';
import { ClaudeService, ClaudeRequest } from '../claude-service';
import * as path from 'path';

export class WritingAssistantAction {
  private app: App;
  private claudeService: ClaudeService;

  constructor(app: App, claudeService: ClaudeService) {
    this.app = app;
    this.claudeService = claudeService;
  }

  async execute(editor: Editor, view: MarkdownView): Promise<void> {
    const selectedText = editor.getSelection();
    const fullText = editor.getValue();
    const file = view.file;

    if (!selectedText && !fullText) {
      new Notice('No text to process');
      return;
    }

    const textToProcess = selectedText || fullText;
    
    try {
      new Notice('Processing with Claude...');
      
      const request: ClaudeRequest = {
        prompt: `Please improve this text by making it clearer, more engaging, and better structured. Maintain the original meaning and tone:\n\n${textToProcess}`,
        context: await this.getContext(file),
        action: 'writing-assistant',
        file: file?.path
      };

      const response = await this.claudeService.sendRequest(request);
      
      if (selectedText) {
        editor.replaceSelection(response.content);
      } else {
        editor.setValue(response.content);
      }

      new Notice('Text improved successfully');

      // Show reasoning if available
      if (response.reasoning) {
        this.showReasoning(response.reasoning);
      }

    } catch (error) {
      console.error('Writing assistant error:', error);
      new Notice('Error processing text: ' + error.message);
    }
  }

  async duplicateAndEdit(editor: Editor, view: MarkdownView): Promise<void> {
    const file = view.file;
    if (!file) {
      new Notice('No active file');
      return;
    }

    const originalContent = editor.getValue();
    
    try {
      new Notice('Creating duplicate and editing...');
      
      const request: ClaudeRequest = {
        prompt: `Please improve this text by making it clearer, more engaging, and better structured. Maintain the original meaning and tone:\n\n${originalContent}`,
        context: await this.getContext(file),
        action: 'duplicate-and-edit',
        file: file.path
      };

      const response = await this.claudeService.sendRequest(request);
      
      // Create duplicate file
      const duplicateFile = await this.createDuplicateFile(file, response.content, response.reasoning);
      
      // Show changes inline
      const changesContent = this.generateChangesView(originalContent, response.content, response.reasoning);
      
      // Open the duplicate file
      await this.app.workspace.openLinkText(duplicateFile.path, '', true);
      
      new Notice('Duplicate created and edited successfully');

    } catch (error) {
      console.error('Duplicate and edit error:', error);
      new Notice('Error creating duplicate: ' + error.message);
    }
  }

  private async createDuplicateFile(originalFile: TFile, editedContent: string, reasoning?: string): Promise<TFile> {
    const originalPath = originalFile.path;
    const dir = path.dirname(originalPath);
    const baseName = path.basename(originalPath, path.extname(originalPath));
    const ext = path.extname(originalPath);
    
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const duplicateName = `${baseName}-claude-edit-${timestamp}${ext}`;
    const duplicatePath = path.join(dir, duplicateName);

    // Build content with metadata
    let content = editedContent;
    
    // Add frontmatter with metadata
    const frontmatter = `---
original: "[[${originalFile.basename}]]"
created: ${new Date().toISOString()}
type: claude-edit
---

`;

    content = frontmatter + content;

    // Add reasoning if available
    if (reasoning) {
      content += `\n\n---\n\n## Claude's Reasoning\n\n> ${reasoning}\n`;
    }

    // Create the file
    const duplicateFile = await this.app.vault.create(duplicatePath, content);
    
    // Add backlink to original file
    await this.addBacklinkToOriginal(originalFile, duplicateFile);
    
    return duplicateFile;
  }

  private async addBacklinkToOriginal(originalFile: TFile, duplicateFile: TFile): Promise<void> {
    try {
      const originalContent = await this.app.vault.read(originalFile);
      const backlink = `\n\n---\n\n## Claude Edits\n\n- [[${duplicateFile.basename}]] - ${new Date().toLocaleDateString()}\n`;
      
      // Check if backlinks section already exists
      if (!originalContent.includes('## Claude Edits')) {
        await this.app.vault.modify(originalFile, originalContent + backlink);
      } else {
        // Add to existing section
        const newLink = `- [[${duplicateFile.basename}]] - ${new Date().toLocaleDateString()}\n`;
        const updatedContent = originalContent.replace(
          /(## Claude Edits\n\n)/,
          `$1${newLink}`
        );
        await this.app.vault.modify(originalFile, updatedContent);
      }
    } catch (error) {
      console.error('Error adding backlink:', error);
      // Non-critical error, don't throw
    }
  }

  private generateChangesView(original: string, edited: string, reasoning?: string): string {
    // Simple diff implementation
    const originalLines = original.split('\n');
    const editedLines = edited.split('\n');
    
    let result = `# Changes Made\n\n`;
    
    if (reasoning) {
      result += `## Reasoning\n\n> ${reasoning}\n\n`;
    }
    
    result += `## Text Comparison\n\n`;
    result += `### Original\n\n${original}\n\n`;
    result += `### Edited\n\n${edited}\n\n`;
    
    // Add basic change indicators
    result += `## Summary\n\n`;
    result += `- Original length: ${original.length} characters\n`;
    result += `- Edited length: ${edited.length} characters\n`;
    result += `- Difference: ${edited.length - original.length} characters\n`;
    
    return result;
  }

  private async getContext(file: TFile | null): Promise<string> {
    if (!file) return '';
    
    try {
      const content = await this.app.vault.read(file);
      const metadata = this.app.metadataCache.getFileCache(file);
      
      let context = `File: ${file.path}\n\n`;
      
      if (metadata?.frontmatter) {
        context += `Frontmatter:\n${JSON.stringify(metadata.frontmatter, null, 2)}\n\n`;
      }
      
      if (metadata?.tags) {
        context += `Tags: ${metadata.tags.map(tag => tag.tag).join(', ')}\n\n`;
      }
      
      // Add nearby files context
      const nearbyFiles = await this.getNearbyFiles(file);
      if (nearbyFiles.length > 0) {
        context += `Nearby files: ${nearbyFiles.join(', ')}\n\n`;
      }
      
      return context;
    } catch (error) {
      console.error('Error getting context:', error);
      return '';
    }
  }

  private async getNearbyFiles(file: TFile): Promise<string[]> {
    const folder = file.parent;
    if (!folder) return [];
    
    const siblings = folder.children
      .filter(child => child instanceof TFile && child !== file)
      .slice(0, 5) // Limit to 5 nearby files
      .map(child => child.name);
    
    return siblings;
  }

  private showReasoning(reasoning: string): void {
    // Create a temporary notice with reasoning
    const notice = new Notice(`Claude's reasoning: ${reasoning}`, 10000);
    
    // Also log to console for debugging
    console.log('Claude reasoning:', reasoning);
  }

  // Additional action methods
  async improve(editor: Editor, view: MarkdownView): Promise<void> {
    await this.processWithPrompt(editor, view, 'Improve this text by making it clearer and more engaging:');
  }

  async expand(editor: Editor, view: MarkdownView): Promise<void> {
    await this.processWithPrompt(editor, view, 'Expand this text with more details and examples:');
  }

  async simplify(editor: Editor, view: MarkdownView): Promise<void> {
    await this.processWithPrompt(editor, view, 'Simplify this text to make it more accessible and easier to understand:');
  }

  async summarize(editor: Editor, view: MarkdownView): Promise<void> {
    await this.processWithPrompt(editor, view, 'Create a concise summary of this text:');
  }

  private async processWithPrompt(editor: Editor, view: MarkdownView, prompt: string): Promise<void> {
    const selectedText = editor.getSelection();
    const fullText = editor.getValue();
    const file = view.file;

    if (!selectedText && !fullText) {
      new Notice('No text to process');
      return;
    }

    const textToProcess = selectedText || fullText;
    
    try {
      new Notice('Processing with Claude...');
      
      const request: ClaudeRequest = {
        prompt: `${prompt}\n\n${textToProcess}`,
        context: await this.getContext(file),
        action: 'writing-assistant',
        file: file?.path
      };

      const response = await this.claudeService.sendRequest(request);
      
      if (selectedText) {
        editor.replaceSelection(response.content);
      } else {
        editor.setValue(response.content);
      }

      new Notice('Text processed successfully');

      if (response.reasoning) {
        this.showReasoning(response.reasoning);
      }

    } catch (error) {
      console.error('Processing error:', error);
      new Notice('Error processing text: ' + error.message);
    }
  }
}