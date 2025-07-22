/**
 * Triple-Crown Obsidian Plugin - Terminal View
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { ItemView, WorkspaceLeaf } from 'obsidian';
import { ClaudeService } from './claude-service';
import { EnhancedTerminalService } from './enhanced-terminal';

export const TERMINAL_VIEW_TYPE = 'claude-terminal';

export class TerminalView extends ItemView {
  private terminalService: ClaudeService | EnhancedTerminalService;
  private terminal: HTMLElement;
  private input: HTMLInputElement;
  private output: HTMLElement;
  private history: string[] = [];
  private historyIndex = -1;
  private isProcessing = false;

  constructor(leaf: WorkspaceLeaf, terminalService: ClaudeService | EnhancedTerminalService) {
    super(leaf);
    this.terminalService = terminalService;
  }

  getViewType(): string {
    return TERMINAL_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Claude Terminal';
  }

  getIcon(): string {
    return 'terminal';
  }

  async onOpen(): Promise<void> {
    this.createTerminalInterface();
    if ('initialize' in this.terminalService) {
      await this.terminalService.initialize();
    }
    this.addWelcomeMessage();
  }

  private createTerminalInterface(): void {
    const container = this.containerEl.children[1];
    container.empty();

    this.terminal = container.createDiv({
      cls: 'claude-terminal'
    });

    this.output = this.terminal.createDiv({
      cls: 'claude-terminal-output'
    });

    const inputContainer = this.terminal.createDiv({
      cls: 'claude-terminal-input-container'
    });

    const prompt = inputContainer.createSpan({
      cls: 'claude-terminal-prompt',
      text: 'claude> '
    });

    this.input = inputContainer.createEl('input', {
      cls: 'claude-terminal-input',
      type: 'text',
      placeholder: 'Enter command or ask a question...'
    });

    this.setupEventListeners();
    this.setupStyles();
  }

  private setupEventListeners(): void {
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleCommand();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory(1);
      }
    });

    // Focus/blur styles handled by CSS
  }

  private setupStyles(): void {
    // Styles are now loaded from styles.css
  }

  private addWelcomeMessage(): void {
    if (this.terminalService instanceof EnhancedTerminalService) {
      this.addMessage('system', 'Enhanced Terminal initialized. Type your commands or questions below.');
      this.addMessage('system', 'Available commands: help, clear, context, config, analyze, format, search, research, run');
    } else {
      this.addMessage('system', 'Claude Terminal initialized. Type your commands or questions below.');
      this.addMessage('system', 'Available commands: help, clear, context, config');
    }
  }

  private async handleCommand(): Promise<void> {
    const command = this.input.value.trim();
    if (!command) return;

    // Add to history
    this.history.push(command);
    this.historyIndex = this.history.length;

    // Show user input
    this.addMessage('user', command);

    // Clear input
    this.input.value = '';

    // Process command
    this.isProcessing = true;
    this.input.disabled = true;
    this.addMessage('processing', 'Processing...');

    try {
      if (command.startsWith('/')) {
        await this.handleSystemCommand(command);
      } else {
        await this.handleClaudeQuery(command);
      }
    } catch (error) {
      this.addMessage('system', `Error: ${error.message}`);
    } finally {
      this.isProcessing = false;
      this.input.disabled = false;
      this.input.focus();
      this.removeLastProcessingMessage();
    }
  }

  private async handleSystemCommand(command: string): Promise<void> {
    if (this.terminalService instanceof EnhancedTerminalService) {
      // Use enhanced terminal's command processing
      const result = await this.terminalService.executeCommand(command);
      this.addMessage('system', result);
    } else {
      // Fallback to basic Claude service commands
      const [cmd, ...args] = command.slice(1).split(' ');

      switch (cmd) {
        case 'help':
          this.addMessage('system', `Available commands:
/help - Show this help message
/clear - Clear terminal output
/context - Show current context information
/config - Show configuration status
/actions - List available actions
/history - Show command history`);
          break;

        case 'clear':
          this.output.empty();
          break;

        case 'context':
          const activeFile = this.app.workspace.getActiveFile();
          if (activeFile && 'getContextForFile' in this.terminalService) {
            const context = await this.terminalService.getContextForFile(activeFile.path);
            this.addMessage('system', `Current context:\n${context}`);
          } else {
            this.addMessage('system', 'No active file');
          }
          break;

        case 'config':
          const configStatus = await this.getConfigStatus();
          this.addMessage('system', configStatus);
          break;

        case 'actions':
          this.addMessage('system', `Available actions:
- writing-assistant: Improve, expand, or simplify text
- tag-builder: Generate smart tags for content
- connection-finder: Discover note relationships
- therapist-mode: Reflective journaling assistance
- code-reviewer: Review and improve code
- peer-reviewer: Academic peer review
- research-assistant: Aggregate sources and create link trees`);
          break;

        case 'history':
          const historyText = this.history.map((cmd, i) => `${i + 1}. ${cmd}`).join('\n');
          this.addMessage('system', `Command history:\n${historyText}`);
          break;

        default:
          this.addMessage('system', `Unknown command: ${cmd}. Type /help for available commands.`);
      }
    }
  }

  private async handleClaudeQuery(query: string): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    let context = '';
    
    if (activeFile && 'getContextForFile' in this.terminalService) {
      context = await this.terminalService.getContextForFile(activeFile.path);
    }

    try {
      let response;
      if ('sendRequest' in this.terminalService) {
        response = await this.terminalService.sendRequest({
          prompt: query,
          context: context,
          action: 'terminal',
          file: activeFile?.path
        });
      } else {
        // Enhanced terminal service might handle queries differently
        const result = await this.terminalService.executeCommand(query);
        response = { content: result };
      }

      this.addMessage('claude', response.content);

      if (response.reasoning) {
        this.addMessage('claude', `Reasoning: ${response.reasoning}`);
      }
    } catch (error) {
      this.addMessage('system', `Service error: ${error.message}`);
    }
  }

  private async getConfigStatus(): Promise<string> {
    const activeFile = this.app.workspace.getActiveFile();
    const configPath = activeFile ? activeFile.parent?.path : '';
    
    if (configPath && 'findClaudeConfig' in this.terminalService) {
      const config = await this.terminalService.findClaudeConfig(configPath);
      if (config) {
        return `Claude configuration found:\n${JSON.stringify(config, null, 2)}`;
      }
    }

    return 'No .claude configuration found in current path';
  }

  private navigateHistory(direction: number): void {
    if (this.history.length === 0) return;

    this.historyIndex = Math.max(0, Math.min(this.history.length, this.historyIndex + direction));

    if (this.historyIndex < this.history.length) {
      this.input.value = this.history[this.historyIndex];
    } else {
      this.input.value = '';
    }
  }

  private addMessage(type: 'user' | 'claude' | 'system' | 'processing', content: string): void {
    const messageEl = this.output.createDiv({
      cls: `claude-terminal-message ${type}`
    });

    const timestamp = messageEl.createSpan({
      cls: 'claude-terminal-timestamp',
      text: new Date().toLocaleTimeString()
    });

    messageEl.createSpan({
      text: content
    });

    this.output.scrollTop = this.output.scrollHeight;
  }

  private removeLastProcessingMessage(): void {
    const processingMessages = this.output.querySelectorAll('.claude-terminal-message.processing');
    if (processingMessages.length > 0) {
      processingMessages[processingMessages.length - 1].remove();
    }
  }

  async onClose(): Promise<void> {
    // Cleanup terminal session
    if ('cleanup' in this.terminalService) {
      await this.terminalService.cleanup();
    }
  }
}