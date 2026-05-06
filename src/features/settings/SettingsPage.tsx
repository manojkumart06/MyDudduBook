import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/features/auth/AuthContext';
import { getCurrency, setCurrency, type SupportedCurrency } from '@/lib/formatters';

export default function SettingsPage() {
  const { colorMode, setColorMode } = useColorMode();
  const { user, signOut } = useAuth();
  const toast = useToast();
  const [currency, setCurrencyState] = useState<SupportedCurrency>(getCurrency());

  const bg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'navy.700');

  const handleCurrency = (value: SupportedCurrency) => {
    setCurrency(value);
    setCurrencyState(value);
    toast({ status: 'success', title: 'Currency updated', description: 'Reload to apply everywhere.' });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      toast({ status: 'error', title: 'Could not sign out' });
    }
  };

  return (
    <Box>
      <PageHeader title="Settings" description="Manage display preferences and your account" />

      <Stack spacing={4} maxW="lg">
        <Box bg={bg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={5}>
          <Stack spacing={4}>
            <Text fontWeight="semibold">Appearance</Text>
            <FormControl>
              <FormLabel fontSize="sm">Theme</FormLabel>
              <RadioGroup value={colorMode} onChange={(v) => setColorMode(v)}>
                <HStack spacing={4}>
                  <Radio value="light">Light</Radio>
                  <Radio value="dark">Dark</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
          </Stack>
        </Box>

        <Box bg={bg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={5}>
          <Stack spacing={4}>
            <Text fontWeight="semibold">Currency</Text>
            <FormControl>
              <FormLabel fontSize="sm">Display currency</FormLabel>
              <Select
                value={currency}
                onChange={(e) => handleCurrency(e.target.value as SupportedCurrency)}
                maxW="240px"
              >
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (British Pound)</option>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <Box bg={bg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={5}>
          <Stack spacing={3}>
            <Text fontWeight="semibold">Account</Text>
            <Text fontSize="sm" color="gray.500">
              Signed in as {user?.email ?? '—'}
            </Text>
            <Button onClick={handleSignOut} colorScheme="red" variant="outline" minH="44px" alignSelf="flex-start">
              Sign out
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
