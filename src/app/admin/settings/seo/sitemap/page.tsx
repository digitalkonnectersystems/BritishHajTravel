"use client";

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Send, CheckCircle, AlertTriangle, XCircle, Settings, FileText, History } from 'lucide-react';

export default function SitemapSettingsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'logs'>('overview');
  const [configs, setConfigs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const contentTypes = ['global', 'sitePages', 'packages', 'blogPosts', 'visaServices'];

  const fetchConfigs = async () => {
    const res = await fetch('/api/sitemap/config');
    const data = await res.json();
    if (data.success) {
      setConfigs(data.configs);
    }
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/sitemap/logs');
    const data = await res.json();
    if (data.success) {
      setLogs(data.logs);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchLogs();
  }, []);

  const getConfig = (type: string) => {
    return configs.find(c => c.contentType === type) || {
      contentType: type,
      includeInSitemap: true,
      changeFrequency: 'monthly',
      priority: '0.5',
      includeImages: true,
      includeLastModified: true
    };
  };

  const updateConfig = (type: string, key: string, value: any) => {
    const newConfigs = [...configs];
    const idx = newConfigs.findIndex(c => c.contentType === type);
    if (idx >= 0) {
      newConfigs[idx][key] = value;
    } else {
      newConfigs.push({
        contentType: type,
        includeInSitemap: true,
        changeFrequency: 'monthly',
        priority: '0.5',
        includeImages: true,
        includeLastModified: true,
        [key]: value
      });
    }
    setConfigs(newConfigs);
  };

  const handleSaveConfigs = async () => {
    setSaving(true);
    await fetch('/api/sitemap/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configs }),
    });
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch('/api/sitemap/generate', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      alert(`Sitemap generated! Total URLs: ${data.urlCount}`);
      fetchLogs();
    } else {
      alert('Error generating sitemap: ' + data.error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/sitemap/submit', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      alert('Sitemap submitted to search engines!');
      fetchLogs();
    } else {
      alert('Error submitting sitemap: ' + data.error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sitemap Management</h1>
          <p className="text-sm text-slate-500 mt-1">Configure and manage your XML Sitemaps for SEO</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Generate Now
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Send size={16} />
            Submit to Google & Bing
          </button>
        </div>
      </div>

      <div className="flex gap-6 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-2 border-b-2 font-medium ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <div className="flex items-center gap-2"><FileText size={16} /> Overview</div>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 px-2 border-b-2 font-medium ${activeTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <div className="flex items-center gap-2"><Settings size={16} /> Configuration</div>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-2 border-b-2 font-medium ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <div className="flex items-center gap-2"><History size={16} /> Logs & History</div>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Live Sitemap URL</h3>
            <a href="/sitemap.xml" target="_blank" className="text-blue-600 font-medium hover:underline break-all">
              {typeof window !== 'undefined' ? window.location.origin : ''}/sitemap.xml
            </a>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Last Generated</h3>
            <div className="text-xl font-bold text-slate-800">
              {logs.find(l => l.action === 'generate' && l.status === 'success')?.createdAt ? new Date(logs.find(l => l.action === 'generate' && l.status === 'success').createdAt).toLocaleString() : 'Never'}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Last Submitted</h3>
            <div className="text-xl font-bold text-slate-800">
              {logs.find(l => l.action === 'submit' && l.status === 'success')?.createdAt ? new Date(logs.find(l => l.action === 'submit' && l.status === 'success').createdAt).toLocaleString() : 'Never'}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Content Type Defaults</h2>
              <button
                onClick={handleSaveConfigs}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            <div className="space-y-8">
              {contentTypes.map((type) => {
                const conf = getConfig(type);
                return (
                  <div key={type} className="border border-slate-100 rounded-lg p-5 bg-slate-50">
                    <h3 className="text-md font-bold text-slate-800 mb-4 capitalize border-b border-slate-200 pb-2">
                      {type === 'global' ? 'Global Settings' : type.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={conf.includeInSitemap}
                            onChange={(e) => updateConfig(type, 'includeInSitemap', e.target.checked)}
                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                          />
                          <span className="text-sm font-medium text-slate-700">Include in Sitemap</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Change Frequency</label>
                        <select
                          value={conf.changeFrequency}
                          onChange={(e) => updateConfig(type, 'changeFrequency', e.target.value)}
                          className="w-full text-sm p-2 border border-slate-200 rounded outline-none"
                        >
                          {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Priority (0.0 to 1.0)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.0"
                          max="1.0"
                          value={conf.priority}
                          onChange={(e) => updateConfig(type, 'priority', e.target.value)}
                          className="w-full text-sm p-2 border border-slate-200 rounded outline-none"
                        />
                      </div>

                      {type !== 'global' && (
                        <>
                          <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={conf.includeImages}
                                onChange={(e) => updateConfig(type, 'includeImages', e.target.checked)}
                                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                              />
                              <span className="text-sm font-medium text-slate-700">Include Images</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={conf.includeLastModified}
                                onChange={(e) => updateConfig(type, 'includeLastModified', e.target.checked)}
                                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                              />
                              <span className="text-sm font-medium text-slate-700">Include Last Modified</span>
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
                <th className="p-4">Status</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No logs found</td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 text-sm hover:bg-slate-50">
                  <td className="p-4 text-slate-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-slate-800 capitalize">
                    {log.action}
                  </td>
                  <td className="p-4">
                    {log.status === 'success' && <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle size={14} /> Success</span>}
                    {log.status === 'warning' && <span className="inline-flex items-center gap-1 text-yellow-600"><AlertTriangle size={14} /> Warning</span>}
                    {log.status === 'error' && <span className="inline-flex items-center gap-1 text-red-600"><XCircle size={14} /> Error</span>}
                  </td>
                  <td className="p-4 text-slate-500 text-xs max-w-md truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
