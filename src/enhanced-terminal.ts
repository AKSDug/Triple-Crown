/**
 * Triple-Crown Obsidian Plugin - Enhanced Terminal Service
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { App, Notice } from 'obsidian';
import { ClaudeService } from './claude-service';
import { PluginEcosystemDetector, DetectedPlugin } from './plugin-ecosystem';
import { TripleCrownSettings } from './settings';

export interface TerminalCommand {
  command: string;
  description: string;
  category: 'claude' | 'system' | 'plugin' | 'development' | 'research';
  handler: (args: string[]) => Promise<string>;
  requiresConfirmation?: boolean;
  sandboxed?: boolean;
}

export interface SandboxedEnvironment {
  allowedCommands: string[];
  timeoutMs: number;
  memoryLimitMB: number;
  networkAccess: boolean;
  fileSystemAccess: 'none' | 'readonly' | 'vault-only';
}

export class EnhancedTerminalService {
  private app: App;
  private claudeService: ClaudeService;
  private pluginDetector: PluginEcosystemDetector;
  private settings: TripleCrownSettings;
  private commands: Map<string, TerminalCommand> = new Map();
  private commandHistory: string[] = [];
  private sandbox: SandboxedEnvironment;

  constructor(app: App, claudeService: ClaudeService, settings: TripleCrownSettings) {
    this.app = app;
    this.claudeService = claudeService;
    this.settings = settings;
    this.pluginDetector = new PluginEcosystemDetector(app);
    
    this.sandbox = {
      allowedCommands: ['help', 'list', 'search', 'analyze', 'format'],
      timeoutMs: 30000,
      memoryLimitMB: 100,
      networkAccess: false,
      fileSystemAccess: 'vault-only'
    };

    this.initializeCommands();
  }

  private initializeCommands(): void {
    // Claude-specific commands
    this.registerCommand({
      command: 'claude',
      description: 'Send message to Claude',
      category: 'claude',
      handler: async (args) => this.handleClaudeCommand(args)
    });

    this.registerCommand({
      command: 'ask',
      description: 'Ask Claude a question',
      category: 'claude',
      handler: async (args) => this.handleClaudeCommand(args)
    });

    // System commands
    this.registerCommand({
      command: 'help',
      description: 'Show available commands',
      category: 'system',
      handler: async (args) => this.showHelp(args)
    });

    this.registerCommand({
      command: 'status',
      description: 'Show system status and capabilities',
      category: 'system',
      handler: async () => this.showStatus()
    });

    this.registerCommand({
      command: 'plugins',
      description: 'List detected Obsidian plugins and their capabilities',
      category: 'plugin',
      handler: async () => this.listPlugins()
    });

    // Development commands (when enabled)
    if (this.settings.terminalSettings.enableGeneralTools) {
      this.registerCommand({
        command: 'analyze',
        description: 'Analyze current file or vault structure',
        category: 'development',
        handler: async (args) => this.analyzeContent(args),
        sandboxed: true
      });

      this.registerCommand({
        command: 'format',
        description: 'Format content using detected plugin capabilities',
        category: 'development',
        handler: async (args) => this.formatContent(args),
        sandboxed: true
      });

      this.registerCommand({
        command: 'search',
        description: 'Advanced search across vault with filters',
        category: 'development',
        handler: async (args) => this.advancedSearch(args),
        sandboxed: true
      });
    }

    // Research commands
    this.registerCommand({
      command: 'research',
      description: 'Start research session with source aggregation',
      category: 'research',
      handler: async (args) => this.startResearchSession(args)
    });

    this.registerCommand({
      command: 'sources',
      description: 'Manage research sources and citations',
      category: 'research',
      handler: async (args) => this.manageSources(args)
    });

    // Sandboxed execution commands
    if (this.settings.terminalSettings.allowSandboxedExecution) {
      this.registerCommand({
        command: 'run',
        description: 'Execute sandboxed code or scripts',
        category: 'development',
        handler: async (args) => this.executeSandboxed(args),
        requiresConfirmation: true,
        sandboxed: true
      });
    }
  }

  registerCommand(command: TerminalCommand): void {
    this.commands.set(command.command, command);
  }

  async executeCommand(input: string): Promise<string> {
    const parts = input.trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    this.commandHistory.push(input);

    // Check if command exists
    const command = this.commands.get(commandName);
    if (!command) {
      // Default to Claude if not a recognized command
      return await this.handleClaudeCommand([input]);
    }

    // Check if confirmation required
    if (command.requiresConfirmation) {
      const confirmed = await this.requestConfirmation(
        `Execute command: ${commandName}?\nThis command may modify files or execute code.`
      );
      if (!confirmed) {
        return 'Command cancelled by user.';
      }
    }

    try {
      // Execute in sandbox if required
      if (command.sandboxed && this.settings.terminalSettings.allowSandboxedExecution) {
        return await this.executeSandboxedCommand(command, args);
      } else {
        return await command.handler(args);
      }
    } catch (error) {
      console.error(`Command ${commandName} failed:`, error);
      return `Error executing command: ${error.message}`;
    }
  }

  private async executeSandboxedCommand(command: TerminalCommand, args: string[]): Promise<string> {
    // Basic sandbox implementation
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        command.handler(args),
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Command timeout')), this.sandbox.timeoutMs)
        )
      ]);
      
      const executionTime = Date.now() - startTime;
      return `${result}\n\n[Executed in ${executionTime}ms]`;
    } catch (error) {
      return `Sandboxed execution failed: ${error.message}`;
    }
  }

  private async handleClaudeCommand(args: string[]): Promise<string> {
    const message = args.join(' ');
    if (!message.trim()) {
      return 'Please provide a message for Claude.';
    }

    try {
      // Check connection mode
      if (this.settings.connectionMode === 'cli') {
        return await this.executeClaudeCLI(message);
      } else if (this.settings.connectionMode === 'hybrid') {
        try {
          return await this.executeClaudeCLI(message);
        } catch (error) {
          if (this.settings.fallbackToAPI) {
            new Notice('Claude CLI failed, falling back to API');
            return await this.executeClaudeAPI(message);
          }
          throw error;
        }
      } else {
        return await this.executeClaudeAPI(message);
      }
    } catch (error) {
      return `Error communicating with Claude: ${error.message}`;
    }
  }

  private async executeClaudeCLI(message: string): Promise<string> {
    // Implementation for Claude CLI integration
    // This would use child_process to execute claude-code CLI
    const cliPath = this.settings.cliPath || 'claude-code';
    
    // For now, return a placeholder - actual implementation would need subprocess execution
    return `[Claude CLI Mode - Command would be: ${cliPath}]\n\nNote: CLI integration requires subprocess execution which is not available in Obsidian plugins. Falling back to API mode.`;
  }

  private async executeClaudeAPI(message: string): Promise<string> {
    const request = {
      prompt: message,
      context: 'Terminal session',
      action: 'terminal-chat',
      file: undefined
    };

    const response = await this.claudeService.sendRequest(request);
    return response.content;
  }

  private async showHelp(args: string[]): Promise<string> {
    const category = args[0];
    
    if (category) {
      const categoryCommands = Array.from(this.commands.values())
        .filter(cmd => cmd.category === category);
      
      if (categoryCommands.length === 0) {
        return `No commands found in category: ${category}`;
      }
      
      let help = `Commands in category: ${category}\n\n`;
      categoryCommands.forEach(cmd => {
        help += `/${cmd.command} - ${cmd.description}\n`;
      });
      return help;
    }

    let help = 'Available Commands:\n\n';
    
    const categories = new Set(Array.from(this.commands.values()).map(cmd => cmd.category));
    categories.forEach(cat => {
      help += `**${cat.toUpperCase()}:**\n`;
      const categoryCommands = Array.from(this.commands.values()).filter(cmd => cmd.category === cat);
      categoryCommands.forEach(cmd => {
        help += `  /${cmd.command} - ${cmd.description}\n`;
      });
      help += '\n';
    });
    
    help += 'Use /help <category> for detailed information about specific command categories.\n';
    help += 'Any input not starting with / will be sent directly to Claude.';
    
    return help;
  }

  private async showStatus(): Promise<string> {
    const plugins = await this.pluginDetector.detectInstalledPlugins();
    const enabledPlugins = plugins.filter(p => p.enabled);
    
    let status = `**Triple-Crown System Status**\n\n`;
    status += `**Connection Mode:** ${this.settings.connectionMode}\n`;
    status += `**Model:** ${this.settings.modelName}\n`;
    status += `**Claude CLI Path:** ${this.settings.cliPath}\n`;
    status += `**General Tools:** ${this.settings.terminalSettings.enableGeneralTools ? 'Enabled' : 'Disabled'}\n`;
    status += `**Sandboxed Execution:** ${this.settings.terminalSettings.allowSandboxedExecution ? 'Enabled' : 'Disabled'}\n\n`;
    
    status += `**Plugin Ecosystem:**\n`;
    status += `- Total Plugins Detected: ${plugins.length}\n`;
    status += `- Enabled Plugins: ${enabledPlugins.length}\n`;
    status += `- Integrated Plugins: ${plugins.filter(p => p.integration.supportLevel !== 'none').length}\n\n`;
    
    status += `**Available Commands:** ${this.commands.size}\n`;
    status += `**Command History:** ${this.commandHistory.length} entries\n`;
    
    return status;
  }

  private async listPlugins(): Promise<string> {
    const plugins = await this.pluginDetector.detectInstalledPlugins();
    
    if (plugins.length === 0) {
      return 'No plugins detected with integration capabilities.';
    }
    
    let output = '**Detected Plugins with Integration Support:**\n\n';
    
    plugins.forEach(plugin => {
      output += `**${plugin.name}** (${plugin.id})\n`;
      output += `- Status: ${plugin.enabled ? '✅ Enabled' : '❌ Disabled'}\n`;
      output += `- Integration Level: ${plugin.integration.supportLevel}\n`;
      output += `- Capabilities: ${plugin.capabilities.map(c => c.type).join(', ')}\n`;
      
      if (plugin.integration.enhancedPrompts) {
        output += `- Enhanced Prompts: ✅\n`;
      }
      if (plugin.integration.customFormatting) {
        output += `- Custom Formatting: ✅\n`;
      }
      
      output += '\n';
    });
    
    return output;
  }

  private async analyzeContent(args: string[]): Promise<string> {
    const target = args[0] || 'current';
    
    // This would analyze the current file, selection, or vault
    return `Content analysis for: ${target}\n\n[Analysis would be performed here with vault structure, file relationships, etc.]`;
  }

  private async formatContent(args: string[]): Promise<string> {
    const format = args[0];
    const plugins = await this.pluginDetector.detectInstalledPlugins();
    
    // Find plugins that support the requested format
    const supportingPlugins = plugins.filter(p => 
      p.capabilities.some(cap => cap.type === format)
    );
    
    if (supportingPlugins.length === 0) {
      return `No plugins found that support format: ${format}`;
    }
    
    return `Formatting content using ${supportingPlugins[0].name}...\n\n[Formatted content would appear here]`;
  }

  private async advancedSearch(args: string[]): Promise<string> {
    const query = args.join(' ');
    
    // This would perform advanced search using available search plugins
    return `Advanced search results for: "${query}"\n\n[Search results would appear here]`;
  }

  private async startResearchSession(args: string[]): Promise<string> {
    const topic = args.join(' ');
    
    return `Starting research session for: "${topic}"\n\nResearch session capabilities:\n- Source aggregation\n- Citation management\n- Link tree generation\n- Cross-reference analysis\n\nUse /sources to manage research materials.`;
  }

  private async manageSources(args: string[]): Promise<string> {
    const action = args[0];
    
    if (action === 'list') {
      return 'Current research sources:\n\n[Source list would appear here]';
    } else if (action === 'add') {
      return 'Add source: [Interactive source addition would happen here]';
    }
    
    return 'Source management commands:\n- /sources list - Show all sources\n- /sources add - Add new source\n- /sources organize - Organize sources by topic';
  }

  private async executeSandboxed(args: string[]): Promise<string> {
    const code = args.join(' ');
    
    // This would execute code in a sandboxed environment
    return `Executing in sandbox: ${code}\n\n[Sandboxed execution result would appear here]`;
  }

  private async requestConfirmation(message: string): Promise<boolean> {
    // This would show a confirmation dialog
    // For now, return true - actual implementation would need user interaction
    return true;
  }

  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  clearHistory(): void {
    this.commandHistory = [];
  }
}