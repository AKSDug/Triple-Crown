/**
 * Triple-Crown Obsidian Plugin - Claude Service
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { App, Notice, requestUrl } from 'obsidian';
import { TripleCrownSettings } from './settings';
import { VaultBoundary, SecurityContext } from './security/vault-boundary';
import * as path from 'path';
import * as fs from 'fs-extra';

export interface ClaudeRequest {
  prompt: string;
  context?: string;
  action?: string;
  file?: string;
}

export interface ClaudeResponse {
  content: string;
  reasoning?: string;
  changes?: Array<{
    type: 'addition' | 'deletion' | 'modification';
    content: string;
    line?: number;
  }>;
}

interface ClaudeAPIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeAPIResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeService {
  private app: App;
  private settings: TripleCrownSettings;
  private conversationHistory: ClaudeAPIMessage[] = [];
  private vaultBoundary: VaultBoundary;
  private securityContext: SecurityContext;

  constructor(app: App, settings: TripleCrownSettings) {
    this.app = app;
    this.settings = settings;
    this.vaultBoundary = new VaultBoundary(app);
    this.securityContext = this.vaultBoundary.createSecurityContext();
  }

  async initialize(): Promise<void> {
    if (!this.settings.apiKey) {
      throw new Error('API key is required. Please add your Anthropic API key in settings.');
    }
  }

  async sendRequest(request: ClaudeRequest): Promise<ClaudeResponse> {
    if (!this.settings.apiKey) {
      new Notice('Please configure your Anthropic API key in settings');
      throw new Error('API key not configured');
    }

    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const userMessage = this.buildUserMessage(request);

      const response = await requestUrl({
        url: this.settings.apiEndpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.settings.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.settings.modelName,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            ...this.conversationHistory,
            { role: 'user', content: userMessage }
          ]
        })
      });

      const apiResponse: ClaudeAPIResponse = response.json;
      const responseText = apiResponse.content[0]?.text || '';

      // Add to conversation history
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: responseText }
      );

      // Keep conversation history manageable
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return this.parseResponse(responseText, request.action);
    } catch (error) {
      console.error('Claude API error:', error);
      if (error.status === 401) {
        new Notice('Invalid API key. Please check your settings.');
      } else if (error.status === 429) {
        new Notice('Rate limit exceeded. Please try again later.');
      } else {
        new Notice(`Claude API error: ${error.message}`);
      }
      throw error;
    }
  }

  private buildSystemPrompt(request: ClaudeRequest): string {
    const vaultPath = this.securityContext.vaultPath;
    const basePrompt = `You are an intelligent writing assistant integrated into Obsidian. 
You help users improve their notes and documents while preserving their original style and intent.

SECURITY CONSTRAINTS:
- You can ONLY access files within the vault directory: ${vaultPath}
- You CANNOT access any files outside the vault
- You CANNOT browse the user's computer or file system beyond the vault
- You can access web content when requested
- You must respect .claude folder configurations for privacy settings

ALLOWED OPERATIONS:
- Read and analyze files within the vault
- Suggest improvements to documents
- Create new content within the vault
- Search for information on the web when specifically requested

BLOCKED OPERATIONS:
- Accessing files outside the vault directory
- Browsing system files or directories
- Accessing other applications or processes
- Reading configuration files outside the vault`;

    if (request.action === 'writing-assistant') {
      return `${basePrompt}

When improving text:
- Preserve the author's voice and style
- Fix grammar and spelling errors
- Improve clarity and flow
- Maintain formatting (Markdown)
- Explain significant changes in your reasoning
- Only reference files within the vault`;
    }

    if (request.action === 'duplicate-edit') {
      return `${basePrompt}

You are creating an improved version of a document. You should:
- Show deletions using ~~strikethrough~~
- Show additions using **bold**
- Include reasoning for major changes in blockquotes
- Preserve all links and formatting
- Return the full edited document with changes marked
- Only work with files within the vault directory`;
    }

    return basePrompt;
  }

  private buildUserMessage(request: ClaudeRequest): string {
    let message = request.prompt;

    if (request.context) {
      message = `Context:\n${request.context}\n\nRequest: ${message}`;
    }

    if (request.file) {
      message = `File: ${request.file}\n\n${message}`;
    }

    return message;
  }

  private parseResponse(responseText: string, action?: string): ClaudeResponse {
    // For duplicate-edit action, try to parse structured changes
    if (action === 'duplicate-edit') {
      const changes: ClaudeResponse['changes'] = [];
      
      // Simple heuristic to detect changes
      const lines = responseText.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('~~') && line.includes('~~')) {
          changes.push({
            type: 'deletion',
            content: line,
            line: index + 1
          });
        }
        if (line.includes('**') && !line.includes('~~')) {
          changes.push({
            type: 'addition',
            content: line,
            line: index + 1
          });
        }
      });

      // Extract reasoning from blockquotes
      const reasoningMatch = responseText.match(/^>(.+?)$/gm);
      const reasoning = reasoningMatch ? reasoningMatch.join('\n').replace(/^>/gm, '').trim() : undefined;

      return {
        content: responseText,
        reasoning,
        changes
      };
    }

    // Default response parsing
    return {
      content: responseText,
      reasoning: undefined,
      changes: []
    };
  }

  async getContextForFile(filePath: string): Promise<string> {
    // Security check: ensure file is within vault boundaries
    const sanitizedPath = this.vaultBoundary.sanitizePath(filePath);
    if (!sanitizedPath) {
      console.warn('Security: Blocked access to file outside vault:', filePath);
      return `Error: Access denied - file is outside vault boundaries`;
    }

    // Validate file operation
    if (!this.vaultBoundary.validateFileOperation(sanitizedPath, 'read')) {
      console.warn('Security: Blocked read operation:', filePath);
      return `Error: Access denied - file access not permitted`;
    }

    const vaultPath = this.getVaultPath();
    const relativePath = path.relative(vaultPath, sanitizedPath);
    
    try {
      const file = this.app.vault.getAbstractFileByPath(relativePath);
      if (file && 'extension' in file) {
        const content = await this.app.vault.read(file);
        
        // Check file size limits
        if (content.length > this.securityContext.maxFileSize) {
          return `File: ${relativePath}\n\nError: File too large (${content.length} bytes, max ${this.securityContext.maxFileSize} bytes)`;
        }
        
        return `File: ${relativePath}\n\n${content}`;
      }
      return `File: ${relativePath}\n\nError: File not found`;
    } catch (error) {
      console.error('Error reading file context:', error);
      return `File: ${relativePath}\n\nError reading file: ${error.message}`;
    }
  }

  async findClaudeConfig(startPath: string): Promise<any> {
    // Security check: ensure start path is within vault
    const sanitizedStartPath = this.vaultBoundary.sanitizePath(startPath);
    if (!sanitizedStartPath) {
      console.warn('Security: Blocked config search outside vault:', startPath);
      return null;
    }

    const vaultPath = this.getVaultPath();
    let currentPath = sanitizedStartPath;

    while (currentPath.startsWith(vaultPath)) {
      const configPath = path.join(currentPath, '.claude', 'config.json');
      
      // Validate config file access
      if (!this.vaultBoundary.validateFileOperation(configPath, 'read')) {
        console.warn('Security: Blocked config read:', configPath);
        break;
      }
      
      try {
        if (await fs.pathExists(configPath)) {
          const config = await fs.readJson(configPath);
          
          // Validate config size
          const configString = JSON.stringify(config);
          if (configString.length > 100000) { // 100KB limit for config
            console.warn('Security: Config file too large:', configPath);
            return null;
          }
          
          return config;
        }
      } catch (error) {
        console.warn('Error reading config file:', error.message);
        // Continue searching upward
      }

      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath || !parentPath.startsWith(vaultPath)) break;
      currentPath = parentPath;
    }

    return null;
  }

  private getVaultPath(): string {
    return (this.app.vault.adapter as any).path || '';
  }

  async cleanup(): Promise<void> {
    // Clear conversation history
    this.conversationHistory = [];
  }

  // Terminal-specific methods for interactive sessions
  async startTerminalSession(): Promise<void> {
    // Clear history for new session
    this.conversationHistory = [];
    console.log('Started new Claude terminal session');
  }

  async sendTerminalCommand(command: string): Promise<string> {
    try {
      const response = await this.sendRequest({
        prompt: command,
        action: 'terminal'
      });
      return response.content;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  isTerminalActive(): boolean {
    // Terminal is always "active" when API key is configured
    return !!this.settings.apiKey;
  }

  clearConversationHistory(): void {
    this.conversationHistory = [];
  }
}