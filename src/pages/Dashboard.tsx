// src/pages/Dashboard.tsx

import { useEffect, useMemo, useState } from 'react';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  MessageSquare,
  CloudSun,
  Building2,
  ImageOff,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatsCard } from '../components/dashboard/StatsCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { useDetectStore } from '../store/detectStore';
import { formatDate } from '../utils/formatters';
import { frontendWeatherService } from '../services/frontendWeatherService';
import { WeatherData } from '../types';

export default function Dashboard() {
  const { scanHistory, loadHistory } = useDetectStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await loadHistory();
    };
    init();
  }, [loadHistory]);

  useEffect(() => {
    let active = true;
    frontendWeatherService
      .getWeather('Nashik, Maharashtra')
      .then((data) => {
        if (!active) return;
        setWeather(data);
        setWeatherError(null);
      })
      .catch((err) => {
        if (!active) return;
        setWeatherError(err instanceof Error ? err.message : 'Weather unavailable');
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalScans = scanHistory.length;
    const healthyScans = scanHistory.filter((scan) => scan.isHealthy).length;
    const diseaseScans = totalScans - healthyScans;
    const highRiskScans = scanHistory.filter((scan) => scan.severity === 'High' || scan.severity === 'Critical').length;

    const now = Date.now();
    const last7Days = scanHistory.filter((scan) => {
      const createdAt = new Date(scan.createdAt).getTime();
      return !Number.isNaN(createdAt) && now - createdAt <= 7 * 24 * 60 * 60 * 1000;
    });

    const last7Healthy = last7Days.filter((scan) => scan.isHealthy).length;
    const last7Diseases = last7Days.length - last7Healthy;

    const healthyPercent = totalScans ? Math.round((healthyScans / totalScans) * 100) : 0;

    return {
      totalScans,
      diseaseScans,
      healthyScans,
      highRiskScans,
      trends: {
        total: totalScans ? `${last7Days.length} in last 7 days` : 'No scans yet',
        diseases: diseaseScans ? `${last7Diseases} in last 7 days` : 'No diseases detected',
        healthy: totalScans ? `${healthyPercent}% healthy` : 'No scans yet',
        risk: highRiskScans ? `${highRiskScans} high severity` : 'No high severity scans',
      },
    };
  }, [scanHistory]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Total Scans"
            value={stats.totalScans}
            icon={Search}
            trend={stats.trends.total}
            trendType="neutral"
            color="blue"
            delay={0.1}
          />
          <StatsCard
            label="Diseases Found"
            value={stats.diseaseScans}
            icon={AlertTriangle}
            trend={stats.trends.diseases}
            trendType="neutral"
            color="red"
            delay={0.2}
          />
          <StatsCard
            label="Healthy Scans"
            value={stats.healthyScans}
            icon={CheckCircle2}
            trend={stats.trends.healthy}
            trendType="neutral"
            color="emerald"
            delay={0.3}
          />
          <StatsCard
            label="Crops at Risk"
            value={stats.highRiskScans}
            icon={TrendingUp}
            trend={stats.trends.risk}
            trendType="neutral"
            color="amber"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Scans Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Recent Scans</h2>
              <Link to="/detect" className="text-sm font-bold text-accent-green hover:underline">View All</Link>
            </div>
            
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-bg-secondary/50 border-b border-border-color">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Crop / Disease</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Severity</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {scanHistory.length > 0 ? scanHistory.map((scan) => (
                      <tr key={scan.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {scan.imageUrl ? (
                              <img
                                src={scan.imageUrl}
                                alt={scan.detectedDisease}
                                className="h-10 w-10 rounded-lg object-cover border border-border-color"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-white/5 border border-border-color flex items-center justify-center text-text-dim">
                                <ImageOff className="h-5 w-5" />
                              </div>
                            )}
                            <span className="font-bold text-text-primary">{scan.detectedDisease}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={scan.severity === 'High' || scan.severity === 'Critical' ? 'error' : scan.severity === 'Medium' ? 'warning' : 'success'}>
                            {scan.severity}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-muted">
                          {formatDate(scan.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-2 text-text-muted hover:text-accent-green hover:bg-accent-green/10 rounded-lg transition-all">
                            <ArrowRight className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-text-dim">
                              <Search className="h-8 w-8" />
                            </div>
                            <p className="text-text-muted font-medium">No scans yet. Start by checking your first crop!</p>
                            <Link to="/detect">
                              <Button variant="outline" size="sm">Scan Now</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Quick Actions & Weather */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-text-primary">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/detect">
                  <Card hover className="p-4 text-center space-y-3 border-accent-green/20">
                    <div className="h-10 w-10 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto">
                      <Search className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold">Scan Now</p>
                  </Card>
                </Link>
                <Link to="/chat">
                  <Card hover className="p-4 text-center space-y-3 border-accent-blue/20">
                    <div className="h-10 w-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mx-auto">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold">Ask AI</p>
                  </Card>
                </Link>
                <Link to="/weather">
                  <Card hover className="p-4 text-center space-y-3 border-accent-amber/20">
                    <div className="h-10 w-10 rounded-xl bg-accent-amber/10 text-accent-amber flex items-center justify-center mx-auto">
                      <CloudSun className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold">Weather</p>
                  </Card>
                </Link>
                <Link to="/schemes">
                  <Card hover className="p-4 text-center space-y-3 border-accent-orange/20">
                    <div className="h-10 w-10 rounded-xl bg-accent-orange/10 text-accent-orange flex items-center justify-center mx-auto">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold">Schemes</p>
                  </Card>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-text-primary">Weather Risk</h2>
              <Card className="bg-gradient-to-br from-bg-card to-bg-secondary p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <CloudSun className="h-8 w-8 text-accent-amber" />
                    <div>
                      <p className="text-2xl font-extrabold">
                        {weather ? `${weather.current.temp}C` : '--'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {weather ? weather.current.condition : 'Weather unavailable'}
                      </p>
                    </div>
                  </div>
                  {weather ? (
                    <Badge
                      variant={
                        weather.alerts[0]?.type === 'danger'
                          ? 'error'
                          : weather.alerts[0]?.type === 'warning'
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {weather.alerts[0]?.type === 'danger'
                        ? 'High Stress'
                        : weather.alerts[0]?.type === 'warning'
                          ? 'Risk Alert'
                          : 'Stable'}
                    </Badge>
                  ) : (
                    <Badge variant="info">Loading...</Badge>
                  )}
                </div>
                
                <div className="space-y-4">
                  <p className="text-xs font-bold text-text-dim uppercase tracking-widest">At-Risk Crops</p>
                  {weather ? (
                    weather.diseaseRisks.slice(0, 2).map((risk) => (
                      <div key={risk.crop} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">{risk.crop}</span>
                        </div>
                        <Badge
                          variant={
                            risk.level === 'Critical' || risk.level === 'High'
                              ? 'error'
                              : risk.level === 'Medium'
                                ? 'warning'
                                : 'success'
                          }
                        >
                          {risk.level} Risk
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-text-muted">{weatherError || 'Weather loading...'}</div>
                  )}
                </div>

              </Card>
              <Link to="/weather">
                <Button variant="ghost" className="w-full mt-6 text-xs" size="sm">
                  View Detailed Forecast <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
