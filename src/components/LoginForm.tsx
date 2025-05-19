import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check
    const now = Date.now();
    if (loginAttempts >= 5 && now - lastAttemptTime < 300000) { // 5 minutes
      toast.error('Too many login attempts. Please try again later.');
      return;
    }

    // Input validation
    const sanitizedEmail = DOMPurify.sanitize(email.trim());
    const sanitizedPassword = DOMPurify.sanitize(password);

    if (!sanitizedEmail || !sanitizedPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const success = await login(sanitizedEmail, sanitizedPassword);
      
      if (success) {
        setLoginAttempts(0);
        navigate('/');
      } else {
        setLoginAttempts(prev => prev + 1);
        setLastAttemptTime(now);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto p-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          className="w-full"
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      {loginAttempts > 0 && (
        <p className="text-sm text-red-500 text-center">
          {loginAttempts} failed attempt{loginAttempts !== 1 ? 's' : ''}
        </p>
      )}
    </form>
  );
};

export default LoginForm;
