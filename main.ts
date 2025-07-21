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

import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, MarkdownView } from 'obsidian';
import { ClaudeService } from './src/claude-service';
import { TripleCrownSettings, DEFAULT_SETTINGS } from './src/settings';
import { TerminalView, TERMINAL_VIEW_TYPE } from './src/terminal-view';
import { WritingAssistantAction } from './src/actions/writing-assistant';

export default class TripleCrownPlugin extends Plugin {
  settings: TripleCrownSettings;
  claudeService: ClaudeService;
  writingAssistant: WritingAssistantAction;

  async onload() {
    await this.loadSettings();

    // Initialize services
    this.claudeService = new ClaudeService(this.app, this.settings);
    this.writingAssistant = new WritingAssistantAction(this.app, this.claudeService);

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
  }
}