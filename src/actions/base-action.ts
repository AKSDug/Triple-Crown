/**
 * Triple-Crown Obsidian Plugin - Base Action Interface
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { App, Editor, MarkdownView } from 'obsidian';
import { ClaudeService } from '../claude-service';

export interface ActionConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: ActionCategory;
  requiresSelection?: boolean;
  supportedFileTypes?: string[];
}

export enum ActionCategory {
  WRITING = 'writing',
  ANALYSIS = 'analysis', 
  ORGANIZATION = 'organization',
  REVIEW = 'review',
  CUSTOM = 'custom'
}

export abstract class BaseAction {
  protected app: App;
  protected claudeService: ClaudeService;
  public config: ActionConfig;

  constructor(app: App, claudeService: ClaudeService, config: ActionConfig) {
    this.app = app;
    this.claudeService = claudeService;
    this.config = config;
  }

  /**
   * Execute the action
   */
  abstract execute(editor: Editor, view: MarkdownView): Promise<void>;

  /**
   * Check if action can be executed in current context
   */
  canExecute(editor: Editor, view: MarkdownView): boolean {
    // Check if action is enabled
    if (!this.config.enabled) {
      return false;
    }

    // Check if file type is supported
    if (this.config.supportedFileTypes && view.file) {
      const fileExtension = view.file.extension;
      if (!this.config.supportedFileTypes.includes(fileExtension)) {
        return false;
      }
    }

    // Check if selection is required
    if (this.config.requiresSelection) {
      const selectedText = editor.getSelection();
      if (!selectedText || selectedText.trim().length === 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get action-specific system prompt
   */
  protected abstract getSystemPrompt(): string;

  /**
   * Build user message for the action
   */
  protected buildUserMessage(content: string, context?: string): string {
    let message = content;
    
    if (context) {
      message = `Context:\n${context}\n\nContent to process:\n${message}`;
    }
    
    return message;
  }
}

export interface CustomActionDefinition {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: ActionCategory;
  enabled: boolean;
  requiresSelection?: boolean;
  supportedFileTypes?: string[];
}