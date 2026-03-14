// src/pages/Income.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IndianRupee, 
  TrendingUp, 
  Droplets, 
  AlertTriangle, 
  Calculator,
  Calendar,
  ChevronRight,
  Trophy,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';

const CROPS = [
  { name: 'Turmeric', yield: '25 q/acre', price: 8500, profit: 125000, water: 'Medium', risk: 'Low', season: 'Kharif', emoji: '🫚' },
  { name: 'Sugarcane', yield: '400 q/acre', price: 310, profit: 95000, water: 'High', risk: 'Low', season: 'Annual', emoji: '🎋' },
  { name: 'Soybean', yield: '12 q/acre', price: 4800, profit: 35000, water: 'Low', risk: 'Medium', season: 'Kharif', emoji: '🫛' },
  { name: 'Cotton', yield: '10 q/acre', price: 7200, profit: 42000, water: 'Medium', risk: 'High', season: 'Kharif', emoji: '☁️' },
  { name: 'Wheat', yield: '20 q/acre', price: 2275, profit: 28000, water: 'Medium', risk: 'Low', season: 'Rabi', emoji: '🌾' },
  { name: 'Rice', yield: '25 q/acre', price: 2183, profit: 32000, water: 'High', risk: 'Medium', season: 'Kharif', emoji: '🍚' },
  { name: 'Tomato', yield: '150 q/acre', price: 1200, profit: 80000, water: 'Medium', risk: 'High', season: 'Zaid', emoji: '🍅' },
  { name: 'Onion', yield: '120 q/acre', price: 1800, profit: 75000, water: 'Medium', risk: 'Medium', season: 'Rabi', emoji: '🧅' },
  { name: 'Potato', yield: '140 q/acre', price: 1500, profit: 70000, water: 'Medium', risk: 'Medium', season: 'Rabi', emoji: '🥔' },
  { name: 'Maize', yield: '30 q/acre', price: 2090, profit: 25000, water: 'Low', risk: 'Low', season: 'Kharif', emoji: '🌽' },
];

export default function Income() {
  const [acres, setAcres] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0]);

  const grossRevenue = selectedCrop.profit * acres * 1.4; // Simplified math
  const estimatedCost = selectedCrop.profit * acres * 0.4;
  const netProfit = selectedCrop.profit * acres;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent-emerald/10 flex items-center justify-center text-accent-emerald">
                <IndianRupee className="h-6 w-6" />
              </div>
              Income & High-Yield Advisor
            </h1>
            <p className="text-text-muted mt-1">Maximize your profits with data-driven crop recommendations</p>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <Filter className="h-4 w-4 text-text-dim" />
              <select className="bg-transparent text-xs font-bold text-text-secondary focus:outline-none">
                <option value="all">All Seasons</option>
                <option value="kharif">Kharif</option>
                <option value="rabi">Rabi</option>
                <option value="zaid">Zaid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profit Calculator */}
          <Card className="lg:col-span-1 space-y-6 bg-gradient-to-br from-bg-card to-bg-secondary border-accent-emerald/20">
            <div className="flex items-center gap-3">
              <Calculator className="h-6 w-6 text-accent-emerald" />
              <h2 className="text-xl font-bold text-text-primary">Profit Calculator</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-dim uppercase tracking-widest">Land Size (Acres)</label>
                <input
                  type="number"
                  value={acres}
                  onChange={(e) => setAcres(Number(e.target.value))}
                  className="w-full bg-bg-primary border border-border-color rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-emerald"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-dim uppercase tracking-widest">Select Crop</label>
                <select
                  value={selectedCrop.name}
                  onChange={(e) => setSelectedCrop(CROPS.find(c => c.name === e.target.value) || CROPS[0])}
                  className="w-full bg-bg-primary border border-border-color rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-emerald"
                >
                  {CROPS.map(crop => (
                    <option key={crop.name} value={crop.name}>{crop.emoji} {crop.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Gross Revenue</span>
                <span className="font-bold text-text-primary">{formatCurrency(grossRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Estimated Cost</span>
                <span className="font-bold text-accent-red">-{formatCurrency(estimatedCost)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20 flex justify-between items-center">
                <span className="font-bold text-accent-emerald">Net Profit</span>
                <span className="text-2xl font-extrabold text-accent-emerald">{formatCurrency(netProfit)}</span>
              </div>
              <p className="text-[10px] text-center text-text-dim italic">
                *Estimates based on current market MSP and average yield data.
              </p>
            </div>
          </Card>

          {/* Recommendation Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Top Recommendations</h2>
              <Badge variant="success">Best for Kharif Season</Badge>
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-bg-secondary/50 border-b border-border-color">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Crop</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Profit/Acre</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Water Need</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Risk</th>
                      <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Season</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {CROPS.sort((a, b) => b.profit - a.profit).map((crop, i) => (
                      <tr key={i} className={`hover:bg-white/5 transition-colors ${i < 3 ? 'border-l-4 border-accent-amber' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{crop.emoji}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary">{crop.name}</span>
                              {i === 0 && <Trophy className="h-4 w-4 text-accent-amber" />}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-extrabold text-accent-green">{formatCurrency(crop.profit)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                            <Droplets className={`h-4 w-4 ${crop.water === 'High' ? 'text-accent-blue' : 'text-accent-blue/40'}`} />
                            {crop.water}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={crop.risk === 'High' ? 'error' : crop.risk === 'Medium' ? 'warning' : 'success'}>
                            {crop.risk}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-text-dim">
                          {crop.season}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Planting Calendar */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-accent-blue" />
            <h2 className="text-2xl font-bold text-text-primary">Planting & Harvest Calendar</h2>
          </div>
          
          <Card className="p-8 overflow-x-auto">
            <div className="min-w-[800px] space-y-6">
              <div className="grid grid-cols-12 gap-2 text-center text-[10px] font-bold text-text-dim uppercase tracking-widest mb-4">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                  <div key={m}>{m}</div>
                ))}
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Rice', start: 5, end: 10, color: 'bg-accent-blue' },
                  { name: 'Wheat', start: 10, end: 3, color: 'bg-accent-amber' },
                  { name: 'Soybean', start: 5, end: 9, color: 'bg-accent-green' },
                  { name: 'Tomato', start: 1, end: 5, color: 'bg-accent-red' },
                ].map((crop, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-24 text-xs font-bold text-text-secondary">{crop.name}</div>
                    <div className="flex-1 h-3 bg-white/5 rounded-full relative">
                      <div 
                        className={`absolute h-full rounded-full ${crop.color} opacity-60`}
                        style={{ 
                          left: `${(crop.start / 12) * 100}%`, 
                          width: `${((crop.end > crop.start ? crop.end - crop.start : 12 - crop.start + crop.end) / 12) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
