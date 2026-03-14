export type UserRole = 'farmer' | 'expert' | 'admin' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  state?: string;
  role: UserRole;
  avatar?: string;
  isVerified?: boolean;
  isBanned?: boolean;
  totalScans?: number;
  lastLoginAt?: string | Date | null;
  createdAt?: string | Date;
}

export type IUser = User;

export interface AuthResponse {
  success?: boolean;
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface Pesticide {
  name: string;
  description: string;
  active_ingredient?: string;
  purchaseLink: string;
  priceRange: string;
  usageSteps: string[];
}

export interface DiseaseData {
  disease_name: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affected_area_percent: number;
  symptoms?: string[];
  why_it_happened?: string;
  diagnosis?: string;
  causes: string[];
  treatment: string[];
  prevention: string[];
  is_healthy: boolean;
  pesticides?: Pesticide[];
}

export type GeminiResult = DiseaseData;

export interface ModelPrediction {
  diseaseName: string;
  confidence: number;
  isHealthy: boolean;
  rawLabel: string;
}

export type DetectionSource = 'Local Trained Model' | 'Gemini AI Fallback';

export interface ModelStatus {
  working: boolean;
  mode?: string;
  threshold?: number;
  modelPath?: string;
  fallbackModel?: string;
  localMessage?: string | null;
  localModelPath?: string | null;
  error?: string;
  reason?: string;
  solution?: string;
}

export interface DetectionResult {
  success: boolean;
  source: DetectionSource;
  data: DiseaseData;
  scanId?: string | null;
  modelStatus?: ModelStatus;
}

export interface CropScan {
  id: string;
  imageUrl: string;
  detectedDisease: string;
  severity: DiseaseData['severity'];
  source: DetectionSource;
  confidence?: number;
  isHealthy?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export interface WeatherAlert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
}

export interface WeatherForecastDay {
  day: string;
  tempHigh: number;
  tempLow: number;
  humidity: number;
}

export interface DiseaseRisk {
  crop: string;
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  likelyDisease: string;
  action: string;
}

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    location: string;
  };
  forecast: WeatherForecastDay[];
  alerts: WeatherAlert[];
  diseaseRisks: DiseaseRisk[];
}
