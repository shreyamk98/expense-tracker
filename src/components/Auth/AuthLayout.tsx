import React, { useState } from 'react';
import { Paper, Container, Title, Text, Tabs, Stack, Center, Box } from '@mantine/core';
import { LogIn, UserPlus } from 'lucide-react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

export const AuthLayout: React.FC = () => {
	const [activeTab, setActiveTab] = useState('signin');

	return (
		<Container size="sm" py="xl">
			<Center>
				<Box w="100%" maw={400}>
					<Paper p="xl" radius="md" withBorder>
						<Stack gap="lg">
							<div>
								<Title ta="center" order={2}>
									Welcome to Expense Tracker
								</Title>
								<Text ta="center" c="dimmed" size="sm" mt="xs">
									Manage your expenses with ease
								</Text>
							</div>

							<Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'signin')}>
								<Tabs.List grow>
									<Tabs.Tab value="signin" leftSection={<LogIn size={16} />}>
										Sign In
									</Tabs.Tab>
									<Tabs.Tab value="signup" leftSection={<UserPlus size={16} />}>
										Sign Up
									</Tabs.Tab>
								</Tabs.List>

								<Tabs.Panel value="signin" pt="md">
									<SignInForm onSwitchToSignUp={() => setActiveTab('signup')} />
								</Tabs.Panel>

								<Tabs.Panel value="signup" pt="md">
									<SignUpForm onSwitchToSignIn={() => setActiveTab('signin')} />
								</Tabs.Panel>
							</Tabs>
						</Stack>
					</Paper>
				</Box>
			</Center>
		</Container>
	);
};
