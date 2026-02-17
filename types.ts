
export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AttackIncident {
  id: string;
  timestamp: number;
  sourceIp: string;
  sourceRegion: string;
  targetIp: string;
  targetRegion: string;
  type: string;
  severity: ThreatLevel;
  coords: {
    src: [number, number];
    dst: [number, number];
  };
}

export interface OsintBrief {
  title: string;
  summary: string;
  sourceUrls: string[];
  lastUpdated: string;
}

export interface RegionalStats {
  region: string;
  incidents: number;
  percentage: number;
}
