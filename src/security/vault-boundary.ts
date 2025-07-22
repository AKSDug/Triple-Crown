/**
 * Triple-Crown Obsidian Plugin - Vault Security
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { App, normalizePath } from 'obsidian';
import * as path from 'path';

export class VaultBoundary {
  private vaultPath: string;
  
  constructor(private app: App) {
    this.vaultPath = this.getVaultPath();
  }

  /**
   * Get the absolute path to the vault root
   */
  private getVaultPath(): string {
    return (this.app.vault.adapter as any).path || '';
  }

  /**
   * Check if a path is within the vault boundaries
   */
  isPathInVault(testPath: string): boolean {
    try {
      const normalizedTestPath = path.resolve(testPath);
      const normalizedVaultPath = path.resolve(this.vaultPath);
      
      // Check if the path starts with the vault path
      return normalizedTestPath.startsWith(normalizedVaultPath);
    } catch (error) {
      // If path resolution fails, deny access
      return false;
    }
  }

  /**
   * Sanitize and validate a path to ensure it's within the vault
   */
  sanitizePath(inputPath: string): string | null {
    try {
      // If it's already a vault-relative path, use it
      if (!path.isAbsolute(inputPath)) {
        const vaultRelativePath = normalizePath(inputPath);
        const absolutePath = path.join(this.vaultPath, vaultRelativePath);
        
        if (this.isPathInVault(absolutePath)) {
          return absolutePath;
        }
      } else {
        // For absolute paths, check if they're in the vault
        if (this.isPathInVault(inputPath)) {
          return inputPath;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get vault-relative path from absolute path
   */
  getRelativePath(absolutePath: string): string | null {
    if (!this.isPathInVault(absolutePath)) {
      return null;
    }
    
    return path.relative(this.vaultPath, absolutePath);
  }

  /**
   * Validate that a file operation is allowed
   */
  validateFileOperation(filePath: string, operation: 'read' | 'write' | 'delete'): boolean {
    // First check if path is in vault
    if (!this.isPathInVault(filePath)) {
      console.warn(`Security: Blocked ${operation} operation outside vault: ${filePath}`);
      return false;
    }

    // Additional checks for sensitive files
    const relativePath = this.getRelativePath(filePath);
    if (!relativePath) return false;

    // Block access to .obsidian folder (except for plugin's own config)
    if (relativePath.startsWith('.obsidian/') && 
        !relativePath.startsWith('.obsidian/plugins/triple-crown/')) {
      console.warn(`Security: Blocked ${operation} operation on Obsidian config: ${filePath}`);
      return false;
    }

    // Block access to hidden files (except .claude folder)
    if (relativePath.match(/^\.[^\/]+/) && !relativePath.startsWith('.claude/')) {
      console.warn(`Security: Blocked ${operation} operation on hidden file: ${filePath}`);
      return false;
    }

    return true;
  }

  /**
   * Create a security context for Claude operations
   */
  createSecurityContext(): SecurityContext {
    return {
      vaultPath: this.vaultPath,
      allowedPaths: [this.vaultPath],
      blockedPaths: [
        path.join(this.vaultPath, '.obsidian'),
        path.join(this.vaultPath, '.git')
      ],
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowedExtensions: [
        '.md', '.txt', '.json', '.yaml', '.yml', 
        '.csv', '.tsv', '.html', '.xml'
      ]
    };
  }
}

export interface SecurityContext {
  vaultPath: string;
  allowedPaths: string[];
  blockedPaths: string[];
  maxFileSize: number;
  allowedExtensions: string[];
}