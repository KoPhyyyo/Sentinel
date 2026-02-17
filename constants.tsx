
import { ThreatLevel } from './types';

export const REGIONS = ['North America', 'EMEA', 'APAC', 'LATAM'];
export const ATTACK_TYPES = [
  'DDoS Mitigation',
  'SQL Injection Attempt',
  'Brute Force SSH',
  'Malware Beacon',
  'Cross-Site Scripting',
  'Exfiltration Detected'
];

export const REGION_COORDS: Record<string, [number, number]> = {
  'North America': [-100, 40],
  'EMEA': [15, 50],
  'APAC': [120, 25],
  'LATAM': [-60, -15],
  'Russia': [90, 60],
  'China': [105, 35],
  'India': [78, 20],
  'Australia': [133, -25]
};

export const generateMockAttack = () => {
  const regions = Object.keys(REGION_COORDS);
  const srcIdx = Math.floor(Math.random() * regions.length);
  let dstIdx = Math.floor(Math.random() * regions.length);
  while (dstIdx === srcIdx) dstIdx = Math.floor(Math.random() * regions.length);

  const srcRegion = regions[srcIdx];
  const dstRegion = regions[dstIdx];

  const severities = [ThreatLevel.LOW, ThreatLevel.MEDIUM, ThreatLevel.HIGH, ThreatLevel.CRITICAL];

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    sourceIp: `192.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    sourceRegion: srcRegion,
    targetIp: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    targetRegion: dstRegion,
    type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    coords: {
      src: REGION_COORDS[srcRegion],
      dst: REGION_COORDS[dstRegion]
    }
  };
};
