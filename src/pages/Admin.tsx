// src/pages/Admin.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Building2, 
  TrendingUp, 
  Search, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/dashboard/StatsCard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const SCAN_DATA = [
  { date: '01 Mar', scans: 45 },
  { date: '02 Mar', scans: 52 },
  { date: '03 Mar', scans: 48 },
  { date: '04 Mar', scans: 61 },
  { date: '05 Mar', scans: 55 },
  { date: '06 Mar', scans: 67 },
  { date: '07 Mar', scans: 72 },
  { date: '08 Mar', scans: 65 },
  { date: '09 Mar', scans: 80 },
  { date: '10 Mar', scans: 85 },
  { date: '11 Mar', scans: 78 },
  { date: '12 Mar', scans: 92 },
  { date: '13 Mar', scans: 95 },
];

const DISEASE_DISTRIBUTION = [
  { name: 'Late Blight', value: 35 },
  { name: 'Early Blight', value: 25 },
  { name: 'Rust', value: 20 },
  { name: 'Blast', value: 15 },
  { name: 'Healthy', value: 5 },
];

const COLORS = ['#22c55e', '#10b981', '#84cc16', '#3b82f6', '#f59e0b'];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                <ShieldCheck className="h-6 w-6" />
              </div>
              Admin Panel
            </h1>
            <p className="text-text-muted mt-1">System-wide monitoring and management</p>
          </div>
          <Badge variant="info" className="px-4 py-1.5 text-sm">System Status: Healthy</Badge>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-bg-secondary rounded-2xl border border-border-color w-fit">
          {['Overview', 'Users', 'Proposals', 'Schemes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-bg-card text-accent-green shadow-lg border border-border-color' 
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard label="Total Users" value="12,450" icon={Users} color="blue" trend="+124 today" trendType="up" />
              <StatsCard label="Total Scans" value="85,620" icon={Search} color="green" trend="+1.2k this week" trendType="up" />
              <StatsCard label="Pending Proposals" value="18" icon={FileText} color="amber" trend="5 new today" trendType="down" />
              <StatsCard label="Active Schemes" value="142" icon={Building2} color="emerald" trend="No change" trendType="neutral" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scan Activity Chart */}
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-accent-green" />
                    Scan Activity (Last 14 Days)
                  </h3>
                  <Badge variant="neutral">Daily Average: 68</Badge>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={SCAN_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a3828" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f2318', border: '1px solid #1a3828', borderRadius: '12px' }}
                        itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="scans" 
                        stroke="#22c55e" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#080f0a' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Disease Distribution Chart */}
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-accent-blue" />
                    Disease Distribution
                  </h3>
                  <Badge variant="neutral">Total: 200+ Types</Badge>
                </div>
                <div className="h-80 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DISEASE_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {DISEASE_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f2318', border: '1px solid #1a3828', borderRadius: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {DISEASE_DISTRIBUTION.map((entry, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-xs font-bold text-text-secondary">{entry.name}</span>
                        <span className="text-xs text-text-dim ml-auto">{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'Users' && (
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-border-color flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-dim" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-full bg-bg-primary border border-border-color rounded-xl pl-12 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-green"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Export CSV</Button>
                <Button size="sm">Add User</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-bg-secondary/50 border-b border-border-color">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Scans</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-dim uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {[
                    { name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'Farmer', scans: 42, joined: '12 Jan 2024', status: 'Active' },
                    { name: 'Amit Singh', email: 'amit@example.com', role: 'Admin', scans: 128, joined: '01 Jan 2024', status: 'Active' },
                    { name: 'Savitri Devi', email: 'savitri@example.com', role: 'Farmer', scans: 15, joined: '15 Feb 2024', status: 'Active' },
                    { name: 'Vikram Patil', email: 'vikram@example.com', role: 'Farmer', scans: 0, joined: '10 Mar 2024', status: 'Pending' },
                  ].map((user, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green font-bold">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-primary">{user.name}</p>
                            <p className="text-xs text-text-dim">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'Admin' ? 'info' : 'neutral'}>{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-text-secondary">{user.scans}</td>
                      <td className="px-6 py-4 text-sm text-text-muted">{user.joined}</td>
                      <td className="px-6 py-4">
                        <Badge variant={user.status === 'Active' ? 'success' : 'warning'}>{user.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-text-muted hover:text-text-primary transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'Proposals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Pending Proposals</h2>
              <Badge variant="warning">18 New</Badge>
            </div>
            <div className="grid gap-4">
              {[
                { title: 'Solar Irrigation System', author: 'Rajesh Kumar', date: '2h ago', category: 'Innovation' },
                { title: 'Organic Pesticide Formulation', author: 'Savitri Devi', date: '5h ago', category: 'Organic' },
                { title: 'Drone Spraying Network', author: 'Amit Singh', date: '1d ago', category: 'Technology' },
              ].map((p, i) => (
                <Card key={i} className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-accent-lime">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary">{p.title}</h4>
                      <p className="text-xs text-text-muted">By {p.author} • {p.date} • {p.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-accent-red hover:bg-accent-red/10">
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button size="sm" className="bg-accent-green text-bg-primary">
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
