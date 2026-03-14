// src/pages/Schemes.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Filter, 
  ExternalLink, 
  ChevronDown, 
  Calendar,
  CheckCircle2,
  Info
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const SCHEMES = [
  {
    id: '1',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'Direct income support of ₹6,000 per year to all landholding farmer families across the country in three equal installments.',
    benefits: '₹6,000 per year',
    eligibility: ['All Landholding Farmers', 'Indian Citizen'],
    category: 'Subsidy',
    applicationUrl: 'https://pmkisan.gov.in/',
    deadline: 'Ongoing'
  },
  {
    id: '2',
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'Government-sponsored crop insurance scheme that integrates multiple stakeholders and provides insurance coverage against crop failure.',
    benefits: 'Crop insurance at 1.5-5% premium',
    eligibility: ['All Farmers', 'Loanee & Non-Loanee'],
    category: 'Insurance',
    applicationUrl: 'https://pmfby.gov.in/',
    deadline: 'Before Season Start'
  },
  {
    id: '3',
    name: 'Kisan Credit Card (KCC)',
    ministry: 'Reserve Bank of India / NABARD',
    description: 'Provides farmers with timely access to credit for their cultivation and other needs, including purchase of inputs.',
    benefits: 'Up to ₹3 lakh at 4% interest',
    eligibility: ['Individual Farmers', 'Joint Borrowers', 'SHGs'],
    category: 'Loan',
    applicationUrl: 'https://www.nabard.org/',
    deadline: 'Ongoing'
  },
  {
    id: '4',
    name: 'PM Krishi Sinchai Yojana (PMKSY)',
    ministry: 'Ministry of Jal Shakti',
    description: 'Focuses on "Har Khet Ko Pani" and "Per Drop More Crop" to improve water use efficiency at the farm level.',
    benefits: 'Up to 55% subsidy on irrigation equipment',
    eligibility: ['All Farmers', 'Members of Cooperatives'],
    category: 'Subsidy',
    applicationUrl: 'https://pmksy.gov.in/',
    deadline: 'Ongoing'
  },
  {
    id: '5',
    name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'Promotes organic farming through a cluster-based approach and PGS certification.',
    benefits: '₹50,000 per hectare for 3 years',
    eligibility: ['Cluster of 50+ Farmers', '20 Hectare Land'],
    category: 'Training',
    applicationUrl: 'https://pgsindia-ncof.gov.in/',
    deadline: 'Ongoing'
  },
  {
    id: '6',
    name: 'eNAM (National Agriculture Market)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'Pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities.',
    benefits: 'Direct access to buyers, better prices',
    eligibility: ['Farmers', 'Traders', 'FPOs'],
    category: 'Market',
    applicationUrl: 'https://www.enam.gov.in/',
    deadline: 'Ongoing'
  },
  {
    id: '7',
    name: 'Soil Health Card Scheme',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'Provides farmers with information on the nutrient status of their soil along with recommendations on appropriate dosage of nutrients.',
    benefits: 'Free soil testing and health card',
    eligibility: ['All Farmers'],
    category: 'Training',
    applicationUrl: 'https://soilhealth.dac.gov.in/',
    deadline: 'Every 2 Years'
  },
  {
    id: '8',
    name: 'RKVY (Rashtriya Krishi Vikas Yojana)',
    ministry: 'State Governments',
    description: 'State-specific grants for holistic development of agriculture and allied sectors.',
    benefits: 'Grants up to ₹5 lakh for projects',
    eligibility: ['Farmers', 'Agri-Entrepreneurs'],
    category: 'Subsidy',
    applicationUrl: 'https://rkvy.nic.in/',
    deadline: 'Varies by State'
  }
];

export default function Schemes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['All', 'Insurance', 'Subsidy', 'Loan', 'Training', 'Market'];

  const filteredSchemes = SCHEMES.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || scheme.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight flex items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-accent-orange/10 flex items-center justify-center text-accent-orange">
              <Building2 className="h-8 w-8" />
            </div>
            Govt Schemes for Farmers
          </h1>
          <p className="text-text-secondary text-lg">
            Access all central and state subsidies, insurance, and loans in one place.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-bg-card/50 p-6 rounded-3xl border border-border-color">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-dim" />
            <input
              type="text"
              placeholder="Search schemes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-primary border border-border-color rounded-xl pl-12 pr-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-green"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-accent-green text-bg-primary shadow-glow' 
                    : 'bg-white/5 text-text-muted hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme, i) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover className="h-full flex flex-col group">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-accent-orange/10 flex items-center justify-center text-accent-orange group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <Badge variant={
                    scheme.category === 'Subsidy' ? 'success' :
                    scheme.category === 'Insurance' ? 'info' :
                    scheme.category === 'Loan' ? 'warning' : 'neutral'
                  }>
                    {scheme.category}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">{scheme.name}</h3>
                <p className="text-xs text-text-dim font-bold mb-4">{scheme.ministry}</p>
                
                <div className="mb-6">
                  <p className="text-xs font-bold text-text-dim uppercase tracking-widest mb-2">Benefit</p>
                  <p className="text-2xl font-extrabold text-accent-green">{scheme.benefits}</p>
                </div>

                <p className="text-sm text-text-secondary line-clamp-3 mb-6 flex-1">
                  {scheme.description}
                </p>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-dim uppercase tracking-widest">Deadline</span>
                    <span className={scheme.deadline === 'Ongoing' ? 'text-accent-green' : 'text-accent-amber'}>
                      {scheme.deadline}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setExpandedId(expandedId === scheme.id ? null : scheme.id)}
                    >
                      {expandedId === scheme.id ? 'Close' : 'Details'}
                    </Button>
                    <a href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" className="w-full">
                        Apply <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>

                {expandedId === scheme.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-6 pt-6 border-t border-white/5 space-y-4"
                  >
                    <div>
                      <p className="text-xs font-bold text-text-dim uppercase tracking-widest mb-2">Eligibility</p>
                      <div className="flex flex-wrap gap-2">
                        {scheme.eligibility.map((item, idx) => (
                          <Badge key={idx} variant="neutral" className="bg-white/5">{item}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/10">
                      <p className="text-xs text-accent-blue flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Make sure to have your Aadhar and Land records ready.
                      </p>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="text-center py-20">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-text-dim">
              <Search className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">No schemes found</h3>
            <p className="text-text-muted">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
