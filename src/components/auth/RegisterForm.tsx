import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, RefreshCw } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/authService';
import type { RegisterCredentials } from '../../types';

export const RegisterForm: React.FC = () => {
  const register = useAuthStore((state) => state.register);

  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const [formData, setFormData] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'other',
  });

  const [errors, setErrors] = useState<Partial<RegisterCredentials>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterCredentials]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<RegisterCredentials> = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, _ and -';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await register(formData.username, formData.email, formData.password, formData.gender);
      setRegisteredEmail(formData.email);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed';
      toast.error(errorMessage);
      
      // Set specific field error if backend returns field-specific error
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.toLowerCase().includes('username')) {
        setErrors({ username: errorMessage });
      } else {
        setErrors({ email: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      await authService.resendVerification(registeredEmail);
      toast.success('Verification email resent!');
    } catch {
      toast.error('Failed to resend. Try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Check your email</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          We sent a verification link to
        </p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-6">{registeredEmail}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Click the link in the email to activate your account. The link expires in 24 hours.
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Sending…' : 'Resend email'}
        </button>
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <Link to="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Username"
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Choose a username"
        error={errors.username}
        required
      />

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
        placeholder="Create a password"
        error={errors.password}
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm your password"
        error={errors.confirmPassword}
        required
      />

      {/* Gender */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
        <div className="flex gap-2">
          {[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Prefer not to say' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, gender: opt.value }))}
              className={`flex-1 py-2 px-2 text-xs rounded-lg border-2 transition-colors ${
                formData.gender === opt.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Used to pick your avatar style.</p>
      </div>

      <div className="mb-6">
        <label className="flex items-start">
          <input 
            type="checkbox" 
            required 
            className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
          />
          <span className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Create Account
      </Button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};