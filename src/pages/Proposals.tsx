// src/pages/Proposals.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Plus, 
  ThumbsUp, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  User,
  Filter,
  ArrowUpRight,
  Send
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { proposalSchema } from '../utils/validators';
import toast from 'react-hot-toast';

const MOCK_PROPOSALS = [
  {
    id: '1',
    userId: '101',
    userName: 'Rajesh Kumar',
    title: 'Solar-Powered Automated Irrigation System',
    category: 'Innovation',
    problem: 'High electricity costs and water wastage in traditional irrigation methods.',
    solution: 'A low-cost solar-powered system with moisture sensors that automatically triggers irrigation only when needed.',
    impact: '40% reduction in water usage, zero electricity cost.',
    budget: '₹15,000 per acre',
    votes: 128,
    status: 'Expert Approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: '2',
    userId: '102',
    userName: 'Savitri Devi',
    title: 'Organic Neem-Based Pest Control Solution',
    category: 'Organic',
    problem: 'Chemical pesticides are expensive and harmful to soil health.',
    solution: 'A concentrated neem-oil and garlic extract formulation that effectively repels 20+ common crop pests.',
    impact: '100% organic, 60% cheaper than chemical alternatives.',
    budget: '₹500 per liter',
    votes: 85,
    status: 'Implemented',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: '3',
    userId: '103',
    userName: 'Amit Singh',
    title: 'Drone-Based Localized Spraying Network',
    category: 'Technology',
    problem: 'Manual spraying is time-consuming and leads to uneven pesticide distribution.',
    solution: 'A community-shared drone network for precision spraying based on AgroVision disease detection results.',
    impact: '80% faster spraying, 30% less pesticide used.',
    budget: '₹5,00,000 for 10 villages',
    votes: 210,
    status: 'Pending Review',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export default function Proposals() {
  const [proposals, setProposals] = useState(MOCK_PROPOSALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(proposalSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newProposal = {
        id: Date.now().toString(),
        userId: '1',
        userName: 'You',
        ...data,
        votes: 0,
        status: 'Pending Review',
        createdAt: new Date().toISOString()
      };
      setProposals([newProposal, ...proposals]);
      toast.success('Proposal submitted successfully!');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Submission failed');
    }
  };

  const handleVote = (id: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p));
    toast.success('Vote recorded!');
  };

  const filteredProposals = proposals.filter(p => 
    activeFilter === 'All' || p.category === activeFilter
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="bg-gradient-to-br from-bg-card to-bg-secondary border-accent-lime/30 p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-lime/10 blur-3xl -z-10" />
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-6">
              Have a Solution for <br />
              <span className="text-accent-lime">Crop Disease?</span>
            </h1>
            <p className="text-lg text-text-secondary mb-10">
              Submit your innovation. Get expert review. Connect with investors and make a real impact on the farming community.
            </p>
            <Button size="lg" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Submit Proposal
            </Button>
          </div>
          <div className="hidden lg:block absolute right-12 bottom-0 h-64 w-64">
            <Lightbulb className="h-full w-full text-accent-lime/10 animate-pulse" />
          </div>
        </Card>

        {/* Board Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-accent-lime">
              <Filter className="h-4 w-4" />
            </div>
            Proposal Board
          </h2>

          <div className="flex flex-wrap gap-2">
            {['All', 'Innovation', 'Organic', 'Technology', 'Water'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === cat 
                    ? 'bg-accent-lime text-bg-primary shadow-glow' 
                    : 'bg-white/5 text-text-muted hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredProposals.map((proposal, i) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover className="p-8 group">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant={
                          proposal.status === 'Implemented' ? 'success' :
                          proposal.status === 'Expert Approved' ? 'info' : 'warning'
                        }>
                          {proposal.status}
                        </Badge>
                        <Badge variant="neutral" className="bg-white/5">{proposal.category}</Badge>
                        <span className="text-xs text-text-dim flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-text-primary group-hover:text-accent-lime transition-colors">
                        {proposal.title}
                      </h3>

                      <div className="grid md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">The Problem</p>
                          <p className="text-sm text-text-secondary leading-relaxed">{proposal.problem}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">The Solution</p>
                          <p className="text-sm text-text-secondary leading-relaxed">{proposal.solution}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green text-xs font-bold">
                            {proposal.userName[0]}
                          </div>
                          <span className="text-sm font-bold text-text-primary">{proposal.userName}</span>
                        </div>
                        <div className="text-sm font-medium text-text-muted">
                          Impact: <span className="text-accent-green font-bold">{proposal.impact}</span>
                        </div>
                        <div className="text-sm font-medium text-text-muted">
                          Budget: <span className="text-text-primary font-bold">{proposal.budget}</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-32 flex flex-row lg:flex-col items-center justify-center gap-4 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
                      <button 
                        onClick={() => handleVote(proposal.id)}
                        className="flex flex-col items-center gap-1 group/vote"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted group-hover/vote:bg-accent-lime/10 group-hover/vote:text-accent-lime group-hover/vote:border-accent-lime/30 transition-all">
                          <ThumbsUp className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-bold text-text-primary">{proposal.votes}</span>
                      </button>
                      
                      <button className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-text-primary transition-all">
                        <MessageSquare className="h-6 w-6" />
                      </button>
                      
                      <button className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-text-primary transition-all">
                        <ArrowUpRight className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Submit Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Submit Your Proposal"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input 
                label="Proposal Title" 
                placeholder="e.g. Solar Irrigation System" 
                error={errors.title?.message as string}
                {...register('title')}
              />
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-secondary pl-1">Category</label>
                <select 
                  {...register('category')}
                  className="w-full rounded-xl border border-border-color bg-bg-card px-4 py-3 text-text-primary focus:border-accent-green focus:outline-none"
                >
                  <option value="">Select Category</option>
                  <option value="Innovation">Innovation</option>
                  <option value="Organic">Organic</option>
                  <option value="Technology">Technology</option>
                  <option value="Water">Water</option>
                </select>
                {errors.category && <p className="text-xs text-accent-red pl-1">{errors.category.message as string}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary pl-1">Problem Statement</label>
              <textarea 
                {...register('problem')}
                rows={3}
                placeholder="What challenge are you addressing?"
                className="w-full rounded-xl border border-border-color bg-bg-card px-4 py-3 text-text-primary focus:border-accent-green focus:outline-none resize-none"
              />
              {errors.problem && <p className="text-xs text-accent-red pl-1">{errors.problem.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary pl-1">Proposed Solution</label>
              <textarea 
                {...register('solution')}
                rows={4}
                placeholder="Describe your solution in detail..."
                className="w-full rounded-xl border border-border-color bg-bg-card px-4 py-3 text-text-primary focus:border-accent-green focus:outline-none resize-none"
              />
              {errors.solution && <p className="text-xs text-accent-red pl-1">{errors.solution.message as string}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input 
                label="Expected Impact" 
                placeholder="e.g. 30% yield increase" 
                error={errors.impact?.message as string}
                {...register('impact')}
              />
              <Input 
                label="Estimated Budget" 
                placeholder="e.g. ₹10,000" 
                error={errors.budget?.message as string}
                {...register('budget')}
              />
            </div>

            <Input 
              label="Contact Email" 
              placeholder="your@email.com" 
              error={errors.contactEmail?.message as string}
              {...register('contactEmail')}
            />

            <Button type="submit" className="w-full py-4" isLoading={isSubmitting}>
              <Send className="mr-2 h-5 w-5" />
              Submit Proposal for Review
            </Button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
