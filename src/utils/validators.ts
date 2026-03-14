import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    state: z.string().min(1, 'State is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const registerSchema = signupSchema;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const proposalSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  category: z.enum(['Innovation', 'Organic', 'Technology', 'Water']),
  problem: z.string().min(30, 'Problem statement must be at least 30 characters'),
  solution: z.string().min(30, 'Solution must be at least 30 characters'),
  impact: z.string().min(10, 'Expected impact must be at least 10 characters'),
  budget: z.string().min(1, 'Budget is required'),
  contactEmail: z.string().email('Invalid contact email'),
});
