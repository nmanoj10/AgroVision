// src/pages/Login.tsx

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { loginSchema } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      login(response.user, response.accessToken);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bg-secondary to-bg-primary items-center justify-center p-12 relative overflow-hidden border-r border-border-color">
        <div className="absolute top-0 left-0 w-full h-full bg-accent-green/5 blur-3xl" />
        <div className="relative z-10 text-center space-y-8">
          <div className="inline-flex h-24 w-24 rounded-3xl bg-gradient-to-br from-accent-green to-accent-emerald items-center justify-center shadow-glow mb-4">
            <Leaf className="text-bg-primary h-12 w-12" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-text-primary">AgroVision</h1>
          <p className="text-xl text-text-secondary max-w-md mx-auto">
            Protect your crops with the world's most advanced agricultural AI.
          </p>
          <div className="space-y-4 pt-8">
            {[
              'Instant disease diagnosis',
              'Expert treatment plans',
              'Real-time weather alerts'
            ].map((point, i) => (
              <div key={i} className="flex items-center gap-3 text-text-muted font-medium justify-center">
                <div className="h-2 w-2 rounded-full bg-accent-green" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-bg-primary">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-text-primary mb-2">Welcome back 👋</h2>
            <p className="text-text-muted">Sign in to your AgroVision account</p>
          </div>

          <Card className="p-8 border-border-light shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email Address"
                placeholder="name@example.com"
                error={errors.email?.message as string}
                {...register('email')}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.password?.message as string}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center justify-end">
                <a href="#" className="text-sm font-bold text-accent-green hover:text-accent-lime transition-colors">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full py-4" isLoading={isLoading}>
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

          </Card>

          <p className="text-center text-text-muted font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-green hover:text-accent-lime transition-colors font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
