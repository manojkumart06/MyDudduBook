import {
  Box,
  Button,
  Center,
  Container,
  HStack,
  Heading,
  Icon,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Calendar, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import type { ComponentType } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/features/auth/AuthContext';

interface Feature {
  icon: ComponentType<{ size?: number | string }>;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Wallet,
    title: 'Track every loan',
    description:
      "Add customers, record loans, and see what you've lent and what's outstanding at a glance.",
  },
  {
    icon: Calendar,
    title: 'Monthly interest, on time',
    description:
      '12 monthly payments auto-generated when you create a loan. Never miss a due date again.',
  },
  {
    icon: Smartphone,
    title: 'Built for mobile',
    description:
      'One-handed on a phone, polished on tablet and desktop. Fast even on slow connections.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data, locked down',
    description:
      'Email/password sign-in. Strict per-user security rules. Nobody else sees your records.',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const bg = useColorModeValue('gray.50', 'navy.900');
  const surface = useColorModeValue('white', 'navy.800');
  const border = useColorModeValue('gray.200', 'navy.700');
  const mutedText = useColorModeValue('gray.600', 'gray.300');
  const featureIconBg = useColorModeValue('brand.50', 'brand.900');
  const featureIconColor = useColorModeValue('brand.600', 'brand.200');

  if (loading) {
    return (
      <Center minH="100dvh">
        <Spinner color="brand.500" size="lg" thickness="3px" />
      </Center>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <Box minH="100dvh" bg={bg}>
      <Box bg={surface} borderBottomWidth="1px" borderColor={border}>
        <Container maxW="6xl" py={3} px={{ base: 4, md: 6 }}>
          <HStack justify="space-between">
            <Logo size="md" />
            <HStack spacing={2}>
              <Button as={RouterLink} to="/login" variant="ghost" minH="40px">
                Sign in
              </Button>
              <Button as={RouterLink} to="/signup" colorScheme="brand" minH="40px">
                Get started
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="5xl" py={{ base: 16, md: 28 }} px={{ base: 4, md: 6 }} textAlign="center">
        <Stack spacing={{ base: 8, md: 10 }} align="center">
          <Heading
            as="h1"
            size={{ base: 'xl', md: '3xl' }}
            fontWeight="extrabold"
            lineHeight="1.15"
            letterSpacing="-0.02em"
            maxW="4xl"
          >
            MyDudduBook tracks every loan, every payment, and every overdue rupee — so you
            always know who owes you what.
          </Heading>
          <HStack spacing={3} flexWrap="wrap" justify="center">
            <Button
              as={RouterLink}
              to="/signup"
              colorScheme="brand"
              size="lg"
              minH="52px"
              minW="200px"
              fontSize="md"
            >
              Create free account
            </Button>
            <Button
              as={RouterLink}
              to="/login"
              variant="outline"
              size="lg"
              minH="52px"
              minW="140px"
              fontSize="md"
            >
              Sign in
            </Button>
          </HStack>
        </Stack>
      </Container>

      <Container maxW="6xl" py={{ base: 8, md: 16 }} px={{ base: 4, md: 6 }}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
          {FEATURES.map((f) => (
            <Box
              key={f.title}
              bg={surface}
              borderWidth="1px"
              borderColor={border}
              borderRadius="xl"
              p={{ base: 5, md: 6 }}
            >
              <Stack spacing={3}>
                <Center
                  bg={featureIconBg}
                  color={featureIconColor}
                  w={10}
                  h={10}
                  borderRadius="md"
                >
                  <Icon as={f.icon} boxSize={5} />
                </Center>
                <Heading size="sm">{f.title}</Heading>
                <Text fontSize="sm" color={mutedText}>
                  {f.description}
                </Text>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      <Container maxW="4xl" py={{ base: 8, md: 16 }} px={{ base: 4, md: 6 }} textAlign="center">
        <Stack spacing={4} align="center">
          <Heading size={{ base: 'lg', md: 'xl' }}>Ready to track smarter?</Heading>
          <Text color={mutedText}>Free to use. Setup in under a minute.</Text>
          <Button
            as={RouterLink}
            to="/signup"
            colorScheme="brand"
            size="lg"
            minH="48px"
            minW="200px"
          >
            Get started — it's free
          </Button>
        </Stack>
      </Container>

      <Box borderTopWidth="1px" borderColor={border} py={6} bg={surface}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            spacing={3}
          >
            <Logo size="sm" />
            <Text fontSize="xs" color={mutedText}>
              © {new Date().getFullYear()} MyDudduBook. Lend smart. Track easy.
            </Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
