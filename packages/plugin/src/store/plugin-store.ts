/**
 * Zustand store for plugin state
 */

import { create } from 'zustand';
import type { PrototypeConfig } from '@orchestrator/shared';

interface FileInfo {
  key: string;
  name: string;
}

interface PluginStore {
  config: PrototypeConfig | null;
  fileInfo: FileInfo | null;
  isSaving: boolean;
  isPublishing: boolean;

  setConfig: (config: PrototypeConfig | null) => void;
  setFileInfo: (fileInfo: FileInfo) => void;
  setSaving: (isSaving: boolean) => void;
  setPublishing: (isPublishing: boolean) => void;
}

export const usePluginStore = create<PluginStore>(set => ({
  config: null,
  fileInfo: null,
  isSaving: false,
  isPublishing: false,

  setConfig: config => set({ config }),
  setFileInfo: fileInfo => set({ fileInfo }),
  setSaving: isSaving => set({ isSaving }),
  setPublishing: isPublishing => set({ isPublishing }),
}));
