import { Box, HStack, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { LayoutDashboard, Receipt, Settings, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { ComponentType } from 'react';

const TABS: { to: string; label: string; icon: ComponentType<{ size?: number | string }>; end?: boolean }[] = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/payments', label: 'Payments', icon: Receipt },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function BottomTabBar() {
  const bg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      as="nav"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bg}
      borderTopWidth="1px"
      borderColor={borderColor}
      zIndex={5}
      pb="env(safe-area-inset-bottom)"
    >
      <HStack justify="space-around" align="stretch" spacing={0}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            style={{ flex: 1, display: 'block' }}
          >
            {({ isActive }) => (
              <Box
                py={2}
                textAlign="center"
                minH="56px"
                color={isActive ? activeColor : inactiveColor}
              >
                <Icon as={tab.icon} boxSize={5} />
                <Text fontSize="xs" mt={0.5} fontWeight={isActive ? 'semibold' : 'medium'}>
                  {tab.label}
                </Text>
              </Box>
            )}
          </NavLink>
        ))}
      </HStack>
    </Box>
  );
}
