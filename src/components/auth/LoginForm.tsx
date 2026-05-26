import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuthStore } from '../../store/authStore';
import type { LoginCredentials } from '../../types';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Login successful! Welcome back.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
      setErrors({ email: ' ', password: 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        error={errors.email}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        error={errors.password}
        required
      />

      <div className="flex items-center justify-between mb-6">
        <label className="flex items-center">
          <input 
            type="checkbox" 
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
          Forgot password?
        </a>
      </div>

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Sign In
      </Button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          {googleLoading ? (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded text-sm text-gray-600 bg-white">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Signing in with Google…
            </div>
          ) : (
            <GoogleLogin
              onSuccess={async (response) => {
                if (!response.credential) return;
                setGoogleLoading(true);
                try {
                  await loginWithGoogle(response.credential);
                  toast.success('Welcome!');
                  navigate('/dashboard');
                } catch (error: any) {
                  toast.error(error.message || 'Google login failed');
                  setGoogleLoading(false);
                }
              }}
              onError={() => toast.error('Google login failed')}
              width="100%"
              text="continue_with"
              shape="rectangular"
            />
          )}
        </div>
      </div>
    </form>
  );
};