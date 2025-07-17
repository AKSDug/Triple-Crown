import { ItemView, WorkspaceLeaf } from 'obsidian';
import { ClaudeService } from './claude-service';

export const TERMINAL_VIEW_TYPE = 'claude-terminal';

export class TerminalView extends ItemView {
  private claudeService: ClaudeService;
  private terminal: HTMLElement;
  private input: HTMLInputElement;
  private output: HTMLElement;
  private history: string[] = [];
  private historyIndex = -1;
  private isProcessing = false;

  constructor(leaf: WorkspaceLeaf, claudeService: ClaudeService) {
    super(leaf);
    this.claudeService = claudeService;
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
    await this.claudeService.initialize();
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

    this.input.addEventListener('focus', () => {
      this.input.style.outline = '1px solid var(--interactive-accent)';
    });

    this.input.addEventListener('blur', () => {
      this.input.style.outline = 'none';
    });
  }

  private setupStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .claude-terminal {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--background-primary);
        font-family: var(--font-monospace);
        font-size: 14px;
        padding: 10px;
      }

      .claude-terminal-output {
        flex: 1;
        overflow-y: auto;
        padding: 10px 0;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .claude-terminal-input-container {
        display: flex;
        align-items: center;
        border-top: 1px solid var(--background-modifier-border);
        padding-top: 10px;
      }

      .claude-terminal-prompt {
        color: var(--text-accent);
        font-weight: bold;
        margin-right: 8px;
      }

      .claude-terminal-input {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--text-normal);
        font-family: var(--font-monospace);
        font-size: 14px;
        padding: 4px 8px;
        border-radius: 4px;
        background: var(--background-modifier-form-field);
      }

      .claude-terminal-input:focus {
        outline: 1px solid var(--interactive-accent);
      }

      .claude-terminal-message {
        margin: 8px 0;
        padding: 8px;
        border-radius: 4px;
      }

      .claude-terminal-message.user {
        background: var(--background-modifier-hover);
        border-left: 3px solid var(--interactive-accent);
      }

      .claude-terminal-message.claude {
        background: var(--background-secondary);
        border-left: 3px solid var(--text-accent);
      }

      .claude-terminal-message.system {
        background: var(--background-modifier-error);
        border-left: 3px solid var(--text-error);
        color: var(--text-error);
      }

      .claude-terminal-message.processing {
        background: var(--background-modifier-success);
        border-left: 3px solid var(--text-success);
        color: var(--text-muted);
      }

      .claude-terminal-timestamp {
        font-size: 12px;
        color: var(--text-muted);
        margin-right: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  private addWelcomeMessage(): void {
    this.addMessage('system', 'Claude Terminal initialized. Type your commands or questions below.');
    this.addMessage('system', 'Available commands: help, clear, context, config');
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
        if (activeFile) {
          const context = await this.claudeService.getContextForFile(activeFile.path);
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
- peer-reviewer: Academic peer review`);
        break;

      case 'history':
        const historyText = this.history.map((cmd, i) => `${i + 1}. ${cmd}`).join('\n');
        this.addMessage('system', `Command history:\n${historyText}`);
        break;

      default:
        this.addMessage('system', `Unknown command: ${cmd}. Type /help for available commands.`);
    }
  }

  private async handleClaudeQuery(query: string): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    const context = activeFile ? await this.claudeService.getContextForFile(activeFile.path) : '';

    try {
      const response = await this.claudeService.sendRequest({
        prompt: query,
        context: context,
        action: 'terminal',
        file: activeFile?.path
      });

      this.addMessage('claude', response.content);

      if (response.reasoning) {
        this.addMessage('claude', `Reasoning: ${response.reasoning}`);
      }
    } catch (error) {
      this.addMessage('system', `Claude service error: ${error.message}`);
    }
  }

  private async getConfigStatus(): Promise<string> {
    const activeFile = this.app.workspace.getActiveFile();
    const configPath = activeFile ? activeFile.parent?.path : '';
    
    if (configPath) {
      const config = await this.claudeService.findClaudeConfig(configPath);
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
    await this.claudeService.cleanup();
  }
}