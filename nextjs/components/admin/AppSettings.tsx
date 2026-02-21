'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { mockAppSettings } from '@/lib/mock-data';
import { toast } from 'sonner';
import {
  Settings,
  BrainCircuit,
  CreditCard,
  Bell,
  Share2,
  Save,
} from 'lucide-react';
import type { AppSettings } from '@/types';

const REPLICATE_MODELS: { value: string; label: string }[] = [
  { value: 'meta/meta-llama-3-8b-instruct', label: 'Llama 3 8B Instruct' },
  { value: 'meta/meta-llama-3-70b-instruct', label: 'Llama 3 70B Instruct' },
  { value: 'mistralai/mistral-7b-instruct-v0.2', label: 'Mistral 7B Instruct' },
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
];

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}

function Section({ title, icon: Icon, children, delay = 0 }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="surface-card overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#A855F7]" />
        </div>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </motion.div>
  );
}

function SettingRow({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {sublabel && <p className="text-xs text-[#A598C7] mt-0.5">{sublabel}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AppSettings() {
  const t = useTranslations('appSettings');
  const tCommon = useTranslations('common');
  const [settings, setSettings] = useState<AppSettings>(mockAppSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.ai) {
          setSettings((s) => ({
            ...s,
            ai: {
              ...s.ai,
              activeModel: data.ai.replicateModelId ?? s.ai.activeModel,
              fortunePromptTemplate: data.ai.fortunePromptTemplate ?? s.ai.fortunePromptTemplate,
              maxTokens: data.ai.fortuneMaxTokens ?? s.ai.maxTokens,
              temperature: data.ai.fortuneTemperature ?? s.ai.temperature,
              testMode: data.ai.fortuneTestMode ?? s.ai.testMode,
            },
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (sectionKey: string) => {
    if (sectionKey === 'ai') {
      fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai: {
            replicateModelId: settings.ai.activeModel,
            fortunePromptTemplate: settings.ai.fortunePromptTemplate,
            fortuneMaxTokens: settings.ai.maxTokens,
            fortuneTemperature: settings.ai.temperature,
            fortuneTestMode: settings.ai.testMode,
          },
        }),
      })
        .then((r) => (r.ok ? Promise.resolve() : r.json().then((j) => Promise.reject(j))))
        .then(() => toast.success(t('settingsSaved', { section: t(sectionKey) })))
        .catch((err) => toast.error(err?.error ?? 'Failed to save'));
    } else {
      toast.success(t('settingsSaved', { section: t(sectionKey) }));
    }
  };

  const inputClass = "bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED]/50 transition-colors w-full";
  const saveBtn = "flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors mt-4";

  return (
    <div className="space-y-6">
      {/* General */}
      <Section title={t('generalSettings')} icon={Settings} delay={0}>
        <SettingRow label={t('siteActive')} sublabel={t('siteActiveDesc')}>
          <Switch
            checked={settings.general.siteActive}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, general: { ...s.general, siteActive: v } }))}
          />
        </SettingRow>
        <Separator className="bg-white/[0.06]" />
        <SettingRow label={t('acceptRegistrations')} sublabel={t('acceptRegistrationsDesc')}>
          <Switch
            checked={settings.general.acceptNewRegistrations}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, general: { ...s.general, acceptNewRegistrations: v } }))}
          />
        </SettingRow>
        <Separator className="bg-white/[0.06]" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#A598C7] mb-1.5 block">{t('maxFreeFortunes')}</label>
            <input
              type="number"
              value={settings.general.maxFreeFortunes}
              onChange={(e) => setSettings((s) => ({ ...s, general: { ...s.general, maxFreeFortunes: +e.target.value } }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-[#A598C7] mb-1.5 block">{t('analysisPeriod')}</label>
            <input
              type="number"
              value={settings.general.analysisPeriodDays}
              onChange={(e) => setSettings((s) => ({ ...s, general: { ...s.general, analysisPeriodDays: +e.target.value } }))}
              className={inputClass}
            />
          </div>
        </div>
        <button onClick={() => handleSave('general')} className={saveBtn}>
          <Save className="w-4 h-4" /> {tCommon('save')}
        </button>
      </Section>

      {/* AI */}
      <Section title={t('aiSettings')} icon={BrainCircuit} delay={0.1}>
        <div>
          <label className="text-xs text-[#A598C7] mb-1.5 block">{t('activeModel')} (Replicate)</label>
          <select
            value={REPLICATE_MODELS.some((m) => m.value === settings.ai.activeModel) ? settings.ai.activeModel : '__custom__'}
            onChange={(e) => {
              const v = e.target.value;
              setSettings((s) => ({
                ...s,
                ai: { ...s.ai, activeModel: v === '__custom__' ? '' : v },
              }));
            }}
            className={`${inputClass} cursor-pointer`}
            disabled={loading}
          >
            {REPLICATE_MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
            <option value="__custom__">{t('customModel')}</option>
          </select>
          {(!REPLICATE_MODELS.some((m) => m.value === settings.ai.activeModel) || settings.ai.activeModel === '') && (
            <input
              type="text"
              placeholder="owner/model-name"
              value={settings.ai.activeModel}
              onChange={(e) => setSettings((s) => ({ ...s, ai: { ...s.ai, activeModel: e.target.value } }))}
              className={`${inputClass} mt-2`}
            />
          )}
        </div>
        <div>
          <label className="text-xs text-[#A598C7] mb-1.5 block">{t('fortunePromptTemplate')}</label>
          <textarea
            rows={4}
            value={settings.ai.fortunePromptTemplate}
            onChange={(e) => setSettings((s) => ({ ...s, ai: { ...s.ai, fortunePromptTemplate: e.target.value } }))}
            className={`${inputClass} resize-none leading-relaxed`}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#A598C7] mb-1.5 block">{t('maxToken')}</label>
            <input
              type="number"
              value={settings.ai.maxTokens}
              onChange={(e) => setSettings((s) => ({ ...s, ai: { ...s.ai, maxTokens: +e.target.value } }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-[#A598C7] mb-1.5 block">{t('temperature')}</label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="2"
              value={settings.ai.temperature}
              onChange={(e) => setSettings((s) => ({ ...s, ai: { ...s.ai, temperature: +e.target.value } }))}
              className={inputClass}
            />
          </div>
        </div>
        <SettingRow label={t('testMode')} sublabel={t('testModeDesc')}>
          <Switch
            checked={settings.ai.testMode}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, ai: { ...s.ai, testMode: v } }))}
          />
        </SettingRow>
        <button onClick={() => handleSave('ai')} className={saveBtn}>
          <Save className="w-4 h-4" /> {tCommon('save')}
        </button>
      </Section>

      {/* Pricing */}
      <Section title={t('pricingTitle')} icon={CreditCard} delay={0.2}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-[#A598C7] mb-1.5 block">{t('weeklyUSD')}</label>
            <input type="number" step="0.01" value={settings.pricing.weeklyUSD} onChange={(e) => setSettings((s) => ({ ...s, pricing: { ...s.pricing, weeklyUSD: +e.target.value } }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[#A598C7] mb-1.5 block">{t('monthlyUSD')}</label>
            <input type="number" step="0.01" value={settings.pricing.monthlyUSD} onChange={(e) => setSettings((s) => ({ ...s, pricing: { ...s.pricing, monthlyUSD: +e.target.value } }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[#A598C7] mb-1.5 block">{t('yearlyUSD')}</label>
            <input type="number" step="0.01" value={settings.pricing.yearlyUSD} onChange={(e) => setSettings((s) => ({ ...s, pricing: { ...s.pricing, yearlyUSD: +e.target.value } }))} className={inputClass} />
          </div>
        </div>
        <Separator className="bg-white/[0.06]" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#A598C7] mb-1.5 block">{t('activeCoupon')}</label>
            <input type="text" value={settings.pricing.activeCoupon} onChange={(e) => setSettings((s) => ({ ...s, pricing: { ...s.pricing, activeCoupon: e.target.value } }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[#A598C7] mb-1.5 block">{t('discount')}</label>
            <input type="number" value={settings.pricing.couponDiscount} onChange={(e) => setSettings((s) => ({ ...s, pricing: { ...s.pricing, couponDiscount: +e.target.value } }))} className={inputClass} />
          </div>
        </div>
        <button onClick={() => handleSave('pricing')} className={saveBtn}>
          <Save className="w-4 h-4" /> {tCommon('save')}
        </button>
      </Section>

      {/* Notifications */}
      <Section title={t('notifications')} icon={Bell} delay={0.3}>
        <SettingRow label={t('bannerActive')} sublabel={t('bannerActiveDesc')}>
          <Switch
            checked={settings.notifications.bannerActive}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, bannerActive: v } }))}
          />
        </SettingRow>
        <Separator className="bg-white/[0.06]" />
        <div>
          <label className="text-xs text-[#A598C7] mb-1.5 block">{t('bannerText')}</label>
          <input
            type="text"
            value={settings.notifications.bannerText}
            onChange={(e) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, bannerText: e.target.value } }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-[#A598C7] mb-1.5 block">{t('bannerType')}</label>
          <select
            value={settings.notifications.bannerType}
            onChange={(e) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, bannerType: e.target.value as 'info' | 'warning' | 'success' } }))}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
        </div>
        <button onClick={() => handleSave('notification')} className={saveBtn}>
          <Save className="w-4 h-4" /> {tCommon('save')}
        </button>
      </Section>

      {/* Sharing */}
      <Section title={t('sharing')} icon={Share2} delay={0.4}>
        <div>
          <label className="text-xs text-[#A598C7] mb-1.5 block">{t('storyWatermark')}</label>
          <input
            type="text"
            value={settings.sharing.storyWatermarkText}
            onChange={(e) => setSettings((s) => ({ ...s, sharing: { ...s.sharing, storyWatermarkText: e.target.value } }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-[#A598C7] mb-1.5 block">{t('whatsappTemplate')}</label>
          <input
            type="text"
            value={settings.sharing.whatsappMessageTemplate}
            onChange={(e) => setSettings((s) => ({ ...s, sharing: { ...s.sharing, whatsappMessageTemplate: e.target.value } }))}
            className={inputClass}
          />
          <p className="text-[10px] text-[#A598C7] mt-1">{t('whatsappTemplateHint', { var: '{link}' })}</p>
        </div>
        <button onClick={() => handleSave('sharing')} className={saveBtn}>
          <Save className="w-4 h-4" /> {tCommon('save')}
        </button>
      </Section>
    </div>
  );
}
