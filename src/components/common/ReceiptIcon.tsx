import React from 'react';
import { Receipt, ReceiptEuro, ReceiptIndianRupee, ReceiptPoundSterling } from 'lucide-react';

interface ReceiptIconProps {
	currency: string;
	size?: number;
	color?: string;
	className?: string;
}

export const ReceiptIcon: React.FC<ReceiptIconProps> = ({ currency, size = 24, color, className }) => {
	const iconProps = {
		size,
		color,
		className,
	};

	switch (currency.toUpperCase()) {
		case 'INR':
			return <ReceiptIndianRupee {...iconProps} />;
		case 'EUR':
			return <ReceiptEuro {...iconProps} />;
		case 'GBP':
			return <ReceiptPoundSterling {...iconProps} />;
		case 'USD':
		default:
			return <Receipt {...iconProps} />;
	}
};
