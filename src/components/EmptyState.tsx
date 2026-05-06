import { Box, Button, Heading, Icon, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import type { ComponentType, ReactNode } from 'react';

interface Props {
  icon?: ComponentType<{ size?: number | string }>;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

export function EmptyState({ icon, title, description, action, children }: Props) {
  const bg = useColorModeValue('gray.50', 'navy.900');
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const iconBg = useColorModeValue('brand.50', 'brand.900');

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderStyle="dashed"
      borderColor={borderColor}
      borderRadius="xl"
      py={{ base: 10, md: 16 }}
      px={6}
      textAlign="center"
    >
      <Stack spacing={4} align="center" maxW="sm" mx="auto">
        {icon && (
          <Box p={3} bg={iconBg} borderRadius="full">
            <Icon as={icon} boxSize={8} color="brand.500" />
          </Box>
        )}
        <Stack spacing={1}>
          <Heading size="md">{title}</Heading>
          <Text color="gray.500" fontSize="sm">
            {description}
          </Text>
        </Stack>
        {action && (
          <Button colorScheme="brand" onClick={action.onClick} minH="44px">
            {action.label}
          </Button>
        )}
        {children}
      </Stack>
    </Box>
  );
}
