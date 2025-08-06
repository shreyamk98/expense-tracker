import React from 'react';
import { Modal, Group, Button, Text } from '@mantine/core';
import styled from '@emotion/styled';

const StyledModal = styled(Modal)`
	padding: 0;
	.mantine-Modal-content {
		border-radius: 12px;
		overflow: hidden;
		background: light-dark(var(--mantine-color-white), var(--mantine-color-dark-6));
		border: 1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-4));
		box-shadow: light-dark(0 10px 25px rgba(0, 0, 0, 0.1), 0 10px 25px rgba(0, 0, 0, 0.4));
		display: flex;
		flex-direction: column;
		max-height: 90vh;
	}
	.mantine-Modal-header {
		padding-left: 16px;
		padding-right: 16px;
		border-bottom: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
		background: light-dark(var(--mantine-color-white), var(--mantine-color-dark-6));
		flex-shrink: 0;
	}
	.mantine-Modal-body {
		padding: 0;
		overflow: hidden;
		background: light-dark(var(--mantine-color-white), var(--mantine-color-dark-6));
		border-bottom-left-radius: 12px;
		border-bottom-right-radius: 12px;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}
	.mantine-Modal-overlay {
		background: light-dark(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
		backdrop-filter: blur(3px);
	}
`;

const ModalContent = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	background: light-dark(var(--mantine-color-white), var(--mantine-color-dark-6));
	min-height: 0;
`;

const ModalFooter = styled(Group)`
	padding-top: 16px;
	position: sticky;
	bottom: 0;
	background: light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7));
	border-top: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
	padding-left: 16px;
	padding-right: 16px;
	padding-bottom: 16px;
	border-bottom-left-radius: 12px;
	border-bottom-right-radius: 12px;
`;

interface BaseModalProps {
	opened: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	size?: string;
	children: React.ReactNode;
	primaryAction?: {
		label: string;
		onClick: () => void;
		loading?: boolean;
		disabled?: boolean;
		color?: string;
		leftSection?: React.ReactNode;
	};
	secondaryAction?: {
		label: string;
		onClick: () => void;
		variant?: string;
	};
	centered?: boolean;
	withCloseButton?: boolean;
	footerContent?: React.ReactNode;
}

export const BaseModal: React.FC<BaseModalProps> = ({
	opened,
	onClose,
	title,
	description,
	size = 'md',
	children,
	primaryAction,
	secondaryAction,
	centered = true,
	footerContent,
}) => {
	return (
		<StyledModal
			opened={opened}
			onClose={onClose}
			size={size}
			centered={centered}
			withCloseButton={false}
			lockScroll={true}
			trapFocus={true}
			overlayProps={{
				backgroundOpacity: 0.6,
				blur: 3,
			}}
			transitionProps={{
				transition: 'fade',
				duration: 200,
			}}
			title={
				<>
					<Text fw={500} fz="lg" c="light-dark(var(--mantine-color-dark-9), var(--mantine-color-gray-0))">
						{title}
					</Text>
					{description && (
						<Text c="dimmed" size="sm">
							{description}
						</Text>
					)}
				</>
			}
		>
			<ModalContent>{children}</ModalContent>

			{(primaryAction || secondaryAction || footerContent) && (
				<ModalFooter justify="flex-end" gap="sm">
					{footerContent || (
						<>
							{secondaryAction && (
								<Button variant={secondaryAction.variant || 'subtle'} onClick={secondaryAction.onClick}>
									{secondaryAction.label}
								</Button>
							)}
							{primaryAction && (
								<Button
									onClick={primaryAction.onClick}
									loading={primaryAction.loading}
									disabled={primaryAction.disabled}
									color={primaryAction.color}
									leftSection={primaryAction.leftSection}
								>
									{primaryAction.label}
								</Button>
							)}
						</>
					)}
				</ModalFooter>
			)}
		</StyledModal>
	);
};

// Confirmation Modal Component
interface ConfirmationModalProps {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmColor?: string;
	loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	opened,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	confirmColor = 'red',
	loading = false,
}) => {
	return (
		<BaseModal
			opened={opened}
			onClose={onClose}
			title={title}
			size="sm"
			primaryAction={{
				label: confirmLabel,
				onClick: onConfirm,
				color: confirmColor,
				loading,
			}}
			secondaryAction={{
				label: cancelLabel,
				onClick: onClose,
			}}
		>
			<Text c="light-dark(var(--mantine-color-dark-6), var(--mantine-color-gray-2))">{message}</Text>
		</BaseModal>
	);
};

// Form Modal Component
interface FormModalProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: () => void;
	title: string;
	description?: string;
	size?: string;
	children: React.ReactNode;
	submitLabel?: string;
	cancelLabel?: string;
	loading?: boolean;
	disabled?: boolean;
	submitIcon?: React.ReactNode;
}

export const FormModal: React.FC<FormModalProps> = ({
	opened,
	onClose,
	onSubmit,
	title,
	description,
	size = 'md',
	children,
	submitLabel = 'Save',
	cancelLabel = 'Cancel',
	loading = false,
	disabled = false,
	submitIcon,
}) => {
	return (
		<BaseModal
			opened={opened}
			onClose={onClose}
			title={title}
			description={description}
			size={size}
			primaryAction={{
				label: submitLabel,
				onClick: onSubmit,
				loading,
				disabled,
				leftSection: submitIcon,
			}}
			secondaryAction={{
				label: cancelLabel,
				onClick: onClose,
			}}
		>
			{children}
		</BaseModal>
	);
};