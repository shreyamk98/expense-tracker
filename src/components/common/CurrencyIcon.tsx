import React from 'react';
import { DollarSign, IndianRupee, Euro, PoundSterling } from 'lucide-react';

interface CurrencyIconProps {
  currency: string;
  size?: number;
  color?: string;
  className?: string;
}

export const CurrencyIcon: React.FC<CurrencyIconProps> = ({ 
  currency, 
  size = 24, 
  color, 
  className 
}) => {
  const iconProps = {
    size,
    color,
    className
  };

  switch (currency.toUpperCase()) {
    case 'INR':
      return <IndianRupee {...iconProps} />;
    case 'EUR':
      return <Euro {...iconProps} />;
    case 'GBP':
      return <PoundSterling {...iconProps} />;
    case 'USD':
    default:
      return <DollarSign {...iconProps} />;
  }
};