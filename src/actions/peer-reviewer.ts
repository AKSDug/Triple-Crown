/**
 * Triple-Crown Obsidian Plugin - Peer Reviewer Action
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

export class PeerReviewerAction extends BaseAction {
  constructor(app: App, claudeService: ClaudeService) {
    const config: ActionConfig = {
      id: 'peer-reviewer',
      name: 'Peer Reviewer',
      description: 'Academic peer review for research papers, proposals, and scholarly writing',
      enabled: true,
      category: ActionCategory.REVIEW,
      requiresSelection: false,
      supportedFileTypes: ['md']
    };
    
    super(app, claudeService, config);
  }

  async execute(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.canExecute(editor, view)) {
      new Notice('Peer Reviewer cannot be executed in current context');
      return;
    }

    const selectedText = editor.getSelection();
    const content = selectedText || editor.getValue();

    if (!content.trim()) {
      new Notice('No content to review');
      return;
    }

    try {
      new Notice('Conducting peer review analysis...');

      const documentType = this.detectDocumentType(content);
      const fileContext = view.file ? await this.getFileContext(view.file) : '';
      
      const request: ClaudeRequest = {
        prompt: this.buildPeerReviewMessage(content, documentType, fileContext),
        context: `Academic peer review of ${documentType}`,
        action: 'peer-reviewer',
        file: view.file?.path
      };

      const response = await this.claudeService.sendRequest(request);
      
      await this.insertPeerReview(editor, response.content, selectedText ? true : false);
      new Notice('Peer review completed');

    } catch (error) {
      console.error('Peer reviewer error:', error);
      new Notice('Error conducting peer review: ' + error.message);
    }
  }

  protected getSystemPrompt(): string {
    return `You are an experienced academic peer reviewer providing constructive feedback on scholarly work. Your review should be thorough, fair, and helpful for improving the work.

REVIEW CRITERIA:
1. **Originality & Significance**: Novel contributions and importance to field
2. **Methodology**: Research design, data collection, analysis methods
3. **Clarity & Organization**: Structure, flow, readability
4. **Evidence & Support**: Citations, data quality, argument strength
5. **Technical Quality**: Accuracy, rigor, reproducibility
6. **Ethical Considerations**: Research ethics, bias, limitations

OUTPUT FORMAT:
## Peer Review

### Summary
Brief assessment of the work's contributions and overall quality.

### Strengths
- Key positive aspects
- Notable contributions
- Well-executed elements

### Areas for Improvement

**Major Issues**
- Significant concerns that affect validity/impact
- Methodological problems
- Missing critical elements

**Minor Issues**
- Clarity improvements
- Formatting/style suggestions
- Additional references needed

### Specific Comments
- Section-by-section feedback
- Line-by-line suggestions where relevant

### Recommendation
- Accept/Minor Revisions/Major Revisions/Reject
- Justification for recommendation

### Additional Suggestions
- Future research directions
- Related work to consider

Maintain academic objectivity while being constructive and encouraging. Focus on helping improve the work rather than just identifying problems.`;
  }

  private detectDocumentType(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('abstract') && lowerContent.includes('methodology')) return 'Research Paper';
    if (lowerContent.includes('hypothesis') && lowerContent.includes('experiment')) return 'Research Paper';
    if (lowerContent.includes('literature review') || lowerContent.includes('systematic review')) return 'Literature Review';
    if (lowerContent.includes('proposal') && lowerContent.includes('budget')) return 'Research Proposal';
    if (lowerContent.includes('thesis') && lowerContent.includes('chapter')) return 'Thesis';
    if (lowerContent.includes('conference') && lowerContent.includes('presentation')) return 'Conference Paper';
    if (lowerContent.includes('introduction') && lowerContent.includes('conclusion')) return 'Academic Paper';
    
    return 'Academic Document';
  }

  private buildPeerReviewMessage(content: string, documentType: string, context?: string): string {
    let message = `Please conduct a thorough peer review of this ${documentType}:\n\n${content}`;
    
    if (context) {
      message += `\n\nAdditional Context:\n${context}`;
    }
    
    message += `\n\nPlease provide constructive feedback focusing on academic rigor, clarity, and potential improvements.`;
    
    return message;
  }

  private async insertPeerReview(editor: Editor, review: string, hasSelection: boolean): Promise<void> {
    const timestamp = new Date().toLocaleString();
    const reviewText = `\n\n---\n## Peer Review - ${timestamp}\n\n${review}\n\n---\n`;
    
    if (hasSelection) {
      const selection = editor.getSelection();
      editor.replaceSelection(selection + reviewText);
    } else {
      const content = editor.getValue();
      editor.setValue(content + reviewText);
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