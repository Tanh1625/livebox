
import React, { useEffect, useState, useCallback } from 'react';
import {
  LiveKitRoom,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  useIsSpeaking,
  RoomAudioRenderer,
  AudioVisualizer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, type Participant } from 'livekit-client';
import axiosClient from '../../../config/axiosClient';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LiveKitTokenResponse {
  token: string;
  url: string;
}

interface VoiceRoomTestProps {
  channelId: string;
  channelName?: string;
  onLeave?: () => void;
}

// ─── API helper ──────────────────────────────────────────────────────────────

const fetchVoiceToken = async (channelId: string): Promise<LiveKitTokenResponse> => {
  const res = await axiosClient.get<LiveKitTokenResponse>(
    `/api/v1/channels/${channelId}/voice/token`
  );
  // axiosClient may unwrap .data already; handle both shapes
  const data = (res as unknown as { data: LiveKitTokenResponse })?.data ?? res as unknown as LiveKitTokenResponse;
  if (!data?.token || !data?.url) {
    throw new Error('Invalid token response from server');
  }
  return data;
};

// ─── ParticipantCard — isolated per-participant component ─────────────────────
// Must be its own component so useIsSpeaking() hook subscribes individually
// and React re-renders only this card when speaking state changes.

const ParticipantCard: React.FC<{
  participant: Participant;
  isLocal: boolean;
}> = ({ participant, isLocal }) => {
  // useIsSpeaking subscribes to LiveKit events → triggers re-render reactively
  const isSpeaking = useIsSpeaking(participant);
  const micEnabled = participant.isMicrophoneEnabled;
  const audioTrackPublication = participant.getTrackPublication(Track.Source.Microphone);

  return (
    <div
      style={{
        ...styles.card,
        ...(isSpeaking ? styles.cardSpeaking : {}),
        ...(isLocal ? styles.cardLocal : {}),
      }}
    >
      {/* Avatar with speaking ring */}
      <div style={{ ...styles.avatar, ...(isSpeaking ? styles.avatarSpeaking : {}) }}>
        {(participant.name ?? '?').charAt(0).toUpperCase()}
      </div>

      {/* Audio visualizer — requires full TrackReference with publication */}
      {audioTrackPublication && (
        <div style={styles.visualizer}>
          <AudioVisualizer
            trackRef={{
              participant,
              source: Track.Source.Microphone,
              publication: audioTrackPublication,
            }}
          />
        </div>
      )}

      {/* Name */}
      <p style={styles.participantName}>
        {participant.name ?? participant.identity}
        {isLocal && <span style={styles.youBadge}> (You)</span>}
      </p>

      {/* Status badges */}
      <div style={styles.badges}>
        {!micEnabled && (
          <span style={styles.badgeMuted}>Muted</span>
        )}
        {isSpeaking && (
          <span style={styles.badgeSpeaking}>Speaking</span>
        )}
      </div>
    </div>
  );
};

// ─── Inner Room UI (must be inside <LiveKitRoom>) ────────────────────────────

const RoomUI: React.FC<{ channelName: string; onLeave?: () => void }> = ({ channelName, onLeave }) => {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const isMuted = localParticipant.isMicrophoneEnabled === false;

  const toggleMic = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(isMuted);
  }, [localParticipant, isMuted]);

  const handleLeave = useCallback(async () => {
    await room.disconnect();
    onLeave?.();
  }, [room, onLeave]);

  return (
    <div style={styles.wrapper}>
      {/* Render audio for ALL remote participants automatically */}
      <RoomAudioRenderer />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.headerTitle}>{channelName}</h2>
          <p style={styles.headerSub}>
            {participants.length} participant{participants.length !== 1 ? 's' : ''} connected
          </p>
        </div>
      </div>

      {/* Participant Grid — each card is its own component with isolated speaking state */}
      <div style={styles.grid}>
        {participants.map((participant) => (
          <ParticipantCard
            key={participant.sid}
            participant={participant}
            isLocal={participant.sid === localParticipant.sid}
          />
        ))}
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button
          onClick={toggleMic}
          style={{ ...styles.controlBtn, ...(isMuted ? styles.btnDanger : styles.btnNormal) }}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button
          onClick={handleLeave}
          style={{ ...styles.controlBtn, ...styles.btnLeave }}
          title="Leave voice channel"
        >
          Leave
        </button>
      </div>
    </div>
  );
};

// ─── Main exported component ─────────────────────────────────────────────────

export const VoiceRoomTest: React.FC<VoiceRoomTestProps> = ({
  channelId,
  channelName = 'Voice Channel',
  onLeave,
}) => {
  const [tokenData, setTokenData] = useState<LiveKitTokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleJoin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVoiceToken(channelId);
      setTokenData(data);
      setConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get voice token');
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  // Reset when channel changes
  useEffect(() => {
    setConnected(false);
    setTokenData(null);
    setError(null);
  }, [channelId]);

  const handleLeave = useCallback(() => {
    setConnected(false);
    setTokenData(null);
    onLeave?.();
  }, [onLeave]);

  // ── Not connected yet: show join screen ──────────────────────────────────
  if (!connected || !tokenData) {
    return (
      <div style={styles.joinScreen}>
        <div style={styles.joinCard}>
          <h2 style={styles.joinTitle}>{channelName}</h2>
          <p style={styles.joinSub}>Voice Channel — powered by LiveKit</p>
          {error && <p style={styles.errorMsg}>⚠️ {error}</p>}
          <button
            onClick={handleJoin}
            disabled={loading}
            style={{ ...styles.joinBtn, ...(loading ? styles.btnDisabled : {}) }}
          >
            {loading ? 'Connecting...' : 'Join Voice Channel'}
          </button>
          <p style={styles.joinHint}>Your microphone will be enabled upon joining</p>
        </div>
      </div>
    );
  }

  // ── Connected: render LiveKit Room ────────────────────────────────────────
  return (
    <LiveKitRoom
      token={tokenData.token}
      serverUrl={tokenData.url}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={handleLeave}
      style={{ height: '100%', background: 'transparent' }}
    >
      <RoomUI channelName={channelName} onLeave={handleLeave} />
    </LiveKitRoom>
  );
};

export default VoiceRoomTest;

// ─── Inline styles (no external CSS dependency) ───────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  // Join screen
  joinScreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    background: 'linear-gradient(135deg, #0e1117 0%, #161b22 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  joinCard: {
    background: 'rgba(22, 27, 34, 0.95)',
    border: '1px solid rgba(48, 54, 61, 0.8)',
    borderRadius: '20px',
    padding: '48px 56px',
    textAlign: 'center',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  },
  joinIcon: { fontSize: '56px', marginBottom: '16px' },
  joinTitle: { color: '#e6edf3', fontSize: '24px', fontWeight: 800, marginBottom: '8px' },
  joinSub: { color: '#8b949e', fontSize: '14px', marginBottom: '32px' },
  errorMsg: {
    background: 'rgba(218,54,51,0.15)',
    border: '1px solid rgba(218,54,51,0.4)',
    borderRadius: '12px',
    color: '#f85149',
    fontSize: '13px',
    padding: '12px 16px',
    marginBottom: '20px',
  },
  joinBtn: {
    background: 'linear-gradient(135deg, #238636, #2ea043)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 700,
    padding: '14px 32px',
    width: '100%',
    boxShadow: '0 4px 20px rgba(35,134,54,0.4)',
    transition: 'transform 0.1s, box-shadow 0.2s',
  },
  btnDisabled: {
    background: '#21262d',
    color: '#8b949e',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  joinHint: { color: '#8b949e', fontSize: '12px', marginTop: '16px' },

  // Room UI
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(135deg, #0e1117 0%, #0d1117 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#e6edf3',
    padding: '24px',
    gap: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: 'rgba(22, 27, 34, 0.8)',
    borderRadius: '16px',
    border: '1px solid rgba(48, 54, 61, 0.6)',
  },
  headerIcon: { fontSize: '28px' },
  headerTitle: { fontSize: '20px', fontWeight: 800, color: '#81ecff', margin: 0 },
  headerSub: { fontSize: '13px', color: '#8b949e', margin: 0 },

  // Participant grid
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    flex: 1,
    alignContent: 'flex-start',
  },
  card: {
    background: 'rgba(22, 27, 34, 0.9)',
    border: '2px solid rgba(48, 54, 61, 0.6)',
    borderRadius: '16px',
    padding: '24px',
    width: '180px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  cardSpeaking: {
    borderColor: '#2ea043',
    boxShadow: '0 0 20px rgba(46,160,67,0.35)',
  },
  cardLocal: {
    borderColor: 'rgba(129, 236, 255, 0.5)',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c83f5, #81ecff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 800,
    color: '#0e1117',
    transition: 'box-shadow 0.2s',
  },
  avatarSpeaking: {
    boxShadow: '0 0 0 4px rgba(46,160,67,0.5)',
  },
  visualizer: {
    width: '100%',
    height: '40px',
  },
  participantName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#e6edf3',
    textAlign: 'center',
    margin: 0,
    wordBreak: 'break-all',
  },
  youBadge: { color: '#8b949e', fontWeight: 400 },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '6px',
  },
  badgeMuted: {
    background: 'rgba(218,54,51,0.2)',
    border: '1px solid rgba(218,54,51,0.4)',
    color: '#f85149',
    borderRadius: '8px',
    fontSize: '11px',
    padding: '3px 8px',
  },
  badgeSpeaking: {
    background: 'rgba(46,160,67,0.2)',
    border: '1px solid rgba(46,160,67,0.4)',
    color: '#3fb950',
    borderRadius: '8px',
    fontSize: '11px',
    padding: '3px 8px',
  },

  // Controls bar
  controls: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    padding: '16px',
    background: 'rgba(22, 27, 34, 0.8)',
    borderRadius: '16px',
    border: '1px solid rgba(48, 54, 61, 0.6)',
  },
  controlBtn: {
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 700,
    padding: '12px 28px',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  btnNormal: {
    background: 'rgba(48, 54, 61, 0.8)',
    color: '#e6edf3',
  },
  btnDanger: {
    background: 'rgba(35, 134, 54, 0.3)',
    border: '1px solid rgba(35, 134, 54, 0.6)',
    color: '#3fb950',
  },
  btnLeave: {
    background: 'rgba(218, 54, 51, 0.2)',
    border: '1px solid rgba(218, 54, 51, 0.4)',
    color: '#f85149',
  },
};
