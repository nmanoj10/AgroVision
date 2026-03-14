// src/pages/Landing.tsx

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Search, 
  MessageSquare, 
  CloudSun, 
  IndianRupee, 
  Building2, 
  Lightbulb,
  ArrowRight,
  Play,
  CheckCircle2,
  ChevronRight,
  Star,
  ShieldCheck,
  Zap,
  Upload
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-color">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-green to-accent-emerald flex items-center justify-center shadow-glow">
              <Leaf className="text-bg-primary h-6 w-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">AgroVision</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-text-secondary">
            <a href="#features" className="hover:text-accent-green transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-accent-green transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-accent-green transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">Login</Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-green/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-emerald/10 rounded-full blur-[100px] animate-pulse-slow" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="success" className="mb-6 py-1.5 px-4 text-sm">
              🌿 AI-Powered Agricultural Intelligence
            </Badge>
            <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Detect Crop Disease <br />
              <span className="bg-gradient-to-r from-accent-green to-accent-lime bg-clip-text text-transparent">
                Before It Spreads
              </span>
            </h1>
            <p className="text-xl text-text-secondary mb-10 max-w-xl leading-relaxed">
              Upload a leaf photo. Get instant AI diagnosis. Protect your harvest with cutting-edge technology trusted by 50,000+ farmers.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/detect">
                <Button size="lg" className="group">
                  Start Free Detection
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Play className="mr-2 h-5 w-5 fill-current" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-medium text-text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent-green" />
                No signup required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent-green" />
                Results in 3 seconds
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent-green" />
                Free forever
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 animate-float">
              <Card className="p-0 overflow-hidden border-accent-green/30 shadow-glow-lg">
                <div className="bg-bg-secondary p-4 border-b border-border-color flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-accent-red/50" />
                    <div className="h-3 w-3 rounded-full bg-accent-amber/50" />
                    <div className="h-3 w-3 rounded-full bg-accent-green/50" />
                  </div>
                  <Badge variant="error">High Severity</Badge>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-48 w-full rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Leaf className="h-20 w-20 text-accent-green/20" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">Tomato Late Blight</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-text-muted">
                      <span>Confidence</span>
                      <span>94.5%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[94.5%] bg-accent-green" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border-color">
                    <p className="text-xs font-bold text-accent-green uppercase mb-2">Treatment</p>
                    <p className="text-sm text-text-secondary">Apply copper-based fungicides immediately and remove infected leaves...</p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 h-40 w-40 bg-accent-green/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-accent-emerald/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-bg-secondary border-y border-border-color py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Scans Completed', value: '50,000+' },
            { label: 'Diseases Identified', value: '200+' },
            { label: 'Diagnosis Accuracy', value: '95%' },
            { label: 'Languages Supported', value: '12' },
          ].map((stat, i) => (
            <div key={i} className="text-center md:border-r last:border-0 border-border-color">
              <h3 className="text-4xl font-extrabold text-accent-green mb-1">{stat.value}</h3>
              <p className="text-sm font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">From Photo to Treatment in 3 Steps</h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">Our advanced AI pipeline ensures you get accurate results and actionable advice in seconds.</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border-light to-transparent -translate-y-1/2 z-0" />
          
          {[
            { 
              icon: Upload, 
              title: 'Upload Leaf Photo', 
              desc: 'Drag & drop or take a photo with your phone camera' 
            },
            { 
              icon: Zap, 
              title: 'AI Analysis', 
              desc: 'Our model analyzes the image with Gemini Vision backup' 
            },
            { 
              icon: ShieldCheck, 
              title: 'Get Treatment Plan', 
              desc: 'Detailed diagnosis with step-by-step treatment steps' 
            },
          ].map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-3xl bg-bg-card border border-border-color flex items-center justify-center text-accent-green mb-6 shadow-glow transition-transform hover:scale-110">
                <step.icon className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Everything a Farmer Needs</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">Beyond detection, we provide a complete ecosystem for modern agriculture.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Leaf, title: 'Disease Detection', desc: 'Keras ML model + Gemini Vision backup for 95% accuracy.', color: 'green' },
              { icon: MessageSquare, title: 'AI Chat Assistant', desc: 'Multilingual farming expert available 24/7 for your queries.', color: 'blue' },
              { icon: CloudSun, title: 'Weather Risk', desc: 'Predict disease outbreaks based on local weather forecasts.', color: 'amber' },
              { icon: IndianRupee, title: 'Income Advisor', desc: 'High-yield crop recommendations based on your soil and season.', color: 'emerald' },
              { icon: Building2, title: 'Govt Schemes', desc: 'All central and state subsidies and loans in one easy place.', color: 'orange' },
              { icon: Lightbulb, title: 'Community Proposals', desc: 'Share your farming innovations and get expert feedback.', color: 'lime' },
            ].map((feature, i) => (
              <Card key={i} hover className="group">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 bg-accent-${feature.color}/10 text-accent-${feature.color}`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-bg-card to-bg-secondary border-accent-green/30 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-accent-green/5 blur-3xl -z-10" />
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to Protect Your Crops?</h2>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">Join 50,000+ farmers using AgroVision to increase their yield and secure their future.</p>
            <Link to="/signup">
              <Button size="lg" className="px-12">Get Started Free</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-secondary border-t border-border-color pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-accent-green flex items-center justify-center">
                <Leaf className="text-bg-primary h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">AgroVision</span>
            </div>
            <p className="text-text-muted max-w-xs leading-relaxed">
              Empowering farmers with AI-driven insights to protect crops, increase yields, and secure sustainable futures.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><Link to="/detect" className="hover:text-accent-green transition-colors">Detection</Link></li>
              <li><Link to="/chat" className="hover:text-accent-green transition-colors">AI Assistant</Link></li>
              <li><Link to="/weather" className="hover:text-accent-green transition-colors">Weather</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><Link to="/schemes" className="hover:text-accent-green transition-colors">Govt Schemes</Link></li>
              <li><Link to="/proposals" className="hover:text-accent-green transition-colors">Proposals</Link></li>
              <li><Link to="/income" className="hover:text-accent-green transition-colors">Income Advisor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Connect</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="#" className="hover:text-accent-green transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-accent-green transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-accent-green transition-colors">Facebook</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 border-t border-border-color flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-bold text-text-dim uppercase tracking-widest">
          <p>© 2024 AGROVISION AI. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-text-muted transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-muted transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
