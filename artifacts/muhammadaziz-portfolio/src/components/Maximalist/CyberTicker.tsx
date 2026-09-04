import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Cpu, Zap, Radio, Globe, Terminal } from 'lucide-react';

export function CyberTicker() {
  const [tashkentTime, setTashkentTime] = useState('');
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTashkentTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const latencyInterval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 5) + 10);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(latencyInterval);
    };
  }, []);

  const items = [
    { icon: Radio, text: 'STATUS: ALL SYSTEMS OPERATIONAL', color: 'text-emerald-400' },
    { icon: Activity, text: 'BIOMETRIC TELEMETRY: ACTIVE (72 BPM)', color: 'text-cyan-400' },
    { icon: Globe, text: `TASHKENT (UTC+5): ${tashkentTime || '10:30:00'}`, color: 'text-amber-300' },
    { icon: ShieldCheck, text: 'SECURITY LEVEL: RED TEAM DEFENSE ARMED', color: 'text-purple-400' },
    { icon: Cpu, text: `CORE LATENCY: ${latency}ms • 60 FPS SYNC`, color: 'text-emerald-300' },
    { icon: Zap, text: 'TECH STACK: REACT 19 • SUPABASE • TAILWIND • WEB AUDIO', color: 'text-cyan-300' },
    { icon: Terminal, text: 'MAXIMALIST HUD: ONLINE • SOUND ENGINE READY', color: 'text-fuchsia-400' },
  ];

  return (
    <aside 
      aria-label="Live System Telemetry"
      className="w-full bg-[#050811]/90 backdrop-blur-md border-b border-white/10 text-[11px] font-mono tracking-wider overflow-hidden py-1.5 z-40 relative select-none"
    >
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused] items-center gap-8">
        {[...items, ...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2 px-3 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
              <Icon className={`w-3.5 h-3.5 ${item.color} animate-pulse`} />
              <span className="text-gray-300 font-semibold">{item.text}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
