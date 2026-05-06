import { HStack, Heading, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: Props) {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      align={{ base: 'stretch', md: 'center' }}
      spacing={{ base: 3, md: 6 }}
      mb={{ base: 4, md: 6 }}
    >
      <Stack spacing={1}>
        <Heading size={{ base: 'md', md: 'lg' }}>{title}</Heading>
        {description && (
          <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
            {description}
          </Text>
        )}
      </Stack>
      {action && <HStack justify={{ base: 'flex-start', md: 'flex-end' }}>{action}</HStack>}
    </Stack>
  );
}
