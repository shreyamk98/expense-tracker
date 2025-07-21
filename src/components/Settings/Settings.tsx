import React, { useState } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Switch,
  Button,
  Modal,
  TextInput,
  Select,
  NumberInput,
  ActionIcon,
  Badge,
  Divider
} from '@mantine/core';
import { Plus, Edit, Trash2, CreditCard, Smartphone } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentMethodFormProps } from '../../types/schema';
import { UPIApp, CardType, ExpenseCategory, PaymentType, NotificationPreference, TimePeriod } from '../../types/enums';
import { formatCategory } from '../../utils/formatters';

export const Settings: React.FC = () => {
  const { state, updateSettings, addCard, updateCard, deleteCard, addUPIApp, updateUPIApp, deleteUPIApp, getCurrentCurrency, isDarkMode } = useAppContext();
  const { authState, updateProfile } = useAuth();
  const { settings, paymentMethods } = state;
  const currentUser = authState.currentUser;

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [editingUPI, setEditingUPI] = useState<any>(null);

  const handleDarkModeToggle = async (checked: boolean) => {
    // Update both contexts
    updateSettings({ darkMode: checked });
    
    if (currentUser) {
      await updateProfile({
        preferences: {
          ...currentUser.preferences,
          darkMode: checked
        }
      });
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    // Update both contexts
    updateSettings({ currency });
    
    if (currentUser) {
      await updateProfile({
        preferences: {
          ...currentUser.preferences,
          currency
        }
      });
    }
  };

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setCardModalOpen(true);
  };

  const handleEditUPI = (upi: any) => {
    setEditingUPI(upi);
    setUpiModalOpen(true);
  };

  const handleDeleteCard = (id: string) => {
    deleteCard(id);
  };

  const handleDeleteUPI = (id: string) => {
    deleteUPIApp(id);
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <div>
        <Text size="xl" fw={600}>Settings</Text>
        <Text size="sm" c="dimmed">Manage your app preferences and payment methods</Text>
      </div>

      {/* General Settings */}
      <Card p="md" withBorder>
        <Text fw={500} mb="md">General Settings</Text>
        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Text fw={500}>Dark Mode</Text>
              <Text size="sm" c="dimmed">Switch between light and dark themes</Text>
            </div>
            <Switch
              checked={isDarkMode()}
              onChange={(event) => handleDarkModeToggle(event.currentTarget.checked)}
            />
          </Group>

          <Group justify="space-between">
            <div>
              <Text fw={500}>Currency</Text>
              <Text size="sm" c="dimmed">Default currency for expenses</Text>
            </div>
            <Select
              data={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'INR', label: 'INR (₹)' }
              ]}
              value={getCurrentCurrency()}
              onChange={(value) => handleCurrencyChange(value || 'USD')}
              w={120}
            />
          </Group>
        </Stack>
      </Card>

      {/* Payment Methods */}
      <Card p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={500}>Payment Methods</Text>
          <Group gap="xs">
            <Button
              size="xs"
              leftSection={<Plus size={14} />}
              onClick={() => {
                setEditingCard(null);
                setCardModalOpen(true);
              }}
            >
              Add Card
            </Button>
            <Button
              size="xs"
              variant="light"
              leftSection={<Plus size={14} />}
              onClick={() => {
                setEditingUPI(null);
                setUpiModalOpen(true);
              }}
            >
              Add UPI App
            </Button>
          </Group>
        </Group>

        <Stack gap="md">
          {/* Cards */}
          <div>
            <Text size="sm" fw={500} mb="xs">Cards</Text>
            <Stack gap="xs">
              {paymentMethods.cards.map((card) => (
                <Group key={card.id} justify="space-between" p="sm" style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}>
                  <Group gap="sm">
                    <ActionIcon variant="light" color="blue" size="sm">
                      <CreditCard size={16} />
                    </ActionIcon>
                    <div>
                      <Text size="sm" fw={500}>{card.name}</Text>
                      <Group gap="xs">
                        <Badge variant="light" size="xs">
                          {card.type.toUpperCase()}
                        </Badge>
                        <Text size="xs" c="dimmed">**** {card.lastFourDigits}</Text>
                        {card.isDefault && (
                          <Badge color="green" size="xs">Default</Badge>
                        )}
                      </Group>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="yellow"
                      size="sm"
                      onClick={() => handleEditCard(card)}
                    >
                      <Edit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
              {paymentMethods.cards.length === 0 && (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No cards added yet
                </Text>
              )}
            </Stack>
          </div>

          <Divider />

          {/* UPI Apps */}
          <div>
            <Text size="sm" fw={500} mb="xs">UPI Apps</Text>
            <Stack gap="xs">
              {paymentMethods.upiApps.map((upi) => (
                <Group key={upi.id} justify="space-between" p="sm" style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}>
                  <Group gap="sm">
                    <ActionIcon variant="light" color="purple" size="sm">
                      <Smartphone size={16} />
                    </ActionIcon>
                    <div>
                      <Text size="sm" fw={500}>{upi.app.toUpperCase()}</Text>
                      <Badge variant="light" size="xs" color={upi.isEnabled ? 'green' : 'gray'}>
                        {upi.isEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="yellow"
                      size="sm"
                      onClick={() => handleEditUPI(upi)}
                    >
                      <Edit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      onClick={() => handleDeleteUPI(upi.id)}
                    >
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
              {paymentMethods.upiApps.length === 0 && (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No UPI apps added yet
                </Text>
              )}
            </Stack>
          </div>
        </Stack>
      </Card>

      {/* Default Categories */}
      <Card p="md" withBorder>
        <Text fw={500} mb="md">Default Categories</Text>
        <Group gap="xs">
          {settings.defaultCategories.map((category) => (
            <Badge key={category} variant="light">
              {formatCategory(category)}
            </Badge>
          ))}
        </Group>
      </Card>

      {/* Card Modal */}
      <CardModal
        isOpen={cardModalOpen}
        onClose={() => {
          setCardModalOpen(false);
          setEditingCard(null);
        }}
        onSubmit={(cardData) => {
          if (editingCard) {
            updateCard(editingCard.id, cardData);
          } else {
            addCard(cardData);
          }
          setCardModalOpen(false);
          setEditingCard(null);
        }}
        editingCard={editingCard}
      />

      {/* UPI Modal */}
      <UPIModal
        isOpen={upiModalOpen}
        onClose={() => {
          setUpiModalOpen(false);
          setEditingUPI(null);
        }}
        onSubmit={(upiData) => {
          if (editingUPI) {
            updateUPIApp(editingUPI.id, upiData);
          } else {
            addUPIApp(upiData);
          }
          setUpiModalOpen(false);
          setEditingUPI(null);
        }}
        editingUPI={editingUPI}
      />
    </Stack>
  );
};

// Card Modal Component
interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: any) => void;
  editingCard?: any;
}

const CardModal: React.FC<CardModalProps> = ({ isOpen, onClose, onSubmit, editingCard }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: CardType.CREDIT,
    lastFourDigits: '',
    isDefault: false
  });

  React.useEffect(() => {
    if (editingCard) {
      setFormData(editingCard);
    } else {
      setFormData({
        name: '',
        type: CardType.CREDIT,
        lastFourDigits: '',
        isDefault: false
      });
    }
  }, [editingCard, isOpen]);

  const handleSubmit = () => {
    if (formData.name && formData.lastFourDigits.length === 4) {
      onSubmit(formData);
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title={editingCard ? "Edit Card" : "Add Card"}>
      <Stack gap="md">
        <TextInput
          label="Card Name"
          placeholder="e.g., HDFC Credit Card"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />

        <Select
          label="Card Type"
          data={[
            { value: CardType.CREDIT, label: 'Credit Card' },
            { value: CardType.DEBIT, label: 'Debit Card' }
          ]}
          value={formData.type}
          onChange={(value) => setFormData(prev => ({ ...prev, type: value as CardType || CardType.CREDIT }))}
          required
        />

        <TextInput
          label="Last 4 Digits"
          placeholder="1234"
          maxLength={4}
          value={formData.lastFourDigits}
          onChange={(e) => setFormData(prev => ({ ...prev, lastFourDigits: e.target.value }))}
          required
        />

        <Switch
          label="Set as default card"
          checked={formData.isDefault}
          onChange={(event) => setFormData(prev => ({ ...prev, isDefault: event.currentTarget.checked }))}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {editingCard ? "Update" : "Add"} Card
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

// UPI Modal Component
interface UPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (upi: any) => void;
  editingUPI?: any;
}

const UPIModal: React.FC<UPIModalProps> = ({ isOpen, onClose, onSubmit, editingUPI }) => {
  const [formData, setFormData] = useState({
    app: UPIApp.GPAY,
    isEnabled: true
  });

  React.useEffect(() => {
    if (editingUPI) {
      setFormData(editingUPI);
    } else {
      setFormData({
        app: UPIApp.GPAY,
        isEnabled: true
      });
    }
  }, [editingUPI, isOpen]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const upiOptions = [
    { value: UPIApp.GPAY, label: 'Google Pay' },
    { value: UPIApp.PHONEPE, label: 'PhonePe' },
    { value: UPIApp.PAYTM, label: 'Paytm' },
    { value: UPIApp.AMAZON_PAY, label: 'Amazon Pay' },
    { value: UPIApp.BHIM, label: 'BHIM' },
    { value: UPIApp.OTHER, label: 'Other' }
  ];

  return (
    <Modal opened={isOpen} onClose={onClose} title={editingUPI ? "Edit UPI App" : "Add UPI App"}>
      <Stack gap="md">
        <Select
          label="UPI App"
          data={upiOptions}
          value={formData.app}
          onChange={(value) => setFormData(prev => ({ ...prev, app: value as UPIApp || UPIApp.GPAY }))}
          required
        />

        <Switch
          label="Enable this UPI app"
          checked={formData.isEnabled}
          onChange={(event) => setFormData(prev => ({ ...prev, isEnabled: event.currentTarget.checked }))}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {editingUPI ? "Update" : "Add"} UPI App
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};