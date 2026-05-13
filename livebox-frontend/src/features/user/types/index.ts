export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  isVerified: boolean;
  tier: 'FREE' | 'PRO';
}

export interface UserSettings {
  theme: 'LIGHT' | 'DARK';
  interfaceScaling: number;
  webNotifications: boolean;
  soundAlerts: boolean;
}
