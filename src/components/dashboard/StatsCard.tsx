// src/components/dashboard/StatsCard.tsx

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color: 'green' | 'red' | 'amber' | 'blue' | 'emerald';
  delay?: number;
}

export const StatsCard = ({ label, value, icon: Icon, trend, trendType, color, delay = 0 }: StatsCardProps) => {
  const colorMap = {
    green: 'text-accent-green bg-accent-green/10',
    red: 'text-accent-red bg-accent-red/10',
    amber: 'text-accent-amber bg-accent-amber/10',
    blue: 'text-accent-blue bg-accent-blue/10',
    emerald: 'text-accent-emerald bg-accent-emerald/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card hover className="relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-text-muted mb-1">{label}</p>
            <h3 className="text-3xl font-extrabold text-text-primary tracking-tight">
              {value}
            </h3>
            {trend && (
              <p className={`text-xs font-bold mt-2 ${
                trendType === 'up' ? 'text-accent-green' : 
                trendType === 'down' ? 'text-accent-red' : 'text-text-muted'
              }`}>
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${colorMap[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        {/* Subtle background glow */}
        <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full blur-3xl opacity-10 ${
          color === 'green' ? 'bg-accent-green' : 
          color === 'red' ? 'bg-accent-red' : 
          color === 'amber' ? 'bg-accent-amber' : 'bg-accent-blue'
        }`} />
      </Card>
    </motion.div>
  );
};
