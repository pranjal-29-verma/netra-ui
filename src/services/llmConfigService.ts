import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface SupportedModel {
  id: string;
  label: string;
}

export interface SupportedProvider {
  provider: string;
  label: string;
  models: SupportedModel[];
}

export interface LLMConfig {
  id: number;
  provider: string;
  model_name: string;
  display_label: string;
  is_active: boolean;
  created_at: string;
}

export interface LLMSettings {
  use_custom_llm: boolean;
  active_config: LLMConfig | null;
  configs: LLMConfig[];
  system_default: { model: string };
}

export interface LLMConfigCreate {
  provider: string;
  model_name: string;
  display_label?: string;
  api_key: string;
}

const llmConfigService = {
  getSupportedModels: async (): Promise<SupportedProvider[]> => {
    const res = await api.get<SupportedProvider[]>(API_ENDPOINTS.ADMIN_LLM_SUPPORTED);
    return res.data;
  },

  getSettings: async (): Promise<LLMSettings> => {
    const res = await api.get<LLMSettings>(API_ENDPOINTS.ADMIN_LLM_SETTINGS);
    return res.data;
  },

  toggleSource: async (use_custom_llm: boolean): Promise<{ use_custom_llm: boolean }> => {
    const res = await api.patch(API_ENDPOINTS.ADMIN_LLM_TOGGLE, { use_custom_llm });
    return res.data;
  },

  createConfig: async (payload: LLMConfigCreate): Promise<LLMConfig> => {
    const res = await api.post<LLMConfig>(API_ENDPOINTS.ADMIN_LLM_CONFIGS, payload);
    return res.data;
  },

  testConfig: async (payload: LLMConfigCreate): Promise<{ success: boolean; message: string }> => {
    const res = await api.post(API_ENDPOINTS.ADMIN_LLM_CONFIG_TEST, payload);
    return res.data;
  },

  activateConfig: async (id: number): Promise<LLMConfig> => {
    const res = await api.post<LLMConfig>(API_ENDPOINTS.ADMIN_LLM_CONFIG_ACTIVATE(id));
    return res.data;
  },

  deactivateConfig: async (id: number): Promise<{ message: string }> => {
    const res = await api.post(API_ENDPOINTS.ADMIN_LLM_CONFIG_DEACTIVATE(id));
    return res.data;
  },

  deleteConfig: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN_LLM_CONFIG_DELETE(id));
  },
};

export default llmConfigService;
