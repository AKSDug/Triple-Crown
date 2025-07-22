/**
 * Triple-Crown Obsidian Plugin - Settings
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { CustomActionDefinition } from './actions/base-action';

export type ClaudeConnectionMode = 'api' | 'cli' | 'hybrid';

export interface TripleCrownSettings {
  // Connection Configuration
  connectionMode: ClaudeConnectionMode;
  apiKey: string;
  apiEndpoint: string;
  modelName: string;
  cliPath: string;
  fallbackToAPI: boolean;
  
  // Feature Settings
  autoSaveDuplicates: boolean;
  showInlineChanges: boolean;
  includeReasoning: boolean;
  duplicateFilePrefix: string;
  duplicateFileSuffix: string;
  enabledActions: {
    writingAssistant: boolean;
    tagBuilder: boolean;
    connectionFinder: boolean;
    therapistMode: boolean;
    codeReviewer: boolean;
    peerReviewer: boolean;
    researchAssistant: boolean;
  };
  customActions: CustomActionDefinition[];
  privacySettings: {
    neverSharePatterns: string[];
    requireConfirmation: boolean;
    logInteractions: boolean;
  };
  terminalSettings: {
    fontSize: number;
    theme: 'dark' | 'light';
    showTimestamps: boolean;
    maxHistorySize: number;
    enableGeneralTools: boolean;
    allowSandboxedExecution: boolean;
  };
  pluginIntegration: {
    detectInstalledPlugins: boolean;
    enableCrossPluginFeatures: boolean;
    supportedPlugins: string[];
  };
}

export const DEFAULT_SETTINGS: TripleCrownSettings = {
  // Connection Configuration
  connectionMode: 'api',
  apiKey: '',
  apiEndpoint: 'https://api.anthropic.com/v1/messages',
  modelName: 'claude-3-5-sonnet-20241022',
  cliPath: 'claude-code',
  fallbackToAPI: true,
  
  // Feature Settings
  autoSaveDuplicates: true,
  showInlineChanges: true,
  includeReasoning: true,
  duplicateFilePrefix: '',
  duplicateFileSuffix: '-claude-edit',
  enabledActions: {
    writingAssistant: true,
    tagBuilder: true,
    connectionFinder: true,
    therapistMode: false,
    codeReviewer: true,
    peerReviewer: true,
    researchAssistant: true
  },
  customActions: [],
  privacySettings: {
    neverSharePatterns: [
      '*.key',
      '*.pem',
      '*.cert',
      '*password*',
      '*secret*',
      '*token*'
    ],
    requireConfirmation: true,
    logInteractions: false
  },
  terminalSettings: {
    fontSize: 14,
    theme: 'dark',
    showTimestamps: true,
    maxHistorySize: 1000,
    enableGeneralTools: false,
    allowSandboxedExecution: false
  },
  pluginIntegration: {
    detectInstalledPlugins: true,
    enableCrossPluginFeatures: true,
    supportedPlugins: [
      'dataview',
      'templater',
      'kanban',
      'calendar',
      'graph-analysis',
      'citation'
    ]
  }
};

export interface ClaudeConfig {
  permissions: {
    scope: 'file' | 'folder' | 'vault';
    allowedPaths: string[];
    deniedPaths: string[];
  };
  actions: {
    enabled: string[];
    disabled: string[];
    customPrompts: { [key: string]: string };
  };
  privacy: {
    neverShare: string[];
    requireConfirmation: boolean;
  };
  context: {
    includeNearbyFiles: boolean;
    includeBacklinks: boolean;
    includeMetadata: boolean;
    maxContextSize: number;
  };
}