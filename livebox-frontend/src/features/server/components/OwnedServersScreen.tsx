import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverApi } from '../api/serverApi';
import { ServerResponse } from '../types';

export const OwnedServersScreen: React.FC = () => {
  const navigate = useNavigate();
  const [servers, setServers] = useState<ServerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await serverApi.getMyServers();
        setServers(data);
      } catch {
        setError('Khong the tai danh sach server. Vui long thu lai.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchServers();
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Server cua ban</h1>
            <p className="text-on-surface-variant mt-1">Danh sach cac server ban dang quan ly hoac tham gia.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/main')}
            className="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors"
          >
            Quay lai
          </button>
        </div>

        {isLoading && (
          <div className="rounded-2xl bg-surface-container-low p-8 border border-outline-variant/20 text-on-surface-variant">
            Dang tai du lieu...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl bg-error-container/20 p-8 border border-error/40 text-error">
            {error}
          </div>
        )}

        {!isLoading && !error && servers.length === 0 && (
          <div className="rounded-2xl bg-surface-container-low p-8 border border-outline-variant/20 text-on-surface-variant">
            Ban chua co server nao.
          </div>
        )}

        {!isLoading && !error && servers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servers.map((server) => (
              <div
                key={server.id}
                className="rounded-2xl bg-surface-container-low p-5 border border-outline-variant/20 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary font-bold">
                    {(server.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{server.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">ID: {server.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
