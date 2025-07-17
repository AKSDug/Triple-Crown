export interface TripleCrownSettings {
  apiKey: string;
  useOAuth: boolean;
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
  };
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
  };
}

export const DEFAULT_SETTINGS: TripleCrownSettings = {
  apiKey: '',
  useOAuth: true,
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
    peerReviewer: true
  },
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
    maxHistorySize: 1000
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