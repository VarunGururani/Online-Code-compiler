import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL, checkBackendHealth, getIsDemoMode, setIsDemoMode } from '../services/api';
import Navbar from '../components/Navbar';
import {
  Settings,
  User,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  LogOut,
  RefreshCw,
  Server,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updatePreferences, logout } = useAuth();
  const {
    editorTheme,
    setEditorTheme,
    editorSettings,
    setEditorSettings,
  } = useProject();
  const { toast } = useToast();

  const [fontSize, setFontSize] = useState(editorSettings.fontSize || 14);
  const [tabSize, setTabSize] = useState(editorSettings.tabSize || 4);
  const [wordWrap, setWordWrap] = useState(editorSettings.wordWrap || 'on');
  const [minimap, setMinimap] = useState(editorSettings.minimap ?? true);
  const [defaultLang, setDefaultLang] = useState(user?.preferences?.defaultLanguage || 'python');

  // API Config state
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('cloud_ide_custom_api_url') || API_BASE_URL
  );
  const [isDemo, setIsDemoState] = useState(getIsDemoMode());
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  const testApiHealth = async () => {
    setCheckingHealth(true);
    setHealthStatus(null);
    try {
      const res = await checkBackendHealth();
      setHealthStatus(res);
      if (res.ok) {
        toast.success('Backend server is healthy and reachable!');
      } else {
        toast.warning('Backend server is offline. Sandbox Demo Engine is active.');
      }
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleSaveSettings = () => {
    setEditorSettings({
      fontSize: Number(fontSize),
      tabSize: Number(tabSize),
      wordWrap,
      minimap,
    });

    setIsDemoMode(isDemo);
    localStorage.setItem('cloud_ide_custom_api_url', apiUrl);

    updatePreferences({
      theme: editorTheme,
      fontSize: Number(fontSize),
      tabSize: Number(tabSize),
      wordWrap,
      minimap,
      defaultLanguage: defaultLang,
    });

    toast.success('Preferences saved successfully');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-850 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Title */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Settings & Preferences
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure your Monaco editor experience, cloud backend targets, and developer profile.
          </p>
        </div>

        {/* 1. Developer Profile */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-semibold text-slate-800">
            <User className="w-4 h-4 text-blue-600" />
            <span>Developer Profile</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 ring-2 ring-blue-500/20 flex items-center justify-center text-lg font-bold text-blue-600 shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'D'
              )}
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">{user?.name || 'Developer'}</p>
              <p className="text-xs text-slate-500 font-mono">{user?.email || 'developer@cloudide.io'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{user?.role || 'Senior Software Engineer'}</p>
            </div>
          </div>
        </section>

        {/* 2. Monaco Editor Preferences */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-semibold text-slate-800">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Monaco Editor Preferences</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 text-xs">
            {/* Theme */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Editor Theme</label>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="vs-light">VS Code Light (Default)</option>
                <option value="vs-dark">VS Code Dark</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Font Size (px)</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="12">12 px (Compact)</option>
                <option value="14">14 px (Standard)</option>
                <option value="16">16 px (Comfortable)</option>
                <option value="18">18 px (Large)</option>
              </select>
            </div>

            {/* Tab Size */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Tab Indentation</label>
              <select
                value={tabSize}
                onChange={(e) => setTabSize(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces (Recommended)</option>
                <option value="8">8 spaces</option>
              </select>
            </div>

            {/* Word Wrap */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Word Wrapping</label>
              <select
                value={wordWrap}
                onChange={(e) => setWordWrap(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="on">On (Wrap lines)</option>
                <option value="off">Off (Horizontal scroll)</option>
              </select>
            </div>

            {/* Minimap */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Code Minimap</label>
              <select
                value={minimap ? 'true' : 'false'}
                onChange={(e) => setMinimap(e.target.value === 'true')}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="true">Enabled (Show preview)</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            {/* Default Language */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Default Language</label>
              <select
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="python">Python 3.11</option>
                <option value="java">Java 17 LTS</option>
                <option value="cpp">C++20 (GCC 13.2)</option>
              </select>
            </div>
          </div>
        </section>

        {/* 3. Backend & Cloud Integration Configuration */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Backend & Execution Engine Mode</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              VITE_API_BASE_URL
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Mode Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">Execution Mode</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Choose between local simulated Docker container runner or real live Express backend API.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDemoState(true)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isDemo
                      ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  Sandbox Demo Mode
                </button>
                <button
                  type="button"
                  onClick={() => setIsDemoState(false)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    !isDemo
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  Live Backend API
                </button>
              </div>
            </div>

            {/* Base URL input */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Backend API Base URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:5000/api"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={testApiHealth}
                  disabled={checkingHealth}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer border border-slate-200"
                >
                  {checkingHealth ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Test Connection</span>
                </button>
              </div>
            </div>

            {/* Health result notification */}
            {healthStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  healthStatus.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {healthStatus.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                )}
                <span>
                  {healthStatus.ok
                    ? 'Connected to backend API successfully!'
                    : `Backend unreachable (${healthStatus.error || 'Connection refused'}). Sandbox Demo Engine is ready.`}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Action Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
