/**
 * Triple-Crown Obsidian Plugin - Plugin Ecosystem Detection
 * Copyright (c) 2024 AKSDug
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * See LICENSE file for full terms.
 */

import { App } from 'obsidian';

export interface DetectedPlugin {
  id: string;
  name: string;
  enabled: boolean;
  version?: string;
  capabilities: PluginCapability[];
  integration: PluginIntegration;
}

export interface PluginCapability {
  type: 'dataview' | 'templater' | 'canvas' | 'graph' | 'calendar' | 'kanban' | 'citation' | 'export' | 'search' | 'custom';
  description: string;
  commands?: string[];
  apiMethods?: string[];
}

export interface PluginIntegration {
  supportLevel: 'full' | 'partial' | 'basic' | 'none';
  enhancedPrompts: boolean;
  customFormatting: boolean;
  dataAccess: boolean;
  commandIntegration: boolean;
}

export class PluginEcosystemDetector {
  private app: App;
  private detectedPlugins: Map<string, DetectedPlugin> = new Map();

  constructor(app: App) {
    this.app = app;
  }

  async detectInstalledPlugins(): Promise<DetectedPlugin[]> {
    this.detectedPlugins.clear();

    // Get all installed plugins
    const pluginManifests = (this.app as any).plugins?.manifests || {};
    const enabledPlugins = (this.app as any).plugins?.enabledPlugins || new Set();

    for (const [pluginId, manifest] of Object.entries(pluginManifests)) {
      const plugin = await this.analyzePlugin(
        pluginId,
        manifest as any,
        enabledPlugins.has(pluginId)
      );
      
      if (plugin) {
        this.detectedPlugins.set(pluginId, plugin);
      }
    }

    return Array.from(this.detectedPlugins.values());
  }

  private async analyzePlugin(pluginId: string, manifest: any, enabled: boolean): Promise<DetectedPlugin | null> {
    const capabilities = this.detectCapabilities(pluginId, manifest);
    const integration = this.assessIntegration(pluginId, capabilities);

    if (capabilities.length === 0 && integration.supportLevel === 'none') {
      return null;
    }

    return {
      id: pluginId,
      name: manifest.name || pluginId,
      enabled,
      version: manifest.version,
      capabilities,
      integration
    };
  }

  private detectCapabilities(pluginId: string, manifest: any): PluginCapability[] {
    const capabilities: PluginCapability[] = [];

    // Known plugin capabilities
    const knownCapabilities: Record<string, PluginCapability[]> = {
      'dataview': [{
        type: 'dataview',
        description: 'Query and display vault data with SQL-like syntax',
        apiMethods: ['api.pages', 'api.page', 'api.query']
      }],
      'templater-obsidian': [{
        type: 'templater',
        description: 'Advanced template system with JavaScript execution',
        apiMethods: ['templater.create_new_note_from_template']
      }],
      'obsidian-kanban': [{
        type: 'kanban',
        description: 'Kanban board project management',
        commands: ['kanban:create-new-board']
      }],
      'calendar': [{
        type: 'calendar',
        description: 'Calendar view and daily note integration',
        commands: ['calendar:open-weekly-note']
      }],
      'obsidian-citation-plugin': [{
        type: 'citation',
        description: 'Academic citation management and bibliography',
        commands: ['citation:insert-citation']
      }],
      'obsidian-git': [{
        type: 'export',
        description: 'Git version control integration',
        commands: ['obsidian-git:commit', 'obsidian-git:push']
      }],
      'omnisearch': [{
        type: 'search',
        description: 'Enhanced search with fuzzy matching',
        apiMethods: ['search.query']
      }],
      'canvas': [{
        type: 'canvas',
        description: 'Visual mind mapping and concept connections',
        commands: ['canvas:create-new-canvas']
      }]
    };

    // Check for known plugins
    if (knownCapabilities[pluginId]) {
      capabilities.push(...knownCapabilities[pluginId]);
    }

    // Detect capabilities from manifest
    if (manifest.description) {
      const description = manifest.description.toLowerCase();
      
      if (description.includes('dataview') || description.includes('query')) {
        capabilities.push({
          type: 'dataview',
          description: 'Data querying capabilities detected'
        });
      }
      
      if (description.includes('template')) {
        capabilities.push({
          type: 'templater',
          description: 'Template functionality detected'
        });
      }
      
      if (description.includes('calendar') || description.includes('date')) {
        capabilities.push({
          type: 'calendar',
          description: 'Calendar/date functionality detected'
        });
      }
      
      if (description.includes('citation') || description.includes('bibliography')) {
        capabilities.push({
          type: 'citation',
          description: 'Citation management detected'
        });
      }
      
      if (description.includes('graph') || description.includes('network')) {
        capabilities.push({
          type: 'graph',
          description: 'Graph/network visualization detected'
        });
      }
      
      if (description.includes('export') || description.includes('publish')) {
        capabilities.push({
          type: 'export',
          description: 'Export/publishing functionality detected'
        });
      }
    }

    return capabilities;
  }

  private assessIntegration(pluginId: string, capabilities: PluginCapability[]): PluginIntegration {
    // High-priority integrations
    const highPriorityPlugins = [
      'dataview', 'templater-obsidian', 'obsidian-citation-plugin', 
      'calendar', 'obsidian-kanban'
    ];

    const hasHighPriorityCapabilities = capabilities.some(cap => 
      ['dataview', 'templater', 'citation', 'calendar', 'kanban'].includes(cap.type)
    );

    if (highPriorityPlugins.includes(pluginId) || hasHighPriorityCapabilities) {
      return {
        supportLevel: 'full',
        enhancedPrompts: true,
        customFormatting: true,
        dataAccess: true,
        commandIntegration: true
      };
    }

    // Medium priority integrations
    const mediumPriorityTypes = ['graph', 'canvas', 'export', 'search'];
    const hasMediumPriorityCapabilities = capabilities.some(cap => 
      mediumPriorityTypes.includes(cap.type)
    );

    if (hasMediumPriorityCapabilities) {
      return {
        supportLevel: 'partial',
        enhancedPrompts: true,
        customFormatting: false,
        dataAccess: false,
        commandIntegration: true
      };
    }

    // Basic integration for other plugins
    if (capabilities.length > 0) {
      return {
        supportLevel: 'basic',
        enhancedPrompts: false,
        customFormatting: false,
        dataAccess: false,
        commandIntegration: false
      };
    }

    return {
      supportLevel: 'none',
      enhancedPrompts: false,
      customFormatting: false,
      dataAccess: false,
      commandIntegration: false
    };
  }

  getDetectedPlugin(pluginId: string): DetectedPlugin | null {
    return this.detectedPlugins.get(pluginId) || null;
  }

  getPluginsByCapability(capabilityType: string): DetectedPlugin[] {
    return Array.from(this.detectedPlugins.values()).filter(plugin =>
      plugin.capabilities.some(cap => cap.type === capabilityType)
    );
  }

  getIntegrationEnhancements(): IntegrationEnhancement[] {
    const enhancements: IntegrationEnhancement[] = [];

    this.detectedPlugins.forEach(plugin => {
      if (plugin.integration.supportLevel === 'none') return;

      plugin.capabilities.forEach(capability => {
        const enhancement = this.getEnhancementForCapability(plugin, capability);
        if (enhancement) {
          enhancements.push(enhancement);
        }
      });
    });

    return enhancements;
  }

  private getEnhancementForCapability(plugin: DetectedPlugin, capability: PluginCapability): IntegrationEnhancement | null {
    const enhancements: Record<string, IntegrationEnhancement> = {
      'dataview': {
        pluginId: plugin.id,
        type: 'prompt-enhancement',
        description: 'Enhanced prompts with dataview query suggestions',
        promptAdditions: [
          'Available Dataview queries: LIST, TABLE, CALENDAR',
          'Can generate dataview code blocks with proper syntax',
          'Access to vault metadata and file properties'
        ],
        formatSupport: ['dataview-query', 'table-generation', 'list-queries']
      },
      'templater': {
        pluginId: plugin.id,
        type: 'format-enhancement',
        description: 'Template-aware content generation',
        promptAdditions: [
          'Can generate Templater template syntax',
          'Supports dynamic content with JavaScript expressions',
          'Template variable substitution available'
        ],
        formatSupport: ['templater-syntax', 'dynamic-templates', 'js-expressions']
      },
      'citation': {
        pluginId: plugin.id,
        type: 'academic-enhancement',
        description: 'Academic citation formatting and bibliography management',
        promptAdditions: [
          'Supports multiple citation styles (APA, MLA, Chicago)',
          'Can format bibliographies and in-text citations',
          'Academic writing standards and conventions'
        ],
        formatSupport: ['citations', 'bibliography', 'academic-formatting']
      },
      'kanban': {
        pluginId: plugin.id,
        type: 'organization-enhancement',
        description: 'Project management and task organization',
        promptAdditions: [
          'Can suggest kanban board structures',
          'Task organization and priority management',
          'Project workflow optimization'
        ],
        formatSupport: ['kanban-boards', 'task-lists', 'project-structure']
      }
    };

    return enhancements[capability.type] || null;
  }
}

export interface IntegrationEnhancement {
  pluginId: string;
  type: 'prompt-enhancement' | 'format-enhancement' | 'command-enhancement' | 'academic-enhancement' | 'organization-enhancement';
  description: string;
  promptAdditions: string[];
  formatSupport: string[];
}