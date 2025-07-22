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

import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, MarkdownView, Modal, TextComponent, TextAreaComponent, DropdownComponent, ToggleComponent } from 'obsidian';
import { ClaudeService } from './src/claude-service';
import { TripleCrownSettings, DEFAULT_SETTINGS } from './src/settings';
import { TerminalView, TERMINAL_VIEW_TYPE } from './src/terminal-view';
import { WritingAssistantAction } from './src/actions/writing-assistant';
import { TagBuilderAction } from './src/actions/tag-builder';
import { ConnectionFinderAction } from './src/actions/connection-finder';
import { TherapistModeAction } from './src/actions/therapist-mode';
import { CodeReviewerAction } from './src/actions/code-reviewer';
import { PeerReviewerAction } from './src/actions/peer-reviewer';
import { CustomActionManager } from './src/actions/custom-action';
import { CustomActionDefinition, ActionCategory } from './src/actions/base-action';

export default class TripleCrownPlugin extends Plugin {
  settings: TripleCrownSettings;
  claudeService: ClaudeService;
  writingAssistant: WritingAssistantAction;
  tagBuilder: TagBuilderAction;
  connectionFinder: ConnectionFinderAction;
  therapistMode: TherapistModeAction;
  codeReviewer: CodeReviewerAction;
  peerReviewer: PeerReviewerAction;
  customActionManager: CustomActionManager;

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
    
    // Initialize custom action manager
    this.customActionManager = new CustomActionManager(this.app, this.claudeService);
    this.customActionManager.loadCustomActions(this.settings.customActions);
    
    // Register custom action commands
    this.registerCustomActionCommands();

    // Register terminal view
    this.registerView(
      TERMINAL_VIEW_TYPE,
      (leaf) => new TerminalView(leaf, this.claudeService)
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

    containerEl.createEl('h2', { text: 'API Configuration' });

    new Setting(containerEl)
      .setName('Claude API Key')
      .setDesc('Your Anthropic API key (required). Get one at https://console.anthropic.com')
      .addText(text => text
        .setPlaceholder('sk-ant-...')
        .setValue(this.plugin.settings.apiKey)
        .onChange(async (value) => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        }));

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