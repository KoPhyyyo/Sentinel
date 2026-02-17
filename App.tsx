
import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Activity, Globe, AlertTriangle, Cpu, Terminal, Zap, Search } from 'lucide-react';
import WorldMap from './components/WorldMap';
import StatsPanel from './components/StatsPanel';
import { AttackIncident, RegionalStats, OsintBrief, ThreatLevel } from './types';
import { generateMockAttack, REGIONS } from './constants';
import { getOsintBriefing, analyzeAttackVector } from './services/geminiService';

const App: React.FC = () => {
  const [attacks, setAttacks] = useState<AttackIncident[]>([]);
  const [history, setHistory] = useState<AttackIncident[]>([]);
  const [stats, setStats] = useState<RegionalStats[]>([]);
  const [osint, setOsint] = useState<OsintBrief | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);

  // Initialize stats
  useEffect(() => {
    const initialStats = REGIONS.map(region => ({
      region,
      incidents: Math.floor(Math.random() * 50),
      percentage: 0
    }));
    setStats(initialStats);
    fetchIntel();
  }, []);

  const fetchIntel = async () => {
    setLoadingIntel(true);
    const briefing = await getOsintBriefing();
    setOsint(briefing);
    setLoadingIntel(false);
  };

  // Simulation loop for live attacks
  useEffect(() => {
    const interval = setInterval(() => {
      const newAttack = generateMockAttack();
      setAttacks(prev => [newAttack]); // WorldMap handles animation of current set
      setHistory(prev => [newAttack, ...prev].slice(0, 20));
      
      setStats(prev => prev.map(s => {
        if (s.region === newAttack.targetRegion) {
          return { ...s, incidents: s.incidents + 1 };
        }
        return s;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async (attack: AttackIncident) => {
    setActiveAnalysis(`Analyzing ${attack.id}...`);
    const analysis = await analyzeAttackVector(attack.type, attack.severity);
    setActiveAnalysis(analysis);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden font-mono selection:bg-emerald-500/30">
      <div className="scanline"></div>
      
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30 glow-green">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase tracking-widest">SENTINEL<span className="text-emerald-500">_INTEL</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Cyber Defense Core v3.1.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-500 uppercase">System Nominal</span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="w-3 h-3" />
              <span>4.2 GBps throughput</span>
            </div>
          </div>
          <button 
            onClick={fetchIntel}
            disabled={loadingIntel}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Search className="w-3 h-3" />
            {loadingIntel ? 'Retrieving Intelligence...' : 'Refresh OSINT'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* Left Column: Intelligence & Feed */}
        <div className="w-1/4 flex flex-col gap-4">
          {/* OSINT Briefing */}
          <div className="flex-[3] bg-slate-900/40 border border-slate-800 rounded-lg p-4 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3 text-emerald-500" />
                Global Intelligence Brief
              </h2>
              <span className="text-[9px] text-slate-600">Updated: {osint?.lastUpdated || '--:--'}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs leading-relaxed">
              {loadingIntel ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-800 rounded w-4/6"></div>
                </div>
              ) : (
                <>
                  <p className="text-slate-300 whitespace-pre-wrap">{osint?.summary}</p>
                  <div className="pt-2 border-t border-slate-800">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Authenticated Sources</h4>
                    <ul className="space-y-1">
                      {osint?.sourceUrls.slice(0, 3).map((url, i) => (
                        <li key={i} className="truncate">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline flex items-center gap-2">
                            <Terminal className="w-2.5 h-2.5" />
                            {new URL(url).hostname}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 p-2 bg-emerald-500/5 border border-emerald-500/20 rounded text-[10px] text-emerald-400">
              <Zap className="w-3 h-3 inline mr-1 mb-0.5" />
              Gemini AI Insight Active
            </div>
          </div>

          {/* Incident Feed */}
          <div className="flex-[4] bg-slate-900/40 border border-slate-800 rounded-lg p-4 flex flex-col overflow-hidden">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Activity className="w-3 h-3 text-red-500" />
                Live Incident Stream
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[10px]">
                {history.map((attack) => (
                  <div 
                    key={attack.id}
                    onClick={() => handleAnalyze(attack)}
                    className="p-2 border-l-2 border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 hover:border-emerald-500 transition-all cursor-pointer group"
                    style={{ borderLeftColor: attack.severity === ThreatLevel.CRITICAL ? '#ef4444' : attack.severity === ThreatLevel.HIGH ? '#f59e0b' : '#334155' }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-slate-400 font-bold group-hover:text-emerald-400">{attack.id}</span>
                      <span className={`px-1.5 py-0.5 rounded ${attack.severity === ThreatLevel.CRITICAL ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                        {attack.severity}
                      </span>
                    </div>
                    <div className="text-slate-500 truncate">{attack.type}</div>
                    <div className="flex justify-between mt-1 text-slate-600 italic">
                      <span>{attack.sourceRegion}</span>
                      <span>→ {attack.targetRegion}</span>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>

        {/* Center: Map Visualization */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex-[3]">
            <WorldMap attacks={attacks} />
          </div>
          <div className="flex-1">
            <StatsPanel data={stats} />
          </div>
        </div>

        {/* Right Column: Tactical Console */}
        <div className="w-1/4 flex flex-col gap-4">
          {/* Analysis Module */}
          <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-lg p-4 flex flex-col overflow-hidden">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Cpu className="w-3 h-3 text-emerald-500" />
                Tactical Analysis Module
              </h2>
              <div className="flex-1 p-3 bg-black/40 border border-slate-800 rounded font-mono text-[11px] leading-relaxed relative">
                {activeAnalysis ? (
                  <p className="text-emerald-400 typing-effect">{activeAnalysis}</p>
                ) : (
                  <div className="text-slate-700 flex flex-col items-center justify-center h-full text-center gap-4">
                    <AlertTriangle className="w-8 h-8 opacity-20" />
                    <span>Select an incident from the stream to generate AI tactical response.</span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <div className="w-1 h-1 bg-emerald-500/50"></div>
                  <div className="w-1 h-1 bg-emerald-500/30"></div>
                  <div className="w-1 h-1 bg-emerald-500/10"></div>
                </div>
              </div>
          </div>

          {/* System Health */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 h-fit shrink-0">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Core Health</h2>
             <div className="space-y-3">
               {[
                 { label: 'Firewall', val: 98, color: 'bg-emerald-500' },
                 { label: 'IDS/IPS', val: 84, color: 'bg-emerald-500' },
                 { label: 'DDoS Defense', val: 100, color: 'bg-emerald-500' },
                 { label: 'Endpoint Matrix', val: 72, color: 'bg-amber-500' }
               ].map((item, idx) => (
                 <div key={idx} className="space-y-1">
                   <div className="flex justify-between text-[10px] text-slate-500">
                     <span>{item.label}</span>
                     <span>{item.val}%</span>
                   </div>
                   <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div 
                       className={`h-full ${item.color} transition-all duration-1000`} 
                       style={{ width: `${item.val}%` }}
                     ></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </main>

      {/* Marquee Footer */}
      <footer className="h-8 border-t border-slate-800 bg-slate-950 flex items-center px-4 overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-marquee items-center gap-12 text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest">
          {history.map((h, i) => (
            <span key={i} className="flex items-center gap-2">
              <Zap className="w-3 h-3" />
              ALERT: {h.type} DETECTED FROM {h.sourceIp} AT {new Date(h.timestamp).toLocaleTimeString()}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 60s linear infinite;
          }
          .typing-effect {
            overflow: hidden;
            white-space: wrap;
            border-right: 2px solid #10b981;
            animation: blink-caret 0.75s step-end infinite;
          }
          @keyframes blink-caret {
            from, to { border-color: transparent }
            50% { border-color: #10b981 }
          }
        `}</style>
      </footer>
    </div>
  );
};

export default App;
