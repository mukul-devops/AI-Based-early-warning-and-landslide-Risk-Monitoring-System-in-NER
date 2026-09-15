export type RiskLevel = 'severe' | 'high' | 'moderate' | 'low';

export type Language = 'en' | 'as' | 'kha';

export type ViewKey = 'map' | 'analytics' | 'reports' | 'dispatch';

export type UserRole = 'citizen' | 'officer' | null;

export interface AppUser {
  role: UserRole;
  name: string;
  id: string;
  district?: string;
}

export interface RiskZone {
  id: string;
  name: string;
  lat: number;
  lon: number;
  riskLevel: RiskLevel;
  riskScore: number;
  roadStatus: string;
  roadName: string;
  rainfall72h: number;
  slopeAngle: number;
  soilMoisture: number;
  population: number;
  lastUpdated: string;
}

export interface FieldReport {
  id: string;
  type: 'crack' | 'slope_movement' | 'blocked_road';
  description: string;
  lat: number;
  lon: number;
  photoUrl?: string;
  photoPreview?: string;
  submittedAt: string;
  synced: boolean;
  corridor?: string;
  approved?: boolean;
}

export interface Alert {
  id: string;
  zoneId: string;
  zoneName: string;
  riskLevel: RiskLevel;
  message: string;
  dispatchedAt: string;
  responders: number;
  status: 'pending' | 'en_route' | 'on_site';
}

export interface SimResult {
  riskLevel: RiskLevel;
  riskScore: number;
  confidence: number;
  factors: { label: string; value: number }[];
}

export interface InfrastructureCorridor {
  id: string;
  name: string;
  type: 'highway' | 'railway' | 'rural';
}

export interface AlertMessage {
  sms: string;
  whatsapp: string;
  voice: string;
}
