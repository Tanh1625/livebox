import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { serverApi } from '../api/serverApi';
import type { ServerResponse } from '../types';

export const MainApplicationScreen: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [joinedServers, setJoinedServers] = useState<ServerResponse[]>([]);

  const handleLogout = () => {
    setIsSettingsOpen(false);
    logout();
    navigate('/login');
  };

  const handleViewOwnedServers = () => {
    setIsSettingsOpen(false);
    navigate('/servers/owned');
  };

  const handleCreateServer = () => {
    navigate('/servers/create');
  };

  useEffect(() => {
    let isMounted = true;

    const loadJoinedServers = async () => {
      try {
        const servers = await serverApi.getMyServers();
        if (isMounted) {
          setJoinedServers(servers);
        }
      } catch (error) {
        console.error('Failed to load joined servers:', error);
      }
    };

    loadJoinedServers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-surface text-on-surface flex h-screen overflow-hidden">
      <aside className="w-[72px] bg-surface-container-lowest flex flex-col items-center py-4 gap-4 z-50">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-on-primary cursor-pointer active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <div className="w-8 h-[2px] bg-surface-container-highest rounded-full"></div>

        {joinedServers.map((server) => (
          <div key={server.id} className="group relative">
            <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center hover:rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden active:scale-95">
              {server.avatarUrl ? (
                <img
                  className="w-full h-full object-cover"
                  alt="Server icon"
                  src={server.avatarUrl}
                />
              ) : (
                <span className="text-sm font-bold text-primary uppercase">
                  {server.name?.charAt(0) || 'S'}
                </span>
              )}
            </div>
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-2 bg-on-surface rounded-r-full group-hover:h-5 transition-all"></div>
            <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 min-w-52 max-w-64 rounded-xl border border-outline-variant/30 bg-surface-container-high p-3 shadow-[0_12px_28px_rgba(0,0,0,0.45)] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 z-40">
              <p className="text-sm font-bold text-on-surface truncate">{server.name || 'Untitled Server'}</p>
            </div>
          </div>
        ))}

        <div className="group relative">
          <button
            type="button"
            onClick={handleCreateServer}
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

      <nav className="w-[280px] bg-surface-container-low flex flex-col shrink-0">
        <header className="h-16 px-4 flex items-center justify-between bg-surface-container-low/50 backdrop-blur-xl shrink-0">
          <h1 className="font-headline text-lg font-bold tracking-tight text-primary drop-shadow-[0_0_8px_rgba(129,236,255,0.4)]">Neon Pulse</h1>
          <span className="material-symbols-outlined text-outline">expand_more</span>
        </header>

        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          <div>
            <h3 className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline">Text Channels</h3>
            <div className="space-y-0.5">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-br from-primary to-secondary text-surface-container-lowest font-bold shadow-[0_0_15px_rgba(129,236,255,0.3)] transition-transform active:scale-95 cursor-pointer">
                <span className="text-xl font-medium opacity-70">#</span>
                <span className="text-sm">general</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all cursor-pointer">
                <span className="text-xl font-medium opacity-40">#</span>
                <span className="text-sm">announcements</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all cursor-pointer">
                <span className="text-xl font-medium opacity-40">#</span>
                <span className="text-sm">dev-log</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline">Voice Channels</h3>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">volume_up</span>
                  <span className="text-sm">Main Hub</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="p-3 bg-surface-container-lowest/30 backdrop-blur-md flex items-center gap-3">
          <div className="relative">
            <img
              className="w-10 h-10 rounded-full object-cover"
              alt="User avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrcQqYCdjdv2LMgywEgtJJW9i0gyIG4Mg4g6FLK5cMEHosDGQ2d1iaZ_dfiN6dntZa_IrvCj6NrUE1T2QVXgSG-MidVNKCmZWJQzptAOdJC3PteNyaCjtYhjLYCT0vH3SJYEDtJFXKQ5_8QIT-xGRdVFUOyrB5-s7NHwtptbgXYSK_LAXh7XejB4r4R0LKMuRoA7uHLiGv5JR0uqoTqtcRouaYlOrR6YbPtNFnXmdbBVwy_4fpjPqI1V1Di907P-zRW_qwK1OgKOA"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full ring-2 ring-surface shadow-[0_0_8px_#81ecff]"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">Lan Anh</p>
            <p className="text-[10px] text-outline truncate tracking-wider uppercase font-headline">Ignition Active</p>
          </div>
          <div className="flex gap-1 relative">
            <button type="button" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-outline hover:text-primary active:scale-95">
              <span className="material-symbols-outlined text-xl">mic</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-outline hover:text-primary active:scale-95"
              aria-label="Open settings menu"
              title="Settings"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 bottom-12 w-56 rounded-xl border border-outline-variant/30 bg-surface-container-high shadow-[0_12px_28px_rgba(0,0,0,0.45)] p-1 z-20">
                <button
                  type="button"
                  onClick={handleViewOwnedServers}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-white/5 transition-colors"
                >
                  Xem server cua ban
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-error hover:bg-error/15 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </footer>
      </nav>

      <main className="flex-1 flex flex-col bg-surface overflow-hidden">
        <header className="h-16 px-6 flex items-center justify-between shrink-0 bg-surface/60 backdrop-blur-2xl z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-medium text-outline">#</span>
            <h2 className="font-headline font-bold text-lg text-on-surface">general</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-surface-container-high px-4 py-1.5 rounded-full gap-2 w-64 border border-outline-variant/10">
              <span className="material-symbols-outlined text-lg text-outline">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-outline w-full" placeholder="Search the void..." type="text" />
            </div>
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">notifications</span>
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">push_pin</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          <div className="flex items-start gap-4 max-w-2xl group">
            <img
              className="w-10 h-10 rounded-full mt-1"
              alt="Member avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDYwbmOxESh4aD3ANcG5QQP4oRJS7UXNhdO9FZy95zDOi1oUH9StgVejtS4WtwWCYtM4f5oc_i2grnnQt9XUroWA2TaNjcgPTaFmxr1RV3yRFwE2O3_6mOzapKfvcxQn3t1G2UGSeS1o7b8Xz5-ImT_6Xw7lDGc2CSMbE6cCKAH7lTqzatX8imTurnsq__t2wao3bu8y4t8n6dzR-UcbDnlTZ2fI_yGcJV50yo-U7LXnmB3LlGRp9vPp45KyTF82xymFQY56P81qQ"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface">Marcus</span>
                <span className="text-[10px] text-outline font-headline uppercase tracking-widest">Today at 10:42 AM</span>
              </div>
              <div className="bg-surface-container-high p-4 rounded-r-2xl rounded-bl-2xl text-on-surface leading-relaxed shadow-sm">
                Just deployed the latest Neural Net update to the staging environment.
                Initial telemetry looks promising. Pulse rates are stabilizing.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 flex-row-reverse max-w-2xl ml-auto group">
            <img
              className="w-10 h-10 rounded-full mt-1"
              alt="User avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgswcl2rnNkfR8M5dj2-B-OUpYIIGtdJxT-7Q1-oRQEilkYQcl1-U0EGErxMF3EH-VVjSy5yWis-W_ALqjjOb7Tx1xF0q1yEv0KByee8rxsTRywbqvn-DIEN50-lB64hWnR5TJEcV4Obg5XjUiKf2Gv6-AmX5G3wuu7fiibvLiavczKay393FxXn2CufO4euViXu9mE8qaj1iFdM3UV_Gmy5JniT_DLuOrLEcnwr-ryzvo3zAoTc8dETi3m6bVW7mRWs9sPmsmiLc"
            />
            <div className="space-y-1 flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-outline font-headline uppercase tracking-widest">Today at 10:45 AM</span>
                <span className="font-bold text-primary">Lan Anh</span>
              </div>
              <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-l-2xl rounded-br-2xl text-surface-container-lowest font-medium leading-relaxed shadow-[0_8px_20px_rgba(129,236,255,0.2)]">
                Incredible work Marcus. I am seeing the latency drop across the Creative Core too.
                Let us push to production once the ignition sequence is fully verified.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 max-w-2xl group">
            <img
              className="w-10 h-10 rounded-full mt-1"
              alt="Member avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdupAUyk-EA35uVAwePpce3DGokZW8rVuq24V3L-4aIeQnoMZuGmi-nAvLQWAfke-2JVWpbdhZCtDRoeymXDosdDbCR8VOTj0bXkmsLFl5EcKwMUpUF6Skdnz0j6JuXIUiz0-Q0MkrUT4lNtyPNlzk26fh2mEOVo4aPdksgxoqEjJWCz8hDZ4r0IcvhhS1gDcbAktDN61g2QusE0_GY4LJj8oCcFhuzgIaeWg8M4O_wj5bhm5y5kubIzbjxVv3gwLoTCrGVPZ5ujM"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-secondary">Sarah</span>
                <span className="text-[10px] text-outline font-headline uppercase tracking-widest">Today at 10:48 AM</span>
              </div>
              <div className="bg-surface-container-high p-4 rounded-r-2xl rounded-bl-2xl text-on-surface leading-relaxed">
                Design assets for the void-shell interface are ready for review.
                I have used the new tonal layering approach we discussed.
              </div>
            </div>
          </div>
        </div>

        <footer className="p-6 shrink-0">
          <div className="bg-surface-container-high rounded-full flex items-center p-2 pl-6 gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-outline-variant/10">
            <button type="button" className="text-outline hover:text-primary transition-colors active:scale-90">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50" placeholder="Message #general" type="text" />
            <div className="flex items-center gap-2">
              <button type="button" className="p-2 text-outline hover:text-primary transition-colors active:scale-90">
                <span className="material-symbols-outlined">mood</span>
              </button>
              <button type="button" className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center hover:shadow-[0_0_15px_rgba(129,236,255,0.5)] transition-all active:scale-90">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
          </div>
        </footer>
      </main>

      <aside className="w-60 bg-surface-container-low shrink-0 hidden lg:flex flex-col">
        <div className="p-6 overflow-y-auto">
          <section className="mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline mb-4">Online - 3</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <img
                    className="w-8 h-8 rounded-full object-cover grayscale-0 group-hover:ring-2 ring-primary ring-offset-2 ring-offset-surface transition-all"
                    alt="Member avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHl6MX6Ch2pc6wyq6zAHmL-BAE7FX_-pwqBcXoxNpprHpicgpDKmvcjkYKThtS1r5L9Q2HIYWegr1Fx4jGtcc_f6M4wSnZ6da693WXr13eh2BEyck2tIqxpYrFu7QaaxAoZRSiogkcmQOZMlYWfRMYMOsnedcxJIEfiAxT10su3_PfnWBnkR7dPaKnemyL47KsRAK_Fp6oYbSBdFrDTCYfbW4YcqwunJLNWkJ8x_lIDhsWxDSCaerfpdnhMZ3Ta-Xetifo64i_Vaw"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container-low shadow-[0_0_8px_#81ecff]"></div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">Marcus</p>
                  <p className="text-[10px] text-outline truncate uppercase tracking-tighter">Syncing Neurons</p>
                </div>
              </div>

              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <img
                    className="w-8 h-8 rounded-full object-cover group-hover:ring-2 ring-primary ring-offset-2 ring-offset-surface transition-all"
                    alt="Member avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA38dhJuHOLhaM8nXrP8YXnnft1uYkf7ijPjOfC5oYdFVMyowMuFJ19jf_cUMnNqy--_p_iC1f72oaw00_SqeOEFxIh-Ct0YscxUNNWPus5z9yKCWLGDjLBWCkuFy4f85GiDwb_wpT7fDmnvDxkcM5HgXNpiVWLuc5bpU-Qxk6HGl_bgKYxTJjnPbNkg7IjV5V5ktLw1E8yoMMylre45vBUGa9sGOWIyLgJcPDq-kwUeCDT569mIoKH-gdRroiWGc51vEkqMGxWbc"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container-low shadow-[0_0_8px_#81ecff]"></div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-secondary truncate group-hover:text-primary transition-colors">Sarah</p>
                  <p className="text-[10px] text-outline truncate uppercase tracking-tighter">Designing Reality</p>
                </div>
              </div>

              <div className="flex items-center gap-3 group cursor-pointer opacity-80">
                <div className="relative">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    alt="User avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGbR60etsfgpCoPlidAN9R2zgfewaBsDKRwkg6eyTY0vW5QZaN9FCNLwIwj1ntJhfrF1O3CFI7eOOyEOzCt0hxtGXwTKjNMqV_NpdMg6dT1wow_Ps2WrLV09_1GxV0gPsmMBUOqzIIpCDRNMGV9ytn7pn1F5VKg7ADhHLSTeBMMwso7LWsdeqBFHrqgokJSc93J633DMmJCtUWlUhEcoPkTRo0_sbZ8bLTKtWodM09GKxHtZHPxXR_kECWhMQdHUCi1C8NilYL9Rw"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container-low shadow-[0_0_8px_#81ecff]"></div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">Lan Anh</p>
                  <p className="text-[10px] text-outline truncate uppercase tracking-tighter">Active Hub</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline font-headline mb-4">Offline - 14</h3>
            <div className="space-y-4 opacity-50">
              <div className="flex items-center gap-3 grayscale cursor-not-allowed">
                <div className="relative">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    alt="Member avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3yc72t0U-dP0r0h2YqONV_DK5B__OMsFVsULoFuxX4VdEA8dLnXftajoqbjEAhcqPkCwMJLkpgp337SscRRUlq0ZtMUFXPrb7fUFjCFP2fw2cn7n4huk53cPdqek9H6zzPwbG78lhMEk-EQ7lhq8gfgJ0mbecR4UTIMgmQ7KPTHp0eXnV3sxZrzfVrM1YCjBo3gVqVHIhIz3ICpdjx-wdPQvGEtSXtL8soEO0ivb44jCacVjhgwW5qi79GNFdeEgXDI-aP1faCcw"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-outline rounded-full ring-2 ring-surface-container-low"></div>
                </div>
                <p className="text-sm font-semibold text-outline">Dave_V</p>
              </div>

              <div className="flex items-center gap-3 grayscale cursor-not-allowed">
                <div className="relative">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    alt="Member avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmHUpoTjltGXevM83IS6oKgmzvJJ9VF2NVn-kRThVgl_Hoq9ZP-COoHOV2PXnlrpcN-n51_3M2EPkLhzbV9RXqPFkyNGsCwgUDZSQeIQJYnysPiusePjH3DDFW6eN_fuSCF6kls0CcbgN9XKmXM866IhX6SqmXMHV5s3UPK9EC69zyqOtdcqUq06gUyKcdDApeK50IKTbbckOhuRtPtY5dPGmbddslrWB-Po51UrukzjO8YXaPC0YiQnuG2GzJFGmauCY0KZnv4eo"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-outline rounded-full ring-2 ring-surface-container-low"></div>
                </div>
                <p className="text-sm font-semibold text-outline">Elena_M</p>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
};
