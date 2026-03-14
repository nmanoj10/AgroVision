import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CloudSun, Droplets, MapPin, Search, Thermometer, Wind } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { frontendWeatherService } from '../services/frontendWeatherService';
import { WeatherData } from '../types';

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState('Nashik, Maharashtra');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    frontendWeatherService
      .getWeather('Nashik, Maharashtra')
      .then((data) => {
        setWeather(data);
        setError(null);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Weather unavailable');
        setIsLoading(false);
      });
  }, []);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!location.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await frontendWeatherService.getWeather(location.trim());
      setWeather(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Weather unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-accent-green border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!weather) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center text-text-muted text-sm">
          {error || 'Weather data is unavailable. Please try again.'}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent-amber/10 flex items-center justify-center text-accent-amber">
                <CloudSun className="h-6 w-6" />
              </div>
              Weather and Disease Risk
            </h1>
            <p className="text-text-muted mt-1">Field-friendly forecast guidance for disease prevention and crop care.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Enter city or district..."
                className="w-full bg-bg-card border border-border-color rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-green"
              />
            </div>
            <Button type="submit" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </div>

        <div className="space-y-3">
          {weather.alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${
                alert.type === 'danger'
                  ? 'bg-accent-red/10 border-accent-red/20 text-accent-red'
                  : alert.type === 'warning'
                    ? 'bg-accent-amber/10 border-accent-amber/20 text-accent-amber'
                    : 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
              }`}
            >
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold">{alert.message}</p>
            </motion.div>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-bg-card to-bg-secondary border-accent-green/20 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="flex items-center gap-8">
              <div className="text-center lg:text-left">
                <h2 className="text-7xl font-extrabold text-accent-green tracking-tighter">{weather.current.temp}C</h2>
                <p className="text-text-muted font-bold mt-1">Feels like {weather.current.feelsLike}C</p>
              </div>
              <div className="h-24 w-24 rounded-3xl bg-white/5 flex items-center justify-center">
                <CloudSun className="h-16 w-16 text-accent-amber animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-3xl font-bold text-text-primary">{weather.current.condition}</h3>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-text-muted font-medium">
                <MapPin className="h-4 w-4" />
                {weather.current.location}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-text-dim">
                  <Droplets className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Humidity</span>
                </div>
                <p className="text-xl font-bold text-text-primary">{weather.current.humidity}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-text-dim">
                  <Wind className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Wind</span>
                </div>
                <p className="text-xl font-bold text-text-primary">{weather.current.windSpeed} km/h</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-text-dim">
                  <Thermometer className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Feels</span>
                </div>
                <p className="text-xl font-bold text-text-primary">{weather.current.feelsLike}C</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-text-primary">7-Day Forecast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {weather.forecast.map((day) => (
              <Card key={day.day} className="p-4 text-center space-y-3 hover:border-accent-green/30 transition-all">
                <p className="text-sm font-bold text-text-muted">{day.day}</p>
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-accent-amber">
                  <CloudSun className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-bold text-text-primary">{day.tempHigh}C</p>
                  <p className="text-xs text-text-dim font-bold">{day.tempLow}C</p>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] font-bold text-text-dim uppercase">{day.humidity}% Hum</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Crop Disease Risk Assessment</h2>
              <p className="text-sm text-text-muted">Based on current local weather conditions.</p>
            </div>
            <Badge variant="info" className="hidden sm:flex">
              Updated just now
            </Badge>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-bg-secondary/50 border-b border-border-color">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Crop</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Risk Level</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Likely Disease</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {weather.diseaseRisks.map((risk) => (
                    <tr key={risk.crop} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-text-primary">{risk.crop}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            risk.level === 'Critical' || risk.level === 'High'
                              ? 'error'
                              : risk.level === 'Medium'
                                ? 'warning'
                                : 'success'
                          }
                        >
                          {risk.level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-text-secondary">{risk.likelyDisease}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{risk.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
