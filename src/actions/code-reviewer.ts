/**
 * Triple-Crown Obsidian Plugin - Code Reviewer Action
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

export class CodeReviewerAction extends BaseAction {
  constructor(app: App, claudeService: ClaudeService) {
    const config: ActionConfig = {
      id: 'code-reviewer',
      name: 'Code Reviewer',
      description: 'Technical code review focusing on security, performance, and best practices',
      enabled: true,
      category: ActionCategory.REVIEW,
      requiresSelection: true,
      supportedFileTypes: ['md', 'js', 'ts', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php', 'rb', 'swift', 'kt']
    };
    
    super(app, claudeService, config);
  }

  async execute(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.canExecute(editor, view)) {
      new Notice('Code Reviewer requires selected code');
      return;
    }

    const selectedText = editor.getSelection();
    const fileExtension = view.file?.extension || 'md';

    if (!selectedText || !selectedText.trim()) {
      new Notice('Please select code to review');
      return;
    }

    try {
      new Notice('Analyzing code for review...');

      const language = this.detectLanguage(selectedText, fileExtension);
      const fileContext = view.file ? await this.getFileContext(view.file) : '';
      
      const request: ClaudeRequest = {
        prompt: this.buildCodeReviewMessage(selectedText, language, fileContext),
        context: `Code review for ${language} code`,
        action: 'code-reviewer',
        file: view.file?.path
      };

      const response = await this.claudeService.sendRequest(request);
      
      await this.insertCodeReview(editor, response.content);
      new Notice('Code review completed');

    } catch (error) {
      console.error('Code reviewer error:', error);
      new Notice('Error reviewing code: ' + error.message);
    }
  }

  protected getSystemPrompt(): string {
    return `You are an expert code reviewer focused on security, performance, maintainability, and best practices. Provide constructive, actionable feedback.

REVIEW AREAS:
1. **Security**: Vulnerabilities, input validation, authentication/authorization
2. **Performance**: Efficiency, scalability, resource usage
3. **Maintainability**: Code clarity, documentation, structure
4. **Best Practices**: Language conventions, design patterns, error handling
5. **Testing**: Test coverage, edge cases, testability

OUTPUT FORMAT:
## Code Review

### Summary
Brief overview of code quality and main concerns.

### Issues Found
**🔴 Critical Issues**
- Issue description with specific line references
- Security vulnerabilities or major bugs

**🟡 Improvements**
- Performance optimizations
- Code quality improvements
- Best practice violations

**🟢 Minor Suggestions**
- Style improvements
- Documentation enhancements

### Positive Aspects
- What the code does well
- Good practices observed

### Recommendations
- Prioritized action items
- Alternative approaches

Keep feedback specific, constructive, and educational. Focus on defensive security practices.`;
  }

  private detectLanguage(code: string, fileExtension: string): string {
    // Map file extensions to languages
    const extensionMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'rs': 'Rust',
      'php': 'PHP',
      'rb': 'Ruby',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'md': this.detectCodeBlockLanguage(code)
    };

    return extensionMap[fileExtension] || 'Unknown';
  }

  private detectCodeBlockLanguage(code: string): string {
    // Try to detect language from markdown code blocks
    const codeBlockMatch = code.match(/```(\w+)/);
    if (codeBlockMatch) {
      return codeBlockMatch[1];
    }

    // Basic heuristics for common languages
    if (code.includes('function') && code.includes('{')) return 'JavaScript';
    if (code.includes('def ') && code.includes(':')) return 'Python';
    if (code.includes('public class') || code.includes('import java')) return 'Java';
    if (code.includes('#include') || code.includes('int main')) return 'C/C++';

    return 'Generic';
  }

  private buildCodeReviewMessage(code: string, language: string, context?: string): string {
    let message = `Please review this ${language} code:\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
    
    if (context) {
      message += `\n\nContext:\n${context}`;
    }
    
    return message;
  }

  private async insertCodeReview(editor: Editor, review: string): Promise<void> {
    const timestamp = new Date().toLocaleString();
    const reviewText = `\n\n---\n## Code Review - ${timestamp}\n\n${review}\n\n---\n`;
    
    const selection = editor.getSelection();
    editor.replaceSelection(selection + reviewText);
  }

  private async getFileContext(file: any): Promise<string> {
    try {
      return await this.claudeService.getContextForFile(file.path);
    } catch (error) {
      return '';
    }
  }
}