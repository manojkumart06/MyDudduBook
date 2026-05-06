import {
  Box,
  Button,
  HStack,
  Icon,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { LayoutDashboard, LogOut, Receipt, Settings, Users, Wallet } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { ComponentType } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Logo } from './Logo';

const NAV: { to: string; label: string; icon: ComponentType<{ size?: number | string }> }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/loans', label: 'Loans', icon: Wallet },
  { to: '/payments', label: 'Payments', icon: Receipt },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { signOut, user } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.700', 'brand.100');
  const inactiveColor = useColorModeValue('navy.700', 'gray.300');
  const hoverBg = useColorModeValue('gray.100', 'navy.700');
  const dividerColor = useColorModeValue('gray.200', 'navy.700');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      toast({ status: 'error', title: 'Could not sign out' });
    }
  };

  return (
    <Stack h="full" justify="space-between" p={4} spacing={4}>
      <Stack spacing={4}>
        <Box>
          <Logo size="lg" />
        </Box>

        <Stack spacing={1}>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onNavigate}>
              {({ isActive }) => (
                <HStack
                  bg={isActive ? activeBg : 'transparent'}
                  color={isActive ? activeColor : inactiveColor}
                  px={3}
                  py={2.5}
                  borderRadius="md"
                  spacing={3}
                  minH="44px"
                  transition="background 0.15s ease"
                  _hover={{ bg: isActive ? activeBg : hoverBg }}
                >
                  <Icon as={item.icon} boxSize={5} />
                  <Text fontWeight={isActive ? 'semibold' : 'medium'} fontSize="sm">
                    {item.label}
                  </Text>
                </HStack>
              )}
            </NavLink>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={2} pt={3} borderTopWidth="1px" borderColor={dividerColor}>
        <Button
          leftIcon={<Icon as={colorMode === 'light' ? MoonIcon : SunIcon} boxSize={4} />}
          variant="ghost"
          justifyContent="flex-start"
          onClick={toggleColorMode}
          minH="44px"
          aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {colorMode === 'light' ? 'Dark mode' : 'Light mode'}
        </Button>

        {user?.email && (
          <Text fontSize="xs" color="gray.500" noOfLines={1} px={3}>
            {user.email}
          </Text>
        )}

        <Button
          leftIcon={<Icon as={LogOut} boxSize={4} />}
          variant="ghost"
          justifyContent="flex-start"
          onClick={handleSignOut}
          minH="44px"
        >
          Sign out
        </Button>
      </Stack>
    </Stack>
  );
}
