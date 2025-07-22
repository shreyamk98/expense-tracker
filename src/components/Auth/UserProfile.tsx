import React, { useState } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Avatar,
  Button,
  TextInput,
  Select,
  Switch,
  FileButton,
  ActionIcon,
  Badge,
  Divider
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Edit, Camera, LogOut, Trash2, Save, X } from 'lucide-react';
import { ConfirmationModal } from '../common/BaseModal';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types/schema';
import { TimePeriod, NotificationPreference } from '../../types/enums';
import { formatUserInitials, formatNotificationPreference } from '../../utils/formatters';

export const UserProfile: React.FC = () => {
  const { authState, updateProfile, signOut } = useAuth();
  const { updateSettings, getCurrentCurrency, isDarkMode } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: authState.currentUser?.firstName || '',
    lastName: authState.currentUser?.lastName || '',
    email: authState.currentUser?.email || '',
    phoneNumber: authState.currentUser?.phoneNumber || '',
    dateOfBirth: authState.currentUser?.dateOfBirth || '',
    preferences: authState.currentUser?.preferences || {
      currency: 'USD',
      defaultBudgetPeriod: TimePeriod.MONTH,
      notifications: NotificationPreference.IMPORTANT,
      darkMode: false,
      language: 'en'
    }
  });

  if (!authState.currentUser) return null;

  const handleSave = async () => {
    try {
      const updateData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`,
        ...(profilePicture && { profilePicture: URL.createObjectURL(profilePicture) })
      };
      
      await updateProfile(updateData);
      
      // Update app settings after profile update to avoid context issues
      setTimeout(() => {
        if (formData.preferences) {
          updateSettings({
            darkMode: formData.preferences.darkMode,
            currency: formData.preferences.currency
          });
        }
      }, 0);
      
      setIsEditing(false);
      setProfilePicture(null);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: authState.currentUser?.firstName || '',
      lastName: authState.currentUser?.lastName || '',
      email: authState.currentUser?.email || '',
      phoneNumber: authState.currentUser?.phoneNumber || '',
      dateOfBirth: authState.currentUser?.dateOfBirth || '',
      preferences: authState.currentUser?.preferences || {
        currency: 'USD',
        defaultBudgetPeriod: TimePeriod.MONTH,
        notifications: NotificationPreference.IMPORTANT,
        darkMode: false,
        language: 'en'
      }
    });
    setIsEditing(false);
    setProfilePicture(null);
  };

  const handleLogout = async () => {
    await signOut();
    setLogoutModalOpen(false);
  };

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'INR', label: 'INR (₹)' }
  ];

  const budgetPeriodOptions = [
    { value: TimePeriod.WEEK, label: 'Weekly' },
    { value: TimePeriod.MONTH, label: 'Monthly' },
    { value: TimePeriod.YEAR, label: 'Yearly' }
  ];

  const notificationOptions = [
    { value: NotificationPreference.ALL, label: 'All Notifications' },
    { value: NotificationPreference.IMPORTANT, label: 'Important Only' },
    { value: NotificationPreference.NONE, label: 'No Notifications' }
  ];

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={600}>My Profile</Text>
          <Text size="sm" c="dimmed">Manage your account information and preferences</Text>
        </div>
        <Group gap="sm">
          {isEditing ? (
            <>
              <Button variant="subtle" leftSection={<X size={16} />} onClick={handleCancel}>
                Cancel
              </Button>
              <Button leftSection={<Save size={16} />} onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="light" leftSection={<Edit size={16} />} onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
              <Button variant="subtle" color="red" leftSection={<LogOut size={16} />} onClick={() => setLogoutModalOpen(true)}>
                Logout
              </Button>
            </>
          )}
        </Group>
      </Group>

      {/* Profile Information */}
      <Card p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={500}>Profile Information</Text>
            <Badge variant="light" color="green">
              {authState.currentUser.isEmailVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </Group>

          <Group align="flex-start">
            <div style={{ position: 'relative' }}>
              <Avatar
                src={profilePicture ? URL.createObjectURL(profilePicture) : authState.currentUser.profilePicture}
                size={80}
                radius="md"
              >
                {formatUserInitials(authState.currentUser.firstName, authState.currentUser.lastName)}
              </Avatar>
              {isEditing && (
                <FileButton onChange={setProfilePicture} accept="image/*">
                  {(props) => (
                    <ActionIcon
                      {...props}
                      variant="filled"
                      size="sm"
                      radius="xl"
                      style={{
                        position: 'absolute',
                        bottom: -5,
                        right: -5
                      }}
                    >
                      <Camera size={12} />
                    </ActionIcon>
                  )}
                </FileButton>
              )}
            </div>

            <Stack gap="sm" style={{ flex: 1 }}>
              {isEditing ? (
                <Group grow>
                  <TextInput
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                  <TextInput
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </Group>
              ) : (
                <div>
                  <Text fw={500} size="lg">{authState.currentUser.fullName}</Text>
                  <Text c="dimmed" size="sm">{authState.currentUser.email}</Text>
                </div>
              )}

              {isEditing ? (
                <TextInput
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled
                />
              ) : null}

              {isEditing ? (
                <Group grow>
                  <TextInput
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+1-555-0123"
                  />
                  <DateInput
                    label="Date of Birth"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                    onChange={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date?.toISOString().split('T')[0] }))}
                    placeholder="Select date"
                  />
                </Group>
              ) : (
                <Group>
                  {authState.currentUser.phoneNumber && (
                    <Text size="sm" c="dimmed">📞 {authState.currentUser.phoneNumber}</Text>
                  )}
                  {authState.currentUser.dateOfBirth && (
                    <Text size="sm" c="dimmed">🎂 {new Date(authState.currentUser.dateOfBirth).toLocaleDateString()}</Text>
                  )}
                </Group>
              )}
            </Stack>
          </Group>
        </Stack>
      </Card>

      {/* Preferences */}
      <Card p="md" withBorder>
        <Text fw={500} mb="md">Preferences</Text>
        <Stack gap="md">
          {isEditing ? (
            <>
              <Group grow>
                <Select
                  label="Currency"
                  data={currencyOptions}
                  value={formData.preferences?.currency}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences!, currency: value || 'USD' }
                  }))}
                />
                <Select
                  label="Default Budget Period"
                  data={budgetPeriodOptions}
                  value={formData.preferences?.defaultBudgetPeriod}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences!, defaultBudgetPeriod: value as TimePeriod || TimePeriod.MONTH }
                  }))}
                />
              </Group>

              <Select
                label="Notification Preferences"
                data={notificationOptions}
                value={formData.preferences?.notifications}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences!, notifications: value as NotificationPreference || NotificationPreference.IMPORTANT }
                }))}
              />

              <Switch
                label="Dark Mode"
                checked={formData.preferences?.darkMode}
                onChange={(event) => {
                  const newDarkMode = event.currentTarget.checked;
                  setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences!, darkMode: newDarkMode }
                  }));
                  
                  // Immediately update settings for instant theme change
                  updateSettings({
                    darkMode: newDarkMode,
                    currency: formData.preferences?.currency || 'USD'
                  });
                }}
              />
            </>
          ) : (
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Currency</Text>
                <Text size="sm" fw={500}>{getCurrentCurrency()}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Default Budget Period</Text>
                <Text size="sm" fw={500}>{authState.currentUser.preferences.defaultBudgetPeriod}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Notifications</Text>
                <Text size="sm" fw={500}>{formatNotificationPreference(authState.currentUser.preferences.notifications)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Dark Mode</Text>
                <Text size="sm" fw={500}>{isDarkMode() ? 'Enabled' : 'Disabled'}</Text>
              </Group>
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Account Actions */}
      {!isEditing && (
        <Card p="md" withBorder>
          <Text fw={500} mb="md">Account Actions</Text>
          <Stack gap="sm">
            <Button variant="light" fullWidth>
              Change Password
            </Button>
            <Button variant="light" color="orange" fullWidth>
              Download My Data
            </Button>
            <Divider />
            <Button variant="light" color="red" fullWidth leftSection={<Trash2 size={16} />}>
              Delete Account
            </Button>
          </Stack>
        </Card>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        opened={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmLabel="Logout"
        confirmColor="red"
      />
    </Stack>
  );
};