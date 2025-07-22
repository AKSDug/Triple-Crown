/**
 * Triple-Crown Obsidian Plugin - Therapist Mode Action
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

export class TherapistModeAction extends BaseAction {
  constructor(app: App, claudeService: ClaudeService) {
    const config: ActionConfig = {
      id: 'therapist-mode',
      name: 'Therapist Mode',
      description: 'Reflective journaling assistant for self-exploration and emotional processing',
      enabled: false, // Disabled by default for privacy
      category: ActionCategory.WRITING,
      requiresSelection: false,
      supportedFileTypes: ['md']
    };
    
    super(app, claudeService, config);
  }

  async execute(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.canExecute(editor, view)) {
      new Notice('Therapist Mode cannot be executed in current context');
      return;
    }

    const selectedText = editor.getSelection();
    const content = selectedText || editor.getValue();

    if (!content.trim()) {
      new Notice('No content to reflect upon');
      return;
    }

    try {
      new Notice('Generating reflective insights...');
      
      const request: ClaudeRequest = {
        prompt: this.buildUserMessage(content),
        context: 'Personal reflection session',
        action: 'therapist-mode',
        file: view.file?.path
      };

      const response = await this.claudeService.sendRequest(request);
      
      await this.insertReflection(editor, response.content, selectedText ? true : false);
      new Notice('Reflection generated successfully');

    } catch (error) {
      console.error('Therapist mode error:', error);
      new Notice('Error generating reflection: ' + error.message);
    }
  }

  protected getSystemPrompt(): string {
    return `You are a compassionate, non-judgmental reflection partner for journaling and self-exploration. Your role is to help the user process thoughts, emotions, and experiences through thoughtful questions and gentle insights.

APPROACH:
- Be warm, empathetic, and supportive
- Ask open-ended questions that encourage deeper reflection
- Acknowledge emotions without trying to "fix" them
- Offer gentle reframes when appropriate
- Respect the user's autonomy and self-determination
- Maintain strict confidentiality and privacy

RESPONSE STRUCTURE:
1. **Reflection**: Acknowledge what you've heard/read
2. **Gentle Insights**: Patterns, themes, or observations
3. **Exploratory Questions**: 2-3 open-ended questions for deeper reflection
4. **Affirmation**: Supportive closing thoughts

IMPORTANT BOUNDARIES:
- You are not a licensed therapist
- Encourage professional help for serious mental health concerns
- Focus on self-reflection rather than diagnosis or treatment
- Respect privacy - no judgments or assumptions

Keep responses supportive, thoughtful, and focused on encouraging healthy self-reflection.`;
  }

  private async insertReflection(editor: Editor, reflection: string, hasSelection: boolean): Promise<void> {
    const timestamp = new Date().toLocaleString();
    const reflectionText = `\n\n---\n## Reflection - ${timestamp}\n\n${reflection}\n\n---\n`;
    
    if (hasSelection) {
      const selection = editor.getSelection();
      editor.replaceSelection(selection + reflectionText);
    } else {
      const content = editor.getValue();
      editor.setValue(content + reflectionText);
    }
  }

  protected buildUserMessage(content: string, context?: string): string {
    return `I'd like to reflect on the following thoughts/experiences:\n\n${content}\n\nPlease help me explore this more deeply through reflective questions and gentle insights.`;
  }
}