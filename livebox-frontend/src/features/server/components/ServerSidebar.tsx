import React from 'react';
import { ServerResponse } from '../types';

interface ServerSidebarProps {
  servers: ServerResponse[];
  selectedServerId: string | null;
  onServerSelect: (id: string) => void;
  onCreateServer: () => void;
}

export const ServerSidebar: React.FC<ServerSidebarProps> = ({
  servers,
  selectedServerId,
  onServerSelect,
  onCreateServer
}) => {
  return (
    <aside className="w-[72px] bg-surface-container-lowest flex flex-col items-center py-4 gap-4 z-50 shrink-0">
      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-on-primary cursor-pointer active:scale-90 transition-transform">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
      </div>
      <div className="w-8 h-[2px] bg-surface-container-highest rounded-full"></div>

      {servers.map((server) => (
        <div key={server.id} className="group relative">
          <div
            onClick={() => onServerSelect(server.id)}
            className={`w-12 h-12 flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden active:scale-95 ${selectedServerId === server.id
                ? 'bg-primary rounded-2xl text-on-primary shadow-[0_0_15px_rgba(129,236,255,0.4)]'
                : 'bg-surface-container-high rounded-full hover:rounded-2xl'
              }`}
          >
            {server.avatarUrl && server.avatarUrl.trim() !== "" ? (
              <img
                className="w-full h-full object-cover"
                alt={server.name}
                src={server.avatarUrl}
              />
            ) : (
              <span className={`text-lg font-bold uppercase ${selectedServerId === server.id ? 'text-on-primary' : 'text-primary'}`}>
                {server.name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          {/* Active Indicator Pillar */}
          <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 bg-on-surface rounded-r-full transition-all ${selectedServerId === server.id ? 'h-8' : 'h-2 group-hover:h-5'
            }`}></div>

          <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 min-w-52 max-w-64 rounded-xl border border-outline-variant/30 bg-surface-container-high p-3 shadow-[0_12px_28px_rgba(0,0,0,0.45)] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 z-40">
            <p className="text-sm font-bold text-on-surface truncate">{server.name || 'Untitled Server'}</p>
          </div>
        </div>
      ))}

      <div className="group relative">
        <button
          type="button"
          onClick={onCreateServer}
          className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center hover:rounded-2xl transition-all duration-300 cursor-pointer text-primary bg-surface-bright active:scale-95"
          aria-label="Create server"
          title="Create server"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <div className="mt-auto">
        <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center hover:rounded-2xl transition-all duration-300 cursor-pointer text-secondary active:scale-95">
          <span className="material-symbols-outlined">explore</span>
        </div>
      </div>
    </aside>
  );
};
