// src/pages/Signup.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signupSchema } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema)
  });

  const password = watch('password', '');
  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Weak', color: 'bg-accent-red' };
    if (password.length < 10) return { label: 'Medium', color: 'bg-accent-amber' };
    return { label: 'Strong', color: 'bg-accent-green' };
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        state: data.state,
      });
      login(response.user, response.accessToken);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Signup failed');
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
          <h1 className="text-5xl font-extrabold tracking-tight text-text-primary">Join AgroVision</h1>
          <p className="text-xl text-text-secondary max-w-md mx-auto">
            Start protecting your crops today with AI-powered insights.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-bg-primary">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-text-primary mb-2">Create your account 🌱</h2>
            <p className="text-text-muted">Enter your details to get started</p>
          </div>

          <Card className="p-8 border-border-light shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message as string}
                {...register('name')}
              />

              <Input
                label="Email Address"
                placeholder="name@example.com"
                error={errors.email?.message as string}
                {...register('email')}
              />

              <div className="space-y-2">
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
                {strength && (
                  <div className="px-1 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-text-dim">Strength</span>
                      <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: strength.label === 'Weak' ? '33%' : strength.label === 'Medium' ? '66%' : '100%' }} />
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message as string}
                {...register('confirmPassword')}
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-secondary pl-1">State</label>
                <select
                  {...register('state')}
                  className="w-full rounded-xl border border-border-color bg-bg-card px-4 py-3 text-text-primary focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                >
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="text-xs font-medium text-accent-red pl-1">{errors.state.message as string}</p>}
              </div>

              <Button type="submit" className="w-full py-4 mt-4" isLoading={isLoading}>
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </Card>

          <p className="text-center text-text-muted font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-green hover:text-accent-lime transition-colors font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
