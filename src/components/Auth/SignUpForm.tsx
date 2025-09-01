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
  Progress,
  Group
} from '@mantine/core';
import { Mail, Lock, User, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SignUpFormData } from '../../types/schema';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToSignIn }) => {
  const { signUp, isLoading, authState } = useAuth();
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name must contain only letters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name must contain only letters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 30) return 'red';
    if (strength < 60) return 'yellow';
    if (strength < 90) return 'blue';
    return 'green';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await signUp(formData);
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleInputChange = (field: keyof SignUpFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {authState.error && (
          <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
            {authState.error}
          </Alert>
        )}

        <Group grow>
          <TextInput
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            leftSection={<User size={16} />}
            error={errors.firstName}
            required
          />

          <TextInput
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            leftSection={<User size={16} />}
            error={errors.lastName}
            required
          />
        </Group>

        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          leftSection={<Mail size={16} />}
          error={errors.email}
          required
        />

        <div>
          <PasswordInput
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            leftSection={<Lock size={16} />}
            error={errors.password}
            required
          />
          {formData.password && (
            <div>
              <Progress
                value={passwordStrength}
                color={getPasswordStrengthColor(passwordStrength)}
                size="xs"
                mt="xs"
              />
              <Text size="xs" c="dimmed" mt="xs">
                Password strength: {passwordStrength < 30 ? 'Weak' : passwordStrength < 60 ? 'Fair' : passwordStrength < 90 ? 'Good' : 'Strong'}
              </Text>
            </div>
          )}
        </div>

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          leftSection={<Check size={16} />}
          error={errors.confirmPassword}
          required
        />

        <Checkbox
          label={
            <Text size="sm">
              I agree to the{' '}
              <Anchor size="sm">Terms and Conditions</Anchor>
              {' '}and{' '}
              <Anchor size="sm">Privacy Policy</Anchor>
            </Text>
          }
          checked={formData.agreeToTerms}
          onChange={(e) => handleInputChange('agreeToTerms', e.currentTarget.checked)}
          error={errors.agreeToTerms}
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          size="md"
        >
          Create Account
        </Button>

        <Text ta="center" size="sm" c="dimmed">
          Already have an account?{' '}
          <Anchor onClick={onSwitchToSignIn} style={{ cursor: 'pointer' }}>
            Sign in here
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
};