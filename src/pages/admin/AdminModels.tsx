import React, { useState } from 'react';
import {
  Cpu, CheckCircle, Circle, Trash2, Loader2,
  ChevronDown, Eye, EyeOff, TestTube, Plus, ToggleLeft, ToggleRight,
} from 'lucide-react';
import {
  useLLMSettings,
  useLLMSupportedModels,
  useToggleLLMSource,
  useCreateLLMConfig,
  useTestLLMConfig,
  useActivateLLMConfig,
  useDeactivateLLMConfig,
  useDeleteLLMConfig,
} from '../../hooks/useAdminQueries';
import type { LLMConfigCreate } from '../../services/llmConfigService';

// ── Add Config Form ───────────────────────────────────────────────────────────

interface AddConfigFormProps {
  onClose: () => void;
}

const AddConfigForm: React.FC<AddConfigFormProps> = ({ onClose }) => {
  const { data: providers = [] } = useLLMSupportedModels();
  const createConfig = useCreateLLMConfig();
  const testConfig   = useTestLLMConfig();

  const [provider,  setProvider]  = useState('');
  const [modelId,   setModelId]   = useState('');
  const [apiKey,    setApiKey]    = useState('');
  const [showKey,   setShowKey]   = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedProvider = providers.find((p) => p.provider === provider);
  const selectedModel    = selectedProvider?.models.find((m) => m.id === modelId);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    setModelId('');
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!modelId || !apiKey) return;
    setTestResult(null);
    try {
      const result = await testConfig.mutateAsync({ provider, model_name: modelId, api_key: apiKey });
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ success: false, message: err.response?.data?.detail || 'Test failed' });
    }
  };

  const handleSave = async () => {
    if (!provider || !modelId || !apiKey) return;
    const payload: LLMConfigCreate = {
      provider,
      model_name: modelId,
      display_label: selectedModel?.label,
      api_key: apiKey,
    };
    await createConfig.mutateAsync(payload);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Add Model Configuration</h3>

      {/* Provider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Provider</label>
        <div className="relative">
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a provider…</option>
            {providers.map((p) => (
              <option key={p.provider} value={p.provider}>{p.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Model</label>
        <div className="relative">
          <select
            value={modelId}
            onChange={(e) => { setModelId(e.target.value); setTestResult(null); }}
            disabled={!provider}
            className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <option value="">Select a model…</option>
            {selectedProvider?.models.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* API Key */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">API Key</label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setTestResult(null); }}
            placeholder="Paste your API key…"
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Test result */}
      {testResult && (
        <div className={`text-sm px-4 py-2.5 rounded-xl ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          {testResult.message}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleTest}
          disabled={!modelId || !apiKey || testConfig.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {testConfig.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
          Test Connection
        </button>

        <button
          onClick={handleSave}
          disabled={!provider || !modelId || !apiKey || createConfig.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-colors"
        >
          {createConfig.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Save Config
        </button>

        <button
          onClick={onClose}
          className="ml-auto text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export const AdminModels: React.FC = () => {
  const { data: settings, isLoading } = useLLMSettings();
  const toggleSource   = useToggleLLMSource();
  const activateConfig = useActivateLLMConfig();
  const deactivateConfig = useDeactivateLLMConfig();
  const deleteConfig   = useDeleteLLMConfig();

  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggle = () => {
    if (!settings) return;
    toggleSource.mutate(!settings.use_custom_llm);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const useCustom  = settings?.use_custom_llm ?? false;
  const active     = settings?.active_config ?? null;
  const configs    = settings?.configs ?? [];
  const sysDefault = settings?.system_default?.model ?? '—';

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Cpu className="w-5 h-5" /> LLM Model Configuration
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure which language model powers the chatbot. Users never see this page.
        </p>
      </div>

      {/* Source Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">LLM Source</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {useCustom
                ? 'Using your custom model configuration'
                : `Using app default: ${sysDefault}`}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggleSource.isPending || (!useCustom && !active)}
            title={!useCustom && !active ? 'Activate a config first' : undefined}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50
              border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {toggleSource.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : useCustom
                ? <ToggleRight className="w-5 h-5 text-primary-500" />
                : <ToggleLeft className="w-5 h-5" />}
            {useCustom ? 'Custom Model' : 'App Default'}
          </button>
        </div>

        {/* Active model banner */}
        {active && (
          <div className="mt-4 flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate">
                Active: {active.display_label}
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 font-mono truncate">{active.model_name}</p>
            </div>
            <span className="text-xs text-green-600 dark:text-green-500 capitalize">{active.provider}</span>
          </div>
        )}
      </div>

      {/* Add Config */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Model Config
        </button>
      ) : (
        <AddConfigForm onClose={() => setShowAddForm(false)} />
      )}

      {/* Saved Configs */}
      {configs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Saved Configurations</h2>
          {configs.map((cfg) => (
            <div
              key={cfg.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl border p-4 flex items-center gap-4 ${
                cfg.is_active
                  ? 'border-primary-400 dark:border-primary-600'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Status icon */}
              {cfg.is_active
                ? <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                : <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{cfg.display_label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">{cfg.model_name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-0.5">{cfg.provider}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {cfg.is_active ? (
                  <button
                    onClick={() => deactivateConfig.mutate(cfg.id)}
                    disabled={deactivateConfig.isPending && deactivateConfig.variables === cfg.id}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {deactivateConfig.isPending && deactivateConfig.variables === cfg.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : 'Deactivate'}
                  </button>
                ) : (
                  <button
                    onClick={() => activateConfig.mutate(cfg.id)}
                    disabled={activateConfig.isPending && activateConfig.variables === cfg.id}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-colors"
                  >
                    {activateConfig.isPending && activateConfig.variables === cfg.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : 'Activate'}
                  </button>
                )}
                <button
                  onClick={() => deleteConfig.mutate(cfg.id)}
                  disabled={cfg.is_active || (deleteConfig.isPending && deleteConfig.variables === cfg.id)}
                  title={cfg.is_active ? 'Deactivate before deleting' : 'Delete'}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteConfig.isPending && deleteConfig.variables === cfg.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {configs.length === 0 && !showAddForm && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
          No model configurations yet. Add one above.
        </p>
      )}
    </div>
  );
};
