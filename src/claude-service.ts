import { App, Notice } from 'obsidian';
import { spawn, ChildProcess } from 'child_process';
import { TripleCrownSettings } from './settings';
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

export class ClaudeService {
  private app: App;
  private settings: TripleCrownSettings;
  private claudeProcess: ChildProcess | null = null;
  private isInitialized = false;

  constructor(app: App, settings: TripleCrownSettings) {
    this.app = app;
    this.settings = settings;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if claude-code is available
      const claudeCodePath = await this.findClaudeCodePath();
      if (!claudeCodePath) {
        throw new Error('Claude Code not found. Please install @anthropic-ai/claude-code');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Claude service:', error);
      new Notice('Failed to initialize Claude service: ' + error.message);
    }
  }

  private async findClaudeCodePath(): Promise<string | null> {
    const possiblePaths = [
      path.join(process.cwd(), 'node_modules', '.bin', 'claude-code'),
      path.join(process.env.HOME || '', '.npm', 'bin', 'claude-code'),
      'claude-code' // Global install
    ];

    for (const claudePath of possiblePaths) {
      try {
        if (await fs.pathExists(claudePath)) {
          return claudePath;
        }
      } catch (error) {
        // Continue to next path
      }
    }

    return null;
  }

  async sendRequest(request: ClaudeRequest): Promise<ClaudeResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const args = ['--interactive'];
      
      if (this.settings.apiKey) {
        args.push('--api-key', this.settings.apiKey);
      }

      const claudeProcess = spawn('claude-code', args, {
        cwd: this.getVaultPath(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      claudeProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      claudeProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      claudeProcess.on('close', (code) => {
        if (code === 0) {
          resolve(this.parseResponse(stdout));
        } else {
          reject(new Error(`Claude process exited with code ${code}: ${stderr}`));
        }
      });

      claudeProcess.on('error', (error) => {
        reject(error);
      });

      // Send the request
      const requestData = JSON.stringify(request);
      claudeProcess.stdin?.write(requestData);
      claudeProcess.stdin?.end();
    });
  }

  private parseResponse(output: string): ClaudeResponse {
    try {
      // Try to parse as JSON first
      const jsonResponse = JSON.parse(output);
      return jsonResponse;
    } catch (error) {
      // Fallback to plain text response
      return {
        content: output,
        reasoning: undefined,
        changes: []
      };
    }
  }

  async getContextForFile(filePath: string): Promise<string> {
    const vaultPath = this.getVaultPath();
    const relativePath = path.relative(vaultPath, filePath);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return `File: ${relativePath}\n\n${content}`;
    } catch (error) {
      console.error('Error reading file context:', error);
      return `File: ${relativePath}\n\nError reading file: ${error.message}`;
    }
  }

  async findClaudeConfig(startPath: string): Promise<any> {
    const vaultPath = this.getVaultPath();
    let currentPath = startPath;

    while (currentPath.startsWith(vaultPath)) {
      const configPath = path.join(currentPath, '.claude', 'config.json');
      
      try {
        if (await fs.pathExists(configPath)) {
          return await fs.readJson(configPath);
        }
      } catch (error) {
        // Continue searching upward
      }

      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) break;
      currentPath = parentPath;
    }

    return null;
  }

  private getVaultPath(): string {
    return (this.app.vault.adapter as any).path || '';
  }

  async cleanup(): Promise<void> {
    if (this.claudeProcess) {
      this.claudeProcess.kill();
      this.claudeProcess = null;
    }
    this.isInitialized = false;
  }

  // Terminal-specific methods
  async startTerminalSession(): Promise<void> {
    if (this.claudeProcess) {
      return; // Already running
    }

    const args = ['--interactive', '--terminal'];
    
    if (this.settings.apiKey) {
      args.push('--api-key', this.settings.apiKey);
    }

    this.claudeProcess = spawn('claude-code', args, {
      cwd: this.getVaultPath(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.claudeProcess.on('error', (error) => {
      console.error('Claude terminal process error:', error);
      new Notice('Claude terminal error: ' + error.message);
    });

    this.claudeProcess.on('close', (code) => {
      console.log(`Claude terminal process exited with code ${code}`);
      this.claudeProcess = null;
    });
  }

  async sendTerminalCommand(command: string): Promise<string> {
    if (!this.claudeProcess) {
      await this.startTerminalSession();
    }

    return new Promise((resolve, reject) => {
      let output = '';
      
      const onData = (data: Buffer) => {
        output += data.toString();
      };

      const onError = (error: Error) => {
        this.claudeProcess?.stdout?.off('data', onData);
        reject(error);
      };

      this.claudeProcess?.stdout?.on('data', onData);
      this.claudeProcess?.on('error', onError);

      // Send command
      this.claudeProcess?.stdin?.write(command + '\n');

      // Set timeout for response
      setTimeout(() => {
        this.claudeProcess?.stdout?.off('data', onData);
        this.claudeProcess?.off('error', onError);
        resolve(output);
      }, 5000);
    });
  }

  isTerminalActive(): boolean {
    return this.claudeProcess !== null;
  }
}