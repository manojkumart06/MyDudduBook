import { Box, HStack, Skeleton, Stat, StatLabel, StatNumber, Text, useColorModeValue } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  isLoading?: boolean;
}

const TONE_TO_COLOR: Record<NonNullable<Props['tone']>, string> = {
  default: 'brand',
  success: 'green',
  warning: 'orange',
  danger: 'red',
};

export function StatCard({ label, value, helper, icon, tone = 'default', isLoading }: Props) {
  const color = TONE_TO_COLOR[tone];
  const bg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const iconBg = useColorModeValue(`${color}.50`, `${color}.900`);
  const iconColor = useColorModeValue(`${color}.600`, `${color}.200`);

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={{ base: 4, md: 5 }}
      minH="120px"
      transition="box-shadow 0.15s ease"
      _hover={{ boxShadow: 'sm' }}
    >
      <HStack justify="space-between" align="start" spacing={3}>
        <Stat>
          <StatLabel fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" noOfLines={1}>
            {label}
          </StatLabel>
          {isLoading ? (
            <Skeleton height="28px" mt={2} />
          ) : (
            <StatNumber
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              sx={{ fontVariantNumeric: 'tabular-nums' }}
              noOfLines={1}
            >
              {value}
            </StatNumber>
          )}
          {helper && !isLoading && (
            <Text fontSize="xs" color="gray.500" mt={1} noOfLines={1}>
              {helper}
            </Text>
          )}
        </Stat>
        {icon && (
          <Box bg={iconBg} color={iconColor} p={2} borderRadius="lg" fontSize="xl">
            {icon}
          </Box>
        )}
      </HStack>
    </Box>
  );
}
