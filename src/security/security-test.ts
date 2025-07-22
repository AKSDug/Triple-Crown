/**
 * Triple-Crown Obsidian Plugin - Security Tests
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { VaultBoundary } from './vault-boundary';

export class SecurityTest {
  private vaultBoundary: VaultBoundary;

  constructor(vaultBoundary: VaultBoundary) {
    this.vaultBoundary = vaultBoundary;
  }

  /**
   * Test security boundary enforcement
   */
  runSecurityTests(): SecurityTestResults {
    const results: SecurityTestResults = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Test 1: Block access outside vault
    const testPaths = [
      '/etc/passwd',
      '/Users/testuser/Documents',
      '../../../etc/hosts',
      '~/.ssh/id_rsa',
      '/System/Library',
      'C:\\Windows\\System32',
      '/var/log/system.log'
    ];

    for (const testPath of testPaths) {
      const isBlocked = !this.vaultBoundary.isPathInVault(testPath);
      const testName = `Block access to: ${testPath}`;
      
      if (isBlocked) {
        results.passed++;
        results.tests.push({ name: testName, passed: true });
      } else {
        results.failed++;
        results.tests.push({ name: testName, passed: false, error: 'Should have been blocked' });
      }
    }

    // Test 2: Allow vault paths
    const vaultPaths = [
      'notes/example.md',
      '.claude/config.json',
      'folder/subfolder/file.txt'
    ];

    for (const vaultPath of vaultPaths) {
      const sanitized = this.vaultBoundary.sanitizePath(vaultPath);
      const testName = `Allow vault path: ${vaultPath}`;
      
      if (sanitized !== null) {
        results.passed++;
        results.tests.push({ name: testName, passed: true });
      } else {
        results.failed++;
        results.tests.push({ name: testName, passed: false, error: 'Should have been allowed' });
      }
    }

    // Test 3: Block sensitive files
    const sensitiveFiles = [
      '.obsidian/config.json',
      '.git/config',
      '.env',
      '.ssh/known_hosts'
    ];

    for (const sensitiveFile of sensitiveFiles) {
      const isBlocked = !this.vaultBoundary.validateFileOperation(sensitiveFile, 'read');
      const testName = `Block sensitive file: ${sensitiveFile}`;
      
      if (isBlocked) {
        results.passed++;
        results.tests.push({ name: testName, passed: true });
      } else {
        results.failed++;
        results.tests.push({ name: testName, passed: false, error: 'Should have been blocked' });
      }
    }

    return results;
  }

  /**
   * Generate security test report
   */
  generateReport(): string {
    const results = this.runSecurityTests();
    const total = results.passed + results.failed;
    const passRate = total > 0 ? (results.passed / total * 100).toFixed(1) : '0';

    let report = `🔒 Triple-Crown Security Test Report\n`;
    report += `====================================\n\n`;
    report += `Tests Run: ${total}\n`;
    report += `Passed: ${results.passed}\n`;
    report += `Failed: ${results.failed}\n`;
    report += `Pass Rate: ${passRate}%\n\n`;

    if (results.failed > 0) {
      report += `❌ Failed Tests:\n`;
      for (const test of results.tests.filter(t => !t.passed)) {
        report += `  - ${test.name}: ${test.error}\n`;
      }
      report += `\n`;
    }

    report += `✅ Passed Tests:\n`;
    for (const test of results.tests.filter(t => t.passed)) {
      report += `  - ${test.name}\n`;
    }

    return report;
  }
}

export interface SecurityTestResults {
  passed: number;
  failed: number;
  tests: SecurityTestCase[];
}

export interface SecurityTestCase {
  name: string;
  passed: boolean;
  error?: string;
}