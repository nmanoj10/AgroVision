// src/pages/NotFound.tsx

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="relative inline-block">
          <h1 className="text-[12rem] font-black text-white/5 leading-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="h-32 w-32 text-accent-green animate-float" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold text-text-primary">Lost in the Fields?</h2>
          <p className="text-text-secondary text-lg max-w-md mx-auto">
            The page you're looking for has been harvested or never planted. Let's get you back to the dashboard.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/">
            <Button variant="outline" size="lg">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg">
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
