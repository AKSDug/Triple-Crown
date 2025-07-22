/**
 * Triple-Crown Obsidian Plugin
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, MarkdownView, Modal, TextComponent, TextAreaComponent, DropdownComponent, ToggleComponent, Notice } from 'obsidian';
import { ClaudeService } from './claude-service';
import { TripleCrownSettings, DEFAULT_SETTINGS } from './settings';
import { TerminalView, TERMINAL_VIEW_TYPE } from './terminal-view';
import { WritingAssistantAction } from './actions/writing-assistant';
import { TagBuilderAction } from './actions/tag-builder';
import { ConnectionFinderAction } from './actions/connection-finder';
import { TherapistModeAction } from './actions/therapist-mode';
import { CodeReviewerAction } from './actions/code-reviewer';
import { PeerReviewerAction } from './actions/peer-reviewer';
import { ResearchAssistantAction } from './actions/research-assistant';
import { CustomActionManager } from './actions/custom-action';
import { CustomActionDefinition, ActionCategory } from './actions/base-action';
import { PluginEcosystemDetector } from './plugin-ecosystem';
import { EnhancedTerminalService } from './enhanced-terminal';
import { ContextGenerator } from './context-generator';

export default class TripleCrownPlugin extends Plugin {
  settings: TripleCrownSettings;
  claudeService: ClaudeService;
  writingAssistant: WritingAssistantAction;
  tagBuilder: TagBuilderAction;
  connectionFinder: ConnectionFinderAction;
  therapistMode: TherapistModeAction;
  codeReviewer: CodeReviewerAction;
  peerReviewer: PeerReviewerAction;
  researchAssistant: ResearchAssistantAction;
  customActionManager: CustomActionManager;
  pluginDetector: PluginEcosystemDetector;
  enhancedTerminal: EnhancedTerminalService;
  contextGenerator: ContextGenerator;

  async onload() {
    await this.loadSettings();

    // Initialize services
    this.claudeService = new ClaudeService(this.app, this.settings);
    
    // Initialize actions
    this.writingAssistant = new WritingAssistantAction(this.app, this.claudeService);
    this.tagBuilder = new TagBuilderAction(this.app, this.claudeService);
    this.connectionFinder = new ConnectionFinderAction(this.app, this.claudeService);
    this.therapistMode = new TherapistModeAction(this.app, this.claudeService);
    this.codeReviewer = new CodeReviewerAction(this.app, this.claudeService);
    this.peerReviewer = new PeerReviewerAction(this.app, this.claudeService);
    this.researchAssistant = new ResearchAssistantAction(this.app, this.claudeService);
    
    // Initialize ecosystem detection and enhanced terminal
    this.pluginDetector = new PluginEcosystemDetector(this.app);
    this.enhancedTerminal = new EnhancedTerminalService(this.app, this.claudeService, this.settings);
    
    // Initialize context generator
    this.contextGenerator = new ContextGenerator(this.app, this.settings, this.pluginDetector);
    await this.contextGenerator.initializeOrUpdateContext();
    this.contextGenerator.updateContextPeriodically();
    
    // Initialize custom action manager
    this.customActionManager = new CustomActionManager(this.app, this.claudeService);
    this.customActionManager.loadCustomActions(this.settings.customActions);
    
    // Register custom action commands
    this.registerCustomActionCommands();

    // Register terminal view (use enhanced terminal)
    this.registerView(
      TERMINAL_VIEW_TYPE,
      (leaf) => new TerminalView(leaf, this.enhancedTerminal)
    );

    // Add ribbon icon
    this.addRibbonIcon('terminal', 'Open Claude Terminal', () => {
      this.activateView();
    });

    // Add commands
    this.addCommand({
      id: 'open-claude-terminal',
      name: 'Open Claude Terminal',
      callback: () => {
        this.activateView();
      }
    });

    this.addCommand({
      id: 'writing-assistant',
      name: 'Writing Assistant',
      editorCallback: (editor, ctx) => {
        const view = ctx as MarkdownView;
        if (view && view.file) {
          this.writingAssistant.execute(editor, view);
        }
      }
    });

    this.addCommand({
      id: 'duplicate-and-edit',
      name: 'Duplicate & Edit',
      editorCallback: (editor, ctx) => {
        const view = ctx as MarkdownView;
        if (view && view.file) {
          this.writingAssistant.duplicateAndEdit(editor, view);
        }
      }
    });

    this.addCommand({
      id: 'tag-builder',
      name: 'Generate Tags',
      editorCallback: (editor, ctx) => {
        const view = ctx as MarkdownView;
        if (view && this.settings.enabledActions.tagBuilder) {
          this.tagBuilder.execute(editor, view);
        }
      }
    });

    this.addCommand({
      id: 'connection-finder',
      name: 'Find Connections',
      editorCallback: (editor, ctx) => {
        const view = ctx as MarkdownView;
        if (view && this.settings.enabledActions.connectionFinder) {
          this.connectionFinder.execute(editor, view);
        }
      }
    });

    this.addCommand({
      id: 'therapist-mode',
      name: 'Therapist Mode (Reflection)',
      editorCallback: (editor, ctx) => {
        const view = ctx as MarkdownView;
        if (view && this.settings.enabledActions.therapistMode) {
          this.therapistMode.execute(editor, view);
        }
      }
    });

    this.addCommand({
      id: 'code-reviewer',
      name: 'Review Code',
      editorCallback: (editor, ctx) => {
        const view = ctx as MarkdownView;
        if (view && this.settings.enabledActions.codeReviewer) {
          this.codeReviewer.execute(editor, view);
        }
      }
    });

    this.addCommand({
      id: 'peer-reviewer',
      name: 'Academic Peer Review',
      editorCallback: (editor, ctx) => {
        const view = ctx as MarkdownView;
        if (view && this.settings.enabledActions.peerReviewer) {
          this.peerReviewer.execute(editor, view);
        }
      }
    });

    this.addCommand({
      id: 'research-assistant',
      name: 'Research Assistant',
      editorCallback: (editor, ctx) => {
        const view = ctx as MarkdownView;
        if (view && this.settings.enabledActions.researchAssistant) {
          this.researchAssistant.execute(editor, view);
        }
      }
    });

    // Add settings tab
    this.addSettingTab(new TripleCrownSettingTab(this.app, this));

    console.log('Triple-Crown plugin loaded');
  }

  async onunload() {
    if (this.claudeService) {
      await this.claudeService.cleanup();
    }
    console.log('Triple-Crown plugin unloaded');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // Reload custom actions when settings change
    if (this.customActionManager) {
      this.customActionManager.loadCustomActions(this.settings.customActions);
    }
  }

  registerCustomActionCommands() {
    // Clear existing custom commands first
    // Note: Obsidian doesn't provide a clean way to unregister commands
    // This is a limitation we'll document
    
    const customActions = this.customActionManager.getCustomActions();
    customActions.forEach(action => {
      this.addCommand({
        id: `custom-${action.config.id}`,
        name: action.config.name,
        editorCallback: (editor, ctx) => {
          const view = ctx as MarkdownView;
          if (view) {
            action.execute(editor, view);
          }
        }
      });
    });
  }

  async activateView() {
    const { workspace } = this.app;
    
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(TERMINAL_VIEW_TYPE);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      // Use getRightLeaf as getBottomLeaf doesn't exist
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: TERMINAL_VIEW_TYPE, active: true });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
}

class TripleCrownSettingTab extends PluginSettingTab {
  plugin: TripleCrownPlugin;

  constructor(app: App, plugin: TripleCrownPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Connection Configuration' });

    new Setting(containerEl)
      .setName('Connection Mode')
      .setDesc('Choose how to connect to Claude: API (requires key), CLI (Pro/Max subscribers), or Hybrid (CLI with API fallback)')
      .addDropdown(dropdown => dropdown
        .addOption('api', 'API Only (requires API key)')
        .addOption('cli', 'Claude-Code CLI (Pro/Max subscribers)')
        .addOption('hybrid', 'Hybrid (CLI preferred, API fallback)')
        .setValue(this.plugin.settings.connectionMode)
        .onChange(async (value) => {
          this.plugin.settings.connectionMode = value as any;
          await this.plugin.saveSettings();
          this.display(); // Refresh to show/hide relevant settings
        }));

    // Show API settings if API mode is enabled
    if (this.plugin.settings.connectionMode === 'api' || this.plugin.settings.connectionMode === 'hybrid') {
      new Setting(containerEl)
        .setName('Claude API Key')
        .setDesc('Your Anthropic API key. Get one at https://console.anthropic.com')
        .addText(text => text
          .setPlaceholder('sk-ant-...')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          }));
    }

    // Show CLI settings if CLI mode is enabled  
    if (this.plugin.settings.connectionMode === 'cli' || this.plugin.settings.connectionMode === 'hybrid') {
      new Setting(containerEl)
        .setName('Claude CLI Path')
        .setDesc('Path to claude-code CLI executable (leave default if installed globally)')
        .addText(text => text
          .setPlaceholder('claude-code')
          .setValue(this.plugin.settings.cliPath)
          .onChange(async (value) => {
            this.plugin.settings.cliPath = value;
            await this.plugin.saveSettings();
          }));

      if (this.plugin.settings.connectionMode === 'hybrid') {
        new Setting(containerEl)
          .setName('Fallback to API')
          .setDesc('Use API if CLI fails (requires API key)')
          .addToggle(toggle => toggle
            .setValue(this.plugin.settings.fallbackToAPI)
            .onChange(async (value) => {
              this.plugin.settings.fallbackToAPI = value;
              await this.plugin.saveSettings();
            }));
      }
    }

    new Setting(containerEl)
      .setName('API Endpoint')
      .setDesc('Claude API endpoint URL (leave default unless using a proxy)')
      .addText(text => text
        .setPlaceholder('https://api.anthropic.com/v1/messages')
        .setValue(this.plugin.settings.apiEndpoint)
        .onChange(async (value) => {
          this.plugin.settings.apiEndpoint = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Model Name')
      .setDesc('Claude model to use for requests')
      .addDropdown(dropdown => dropdown
        .addOption('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet (Latest)')
        .addOption('claude-3-5-haiku-20241022', 'Claude 3.5 Haiku')
        .addOption('claude-3-opus-20240229', 'Claude 3 Opus')
        .setValue(this.plugin.settings.modelName)
        .onChange(async (value) => {
          this.plugin.settings.modelName = value;
          await this.plugin.saveSettings();
        }));

    containerEl.createEl('h2', { text: 'Feature Settings' });

    new Setting(containerEl)
      .setName('Auto-save duplicates')
      .setDesc('Automatically save duplicate & edit results')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoSaveDuplicates)
        .onChange(async (value) => {
          this.plugin.settings.autoSaveDuplicates = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Show inline changes')
      .setDesc('Display strikethrough deletions and bold additions')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showInlineChanges)
        .onChange(async (value) => {
          this.plugin.settings.showInlineChanges = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Include reasoning')
      .setDesc('Add Claude\'s reasoning in blockquotes')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeReasoning)
        .onChange(async (value) => {
          this.plugin.settings.includeReasoning = value;
          await this.plugin.saveSettings();
        }));

    containerEl.createEl('h2', { text: 'Actions' });

    new Setting(containerEl)
      .setName('Writing Assistant')
      .setDesc('AI-powered writing assistance and editing')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enabledActions.writingAssistant)
        .onChange(async (value) => {
          this.plugin.settings.enabledActions.writingAssistant = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Tag Builder')
      .setDesc('Automatically generate relevant tags for your content')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enabledActions.tagBuilder)
        .onChange(async (value) => {
          this.plugin.settings.enabledActions.tagBuilder = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Connection Finder')
      .setDesc('Discover relationships between notes and concepts')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enabledActions.connectionFinder)
        .onChange(async (value) => {
          this.plugin.settings.enabledActions.connectionFinder = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Therapist Mode')
      .setDesc('Reflective journaling assistant (disabled by default for privacy)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enabledActions.therapistMode)
        .onChange(async (value) => {
          this.plugin.settings.enabledActions.therapistMode = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Code Reviewer')
      .setDesc('Technical code review focusing on security and best practices')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enabledActions.codeReviewer)
        .onChange(async (value) => {
          this.plugin.settings.enabledActions.codeReviewer = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Peer Reviewer')
      .setDesc('Academic peer review for research papers and scholarly writing')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enabledActions.peerReviewer)
        .onChange(async (value) => {
          this.plugin.settings.enabledActions.peerReviewer = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Research Assistant')
      .setDesc('Aggregate sources, create link trees, and organize research materials')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enabledActions.researchAssistant)
        .onChange(async (value) => {
          this.plugin.settings.enabledActions.researchAssistant = value;
          await this.plugin.saveSettings();
        }));

    containerEl.createEl('h2', { text: 'Enhanced Terminal' });

    new Setting(containerEl)
      .setName('Enable General Tools')
      .setDesc('Allow terminal to execute general development and analysis tools beyond Claude')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.terminalSettings.enableGeneralTools)
        .onChange(async (value) => {
          this.plugin.settings.terminalSettings.enableGeneralTools = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Allow Sandboxed Execution')
      .setDesc('Enable sandboxed code execution (requires confirmation for safety)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.terminalSettings.allowSandboxedExecution)
        .onChange(async (value) => {
          this.plugin.settings.terminalSettings.allowSandboxedExecution = value;
          await this.plugin.saveSettings();
        }));

    containerEl.createEl('h2', { text: 'Plugin Integration' });

    new Setting(containerEl)
      .setName('Detect Installed Plugins')
      .setDesc('Automatically detect other Obsidian plugins to enhance Claude prompts and formatting')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.pluginIntegration.detectInstalledPlugins)
        .onChange(async (value) => {
          this.plugin.settings.pluginIntegration.detectInstalledPlugins = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Enable Cross-Plugin Features')
      .setDesc('Allow Triple-Crown to use capabilities from other plugins (e.g., Dataview queries, Templater syntax)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.pluginIntegration.enableCrossPluginFeatures)
        .onChange(async (value) => {
          this.plugin.settings.pluginIntegration.enableCrossPluginFeatures = value;
          await this.plugin.saveSettings();
        }));

    // Show detected plugins
    if (this.plugin.settings.pluginIntegration.detectInstalledPlugins) {
      const pluginStatus = containerEl.createDiv('plugin-status');
      pluginStatus.createEl('h4', { text: 'Detected Plugin Integrations' });
      pluginStatus.createEl('p', { 
        text: 'Triple-Crown will automatically detect and integrate with supported plugins like Dataview, Templater, Citations, and more.',
        cls: 'setting-item-description' 
      });
      
      // Add button to refresh plugin detection
      new Setting(pluginStatus)
        .setName('Refresh Plugin Detection')
        .setDesc('Scan for newly installed plugins and update integrations')
        .addButton(button => button
          .setButtonText('Refresh')
          .onClick(async () => {
            // Trigger plugin detection refresh
            if (this.plugin.pluginDetector) {
              await this.plugin.pluginDetector.detectInstalledPlugins();
            }
            new Notice('Plugin integrations refreshed');
          }));
    }

    containerEl.createEl('h2', { text: 'Custom Actions' });
    
    containerEl.createEl('p', { 
      text: 'Create your own custom actions with personalized prompts. Note: Requires plugin reload to register new commands.',
      cls: 'setting-item-description'
    });

    // Display existing custom actions
    this.plugin.settings.customActions.forEach((action, index) => {
      const actionContainer = containerEl.createDiv('custom-action-item');
      
      actionContainer.createEl('h4', { text: action.name });
      actionContainer.createEl('p', { text: action.description });
      
      const controlsDiv = actionContainer.createDiv('custom-action-controls');
      
      // Enable/disable toggle
      const enableSetting = new Setting(controlsDiv)
        .setName('Enabled')
        .addToggle(toggle => toggle
          .setValue(action.enabled)
          .onChange(async (value) => {
            this.plugin.settings.customActions[index].enabled = value;
            await this.plugin.saveSettings();
          }));
      
      // Delete button
      const deleteSetting = new Setting(controlsDiv)
        .setName('Delete')
        .addButton(button => button
          .setButtonText('Delete')
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.customActions.splice(index, 1);
            await this.plugin.saveSettings();
            this.display(); // Refresh the settings display
          }));
    });

    // Add new custom action button
    new Setting(containerEl)
      .setName('Add Custom Action')
      .setDesc('Create a new custom action')
      .addButton(button => button
        .setButtonText('Add Custom Action')
        .setCta()
        .onClick(() => {
          this.showCustomActionModal();
        }));
  }

  showCustomActionModal() {
    const modal = new CustomActionModal(this.app, (definition) => {
      this.plugin.settings.customActions.push(definition);
      this.plugin.saveSettings();
      this.display(); // Refresh settings display
    });
    modal.open();
  }
}

class CustomActionModal extends Modal {
  private onSubmit: (definition: CustomActionDefinition) => void;
  private nameInput: TextComponent;
  private descriptionInput: TextComponent;
  private promptInput: TextAreaComponent;
  private categoryDropdown: DropdownComponent;
  private requiresSelectionToggle: ToggleComponent;

  constructor(app: App, onSubmit: (definition: CustomActionDefinition) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Create Custom Action' });

    // Action Name
    new Setting(contentEl)
      .setName('Action Name')
      .setDesc('Display name for the action')
      .addText(text => {
        this.nameInput = text;
        text.setPlaceholder('My Custom Action');
      });

    // Description
    new Setting(contentEl)
      .setName('Description')
      .setDesc('Brief description of what this action does')
      .addText(text => {
        this.descriptionInput = text;
        text.setPlaceholder('Describe what this action does...');
      });

    // Category
    new Setting(contentEl)
      .setName('Category')
      .setDesc('Category for organizing actions')
      .addDropdown(dropdown => {
        this.categoryDropdown = dropdown;
        dropdown.addOption(ActionCategory.WRITING, 'Writing');
        dropdown.addOption(ActionCategory.ANALYSIS, 'Analysis');
        dropdown.addOption(ActionCategory.ORGANIZATION, 'Organization');
        dropdown.addOption(ActionCategory.REVIEW, 'Review');
        dropdown.addOption(ActionCategory.CUSTOM, 'Custom');
        dropdown.setValue(ActionCategory.CUSTOM);
      });

    // Requires Selection
    new Setting(contentEl)
      .setName('Requires Selection')
      .setDesc('Whether this action requires selected text to work')
      .addToggle(toggle => {
        this.requiresSelectionToggle = toggle;
        toggle.setValue(false);
      });

    // System Prompt
    const promptSetting = new Setting(contentEl)
      .setName('System Prompt')
      .setDesc('The prompt that defines how Claude should behave for this action');

    const promptContainer = promptSetting.settingEl.createDiv();
    this.promptInput = new TextAreaComponent(promptContainer);
    this.promptInput.inputEl.rows = 10;
    this.promptInput.inputEl.cols = 50;
    this.promptInput.setPlaceholder('You are a helpful assistant that...\n\nYour task is to...\n\nPlease respond by...');

    // Buttons
    const buttonContainer = contentEl.createDiv('modal-button-container');
    
    const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelButton.onclick = () => this.close();

    const createButton = buttonContainer.createEl('button', { text: 'Create Action', cls: 'mod-cta' });
    createButton.onclick = () => this.createAction();
  }

  createAction() {
    const name = this.nameInput.getValue().trim();
    const description = this.descriptionInput.getValue().trim();
    const prompt = this.promptInput.getValue().trim();
    const category = this.categoryDropdown.getValue() as ActionCategory;
    const requiresSelection = this.requiresSelectionToggle.getValue();

    if (!name || !description || !prompt) {
      // Simple validation - could be enhanced with proper error display
      return;
    }

    const definition: CustomActionDefinition = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name,
      description,
      prompt,
      category,
      enabled: true,
      requiresSelection,
      supportedFileTypes: ['md']
    };

    this.onSubmit(definition);
    this.close();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}