import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { RegisterForm } from '../components/auth/RegisterForm';

export const Register: React.FC = () => {
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Start your journey with our chatbot"
    >
      <RegisterForm />
    </AuthLayout>
  );
};