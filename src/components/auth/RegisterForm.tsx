import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuthStore } from '../../store/authStore';
import type { RegisterCredentials } from '../../types';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const [formData, setFormData] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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
      await register(formData.username, formData.email, formData.password);
      navigate('/login');
    } catch (error) {
      setErrors({ email: 'Registration failed. Email may already exist.' });
    } finally {
      setLoading(false);
    }
  };

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

      <div className="mb-6">
        <label className="flex items-start">
          <input type="checkbox" required className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
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