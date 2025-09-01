import React, { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Checkbox,
  Text,
  Anchor,
  Alert,
  Group
} from '@mantine/core';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SignInFormData } from '../../types/schema';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSwitchToSignUp }) => {
  const { signIn, isLoading, authState } = useAuth();
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await signIn(formData);
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleInputChange = (field: keyof SignInFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {authState.error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {authState.error}
          </Alert>
        )}

        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          leftSection={<Mail size={16} />}
          error={errors.email}
          required
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          leftSection={<Lock size={16} />}
          error={errors.password}
          required
        />

        <Group justify="space-between">
          <Checkbox
            label="Remember me"
            checked={formData.rememberMe}
            onChange={(e) => handleInputChange('rememberMe', e.currentTarget.checked)}
          />
          <Anchor size="sm" c="dimmed">
            Forgot password?
          </Anchor>
        </Group>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          size="md"
        >
          Sign In
        </Button>

        <Text ta="center" size="sm" c="dimmed">
          Don't have an account?{' '}
          <Anchor onClick={onSwitchToSignUp} style={{ cursor: 'pointer' }}>
            Sign up here
          </Anchor>
        </Text>

        <Text ta="center" size="xs" c="dimmed" mt="md">
          Create an account or sign in with any email/password
        </Text>
      </Stack>
    </form>
  );
};