'use client';

import { motion } from 'framer-motion';
import { Monitor, Smartphone, Tv2, Speaker, Car, Wifi } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import type { SpotifyDeviceType } from '@/types';

function DeviceIcon({ type, className }: { type: SpotifyDeviceType; className?: string }) {
  const cls = className ?? 'w-5 h-5';
  switch (type) {
    case 'Computer': return <Monitor className={cls} />;
    case 'Smartphone': return <Smartphone className={cls} />;
    case 'TV': return <Tv2 className={cls} />;
    case 'Speaker':
    case 'CastAudio': return <Speaker className={cls} />;
    case 'Automobile': return <Car className={cls} />;
    default: return <Wifi className={cls} />;
  }
}

const TYPE_LABELS: Record<string, string> = {
  Computer: 'Bilgisayar',
  Smartphone: 'Telefon',
  TV: 'TV',
  Speaker: 'Hoparlör',
  CastAudio: 'Cast Ses',
  CastVideo: 'Cast Video',
  Automobile: 'Araç',
};

export default function DevicesCard() {
  const { analysis } = useDashboard();
  const devices = analysis?.devices ?? [];

  if (devices.length === 0) return null;

  const activeDevice = devices.find((d) => d.isActive);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="surface-card p-6"
    >
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Dinleme Cihazları</h2>
        <p className="text-sm text-[#A598C7] mt-1">
          {activeDevice
            ? `Şu an aktif: ${activeDevice.name}`
            : 'Kayıtlı Spotify cihazların'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {devices.map((device, i) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className={`relative flex items-center gap-3 p-4 rounded-xl border transition-colors ${
              device.isActive
                ? 'bg-[#7C3AED]/15 border-[#7C3AED]/40'
                : 'bg-white/[0.03] border-white/[0.06]'
            }`}
          >
            {/* Aktif göstergesi */}
            {device.isActive && (
              <span className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1DB954]" />
              </span>
            )}

            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              device.isActive ? 'bg-[#7C3AED]/30 text-[#A855F7]' : 'bg-white/[0.06] text-[#A598C7]'
            }`}>
              <DeviceIcon type={device.type} className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <p className={`text-sm font-semibold truncate ${device.isActive ? 'text-white' : 'text-white/80'}`}>
                {device.name}
              </p>
              <p className="text-xs text-[#A598C7]">
                {TYPE_LABELS[device.type] ?? device.type}
                {device.supportsVolume && device.volumePercent !== null && (
                  <span className="ml-1.5 opacity-60">· %{device.volumePercent}</span>
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
