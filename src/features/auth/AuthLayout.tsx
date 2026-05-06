import { Box, Container, Heading, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { Logo } from '@/components/Logo';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const pageBg = useColorModeValue('gray.50', 'navy.900');

  return (
    <Box minH="100dvh" bg={pageBg} py={{ base: 6, md: 16 }}>
      <Container maxW="md" px={{ base: 4, md: 6 }}>
        <Stack spacing={8}>
          <Stack spacing={3} align="center">
            <Logo size="lg" showTagline align="center" />
          </Stack>

          <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
            boxShadow="sm"
            p={{ base: 5, md: 8 }}
          >
            <Stack spacing={6}>
              <Stack spacing={1}>
                <Heading size="md">{title}</Heading>
                <Text color="gray.500" fontSize="sm">
                  {subtitle}
                </Text>
              </Stack>
              {children}
            </Stack>
          </Box>

          {footer && (
            <Text textAlign="center" fontSize="sm" color="gray.500">
              {footer}
            </Text>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
