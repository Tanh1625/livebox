import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ServerEmptyScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface font-body overflow-hidden min-h-screen">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full z-50 flex flex-col justify-between items-center w-20 border-r-0 bg-[#0b0e14] dark:bg-[#0b0e14] py-6 shadow-[0_0_20px_rgba(129,236,255,0.15)] font-display tracking-tight">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Brand Logo */}
          <div className="text-[#81ecff] font-bold text-2xl tracking-tighter cursor-pointer hover:scale-110 transition-transform duration-200">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>electric_bolt</span>
          </div>
          {/* Navigation Tabs */}
          <nav className="flex flex-col items-center gap-4 w-full">
            {/* Home */}
            <div className="bg-gradient-to-br from-[#81ecff] to-[#a68cff] rounded-full p-3 shadow-[0_0_15px_rgba(129,236,255,0.5)] cursor-pointer active:scale-95 group">
              <span className="material-symbols-outlined text-on-primary">home</span>
            </div>
            {/* Gaming Hub */}
            <div className="bg-[#1c2128] hover:bg-[#2d333b] rounded-[2rem] hover:rounded-2xl transition-all duration-300 p-3 text-slate-400 cursor-pointer active:scale-95 hover:scale-110">
              <span className="material-symbols-outlined">sports_esports</span>
            </div>
            {/* Music Stream */}
            <div className="bg-[#1c2128] hover:bg-[#2d333b] rounded-[2rem] hover:rounded-2xl transition-all duration-300 p-3 text-slate-400 cursor-pointer active:scale-95 hover:scale-110">
              <span className="material-symbols-outlined">headset</span>
            </div>
            {/* Divider logic through spacing */}
            <div className="w-8 h-[2px] bg-surface-container-highest rounded-full"></div>
            {/* Add Server */}
            <div className="bg-primary hover:bg-primary-fixed rounded-[2rem] hover:rounded-2xl transition-all duration-300 p-3 text-on-primary cursor-pointer active:scale-95 hover:scale-110 neon-glow-primary">
              <span className="material-symbols-outlined">add</span>
            </div>
          </nav>
        </div>
        {/* Footer Area: Settings + Profile */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="bg-[#1c2128] hover:bg-[#2d333b] rounded-[2rem] hover:rounded-2xl transition-all duration-300 p-3 text-slate-400 cursor-pointer active:scale-95 hover:scale-110">
            <span className="material-symbols-outlined">settings</span>
          </div>
          {/* Profile Avatar */}
          <div className="relative group cursor-pointer">
            <img alt="User Profile Avatar" className="w-12 h-12 rounded-2xl object-cover border-2 border-transparent group-hover:border-secondary transition-all duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6EzhVKTAThzw-HzDRFwr4EYzdUeuUlFaiGPAcCVmsV5m-K56fZVq7YSwIyq5LGAUNEziAeraZraM-tlLF1ZEZcY2-UeHOFi0IbPQIcKQcB9beupOPk796zBkAdE2GvPgAzaRZCsAc2QjI-3Sbi0w6LFHvkVlo1gX0U4URHzA1Q45EuP7LoC2cvZuDxXS-n7JtV1IWh_ZZBi58wzv5kUhLaJMN6dvRMoV37zFb-XGEh2kRwRZOjgh6TH0f8GLmn-tMqhaQ294L_x0" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-dim rounded-full border-2 border-[#0b0e14]"></div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-20 min-h-screen flex items-center justify-center relative asymmetric-gradient">
        {/* TopAppBar */}
        <header className="fixed top-0 left-20 right-0 h-16 flex items-center justify-between px-8 z-40 bg-[#0b0e14]/60 backdrop-blur-xl">
          <div className="font-display font-bold uppercase tracking-widest text-xs text-primary">LiveBox</div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">notifications</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">grid_view</span>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="max-w-4xl w-full px-8 flex flex-col items-center text-center py-20">
          {/* Central Visual Element */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-secondary blur-[120px] opacity-20 scale-150"></div>
            <div className="glass-morphism rounded-[4rem] p-12 border border-outline-variant/10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl"></div>
              <span className="material-symbols-outlined text-primary text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                rocket_launch
              </span>
            </div>
          </div>

          {/* Typography Section */}
          <h1 className="font-display text-6xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6 leading-[0.9]">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">LiveBox!</span>
          </h1>
          <p className="font-body text-xl text-on-surface-variant max-w-2xl mb-12 leading-relaxed">
            You're not in any server yet. Ignite your workflow by joining an existing cluster or spinning up your own high-performance environment.
          </p>

          {/* Action Cluster */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button 
              onClick={() => navigate('/servers/create')}
              className="px-10 py-5 bg-gradient-to-br from-primary to-secondary rounded-xl text-on-primary font-display font-bold uppercase tracking-widest text-sm neon-glow-primary hover:scale-105 active:scale-95 transition-all duration-300"
            >
              + Create a Server
            </button>
            <button className="px-10 py-5 bg-surface-container-highest text-primary rounded-xl font-display font-bold uppercase tracking-widest text-sm border border-outline-variant/20 hover:bg-surface-bright active:scale-95 transition-all duration-300">
              Join via Invite Link
            </button>
          </div>

          {/* Quick Access / Status Footer */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="glass-morphism p-6 rounded-lg text-left border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary mb-3">speed</span>
              <h3 className="font-display font-bold text-sm tracking-widest uppercase text-on-surface mb-1">Performance</h3>
              <p className="text-xs text-on-surface-variant">Low-latency data processing pipelines.</p>
            </div>
            <div className="glass-morphism p-6 rounded-lg text-left border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary mb-3">security</span>
              <h3 className="font-display font-bold text-sm tracking-widest uppercase text-on-surface mb-1">Encrypted</h3>
              <p className="text-xs text-on-surface-variant">End-to-end security for all clusters.</p>
            </div>
            <div className="glass-morphism p-6 rounded-lg text-left border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary mb-3">hub</span>
              <h3 className="font-display font-bold text-sm tracking-widest uppercase text-on-surface mb-1">Collaboration</h3>
              <p className="text-xs text-on-surface-variant">Real-time team sync across the globe.</p>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary/10 blur-[180px] rounded-full -z-10"></div>
        <div className="fixed top-[-10%] left-[15%] w-[30vw] h-[30vw] bg-secondary/5 blur-[150px] rounded-full -z-10"></div>
      </main>

      {/* User Profile Strip */}
      <div className="fixed bottom-0 left-20 z-50 p-6 flex items-center gap-4 bg-gradient-to-t from-background via-background/80 to-transparent w-64 transition-all duration-300">
        <div className="relative">
          <img alt="User Profile Avatar" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_98C090Rmf_l2mC2XtdrBsaCDHn9WZNU_LyYMvh90w9TgH-Fu0_7uBOOTh3pvOIE8McVRHup26HNtwJdBahq6w9gypvGamQZtQbR9h-6h15_d70ac0kIKdND0BTKaHt8UzIvUc11BqYQFjpjd4f_NQP-sIQAN2pTXTNfzp5SoTx1K9UV_tZIY1X6vNDAqAQGro2I2hm7Fqqu5d1UgjYb4MU5mxwtgOBenmsd3qsTbzMb8h-AIBXN1bWJtzagKLdRkUSxn7F0c4eM" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary-dim rounded-full border border-background"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-on-surface font-display font-bold text-sm tracking-tight">Alex Rivera</span>
          <span className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Online</span>
        </div>
        <div className="ml-auto text-slate-500 hover:text-on-surface cursor-pointer">
          <span className="material-symbols-outlined text-sm">more_vert</span>
        </div>
      </div>
    </div>
  );
};
