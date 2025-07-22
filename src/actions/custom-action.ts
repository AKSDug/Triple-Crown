/**
 * Triple-Crown Obsidian Plugin - Custom Action Framework
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
import { BaseAction, ActionConfig, ActionCategory, CustomActionDefinition } from './base-action';

export class CustomAction extends BaseAction {
  private customDefinition: CustomActionDefinition;

  constructor(app: App, claudeService: ClaudeService, definition: CustomActionDefinition) {
    const config: ActionConfig = {
      id: definition.id,
      name: definition.name,
      description: definition.description,
      enabled: definition.enabled,
      category: definition.category,
      requiresSelection: definition.requiresSelection,
      supportedFileTypes: definition.supportedFileTypes
    };
    
    super(app, claudeService, config);
    this.customDefinition = definition;
  }

  async execute(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.canExecute(editor, view)) {
      new Notice(`${this.config.name} cannot be executed in current context`);
      return;
    }

    const selectedText = editor.getSelection();
    const content = selectedText || editor.getValue();

    if (!content.trim() && this.config.requiresSelection) {
      new Notice(`${this.config.name} requires selected text`);
      return;
    }

    try {
      new Notice(`Executing ${this.config.name}...`);

      const fileContext = view.file ? await this.getFileContext(view.file) : '';
      
      const request: ClaudeRequest = {
        prompt: this.buildCustomMessage(content, fileContext),
        context: `Custom action: ${this.config.name}`,
        action: this.config.id,
        file: view.file?.path
      };

      const response = await this.claudeService.sendRequest(request);
      
      await this.insertCustomResult(editor, response.content, selectedText ? true : false);
      new Notice(`${this.config.name} completed successfully`);

    } catch (error) {
      console.error(`Custom action ${this.config.name} error:`, error);
      new Notice(`Error executing ${this.config.name}: ${error.message}`);
    }
  }

  protected getSystemPrompt(): string {
    return this.customDefinition.prompt;
  }

  private buildCustomMessage(content: string, context?: string): string {
    let message = content;
    
    if (context) {
      message = `Context:\n${context}\n\nContent to process:\n${message}`;
    }
    
    return message;
  }

  private async insertCustomResult(editor: Editor, result: string, hasSelection: boolean): Promise<void> {
    const timestamp = new Date().toLocaleString();
    const resultText = `\n\n---\n## ${this.config.name} - ${timestamp}\n\n${result}\n\n---\n`;
    
    if (hasSelection) {
      const selection = editor.getSelection();
      editor.replaceSelection(selection + resultText);
    } else {
      const content = editor.getValue();
      editor.setValue(content + resultText);
    }
  }

  private async getFileContext(file: any): Promise<string> {
    try {
      return await this.claudeService.getContextForFile(file.path);
    } catch (error) {
      return '';
    }
  }

  // Update the custom action definition
  updateDefinition(definition: CustomActionDefinition): void {
    this.customDefinition = definition;
    this.config = {
      ...this.config,
      name: definition.name,
      description: definition.description,
      enabled: definition.enabled,
      category: definition.category,
      requiresSelection: definition.requiresSelection,
      supportedFileTypes: definition.supportedFileTypes
    };
  }

  // Get the custom definition
  getDefinition(): CustomActionDefinition {
    return { ...this.customDefinition };
  }
}

export class CustomActionManager {
  private app: App;
  private claudeService: ClaudeService;
  private customActions: Map<string, CustomAction> = new Map();
  private actionDefinitions: CustomActionDefinition[] = [];

  constructor(app: App, claudeService: ClaudeService) {
    this.app = app;
    this.claudeService = claudeService;
  }

  // Load custom actions from settings
  loadCustomActions(definitions: CustomActionDefinition[]): void {
    this.actionDefinitions = definitions;
    this.customActions.clear();

    for (const definition of definitions) {
      if (definition.enabled) {
        const action = new CustomAction(this.app, this.claudeService, definition);
        this.customActions.set(definition.id, action);
      }
    }
  }

  // Get all custom actions
  getCustomActions(): CustomAction[] {
    return Array.from(this.customActions.values());
  }

  // Get a specific custom action
  getCustomAction(id: string): CustomAction | undefined {
    return this.customActions.get(id);
  }

  // Add a new custom action
  addCustomAction(definition: CustomActionDefinition): void {
    const existingIndex = this.actionDefinitions.findIndex(d => d.id === definition.id);
    
    if (existingIndex >= 0) {
      this.actionDefinitions[existingIndex] = definition;
    } else {
      this.actionDefinitions.push(definition);
    }

    if (definition.enabled) {
      const action = new CustomAction(this.app, this.claudeService, definition);
      this.customActions.set(definition.id, action);
    } else {
      this.customActions.delete(definition.id);
    }
  }

  // Remove a custom action
  removeCustomAction(id: string): void {
    this.actionDefinitions = this.actionDefinitions.filter(d => d.id !== id);
    this.customActions.delete(id);
  }

  // Get all action definitions (for settings)
  getActionDefinitions(): CustomActionDefinition[] {
    return [...this.actionDefinitions];
  }

  // Update action definitions (from settings)
  updateActionDefinitions(definitions: CustomActionDefinition[]): void {
    this.loadCustomActions(definitions);
  }
}