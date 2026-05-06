import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Divider,
  HStack,
  Heading,
  Icon,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  ListChecks,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/features/auth/AuthContext';

const MotionBox = motion(Box);
const MotionStack = motion(Stack);

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

const stagger = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
  variants: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

interface Step {
  icon: ComponentType<{ size?: number | string }>;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: UserPlus,
    title: 'Add a customer',
    description: "Capture name, phone, and a quick note. They're saved in your private book.",
  },
  {
    icon: Wallet,
    title: 'Record the loan',
    description: "Enter principal and interest rate — we generate the next 12 monthly dues for you.",
  },
  {
    icon: CheckCircle2,
    title: 'Tick off payments',
    description: 'Mark each due paid in one tap. Overdue ones surface automatically.',
  },
];

interface Feature {
  icon: ComponentType<{ size?: number | string }>;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: TrendingUp,
    title: 'See where every rupee is',
    description: 'Total invested, monthly expected, received, pending, overdue — all on one dashboard.',
  },
  {
    icon: Calendar,
    title: 'Schedule, automated',
    description: '12-month payment schedules generated the moment you record a loan. No spreadsheets.',
  },
  {
    icon: Bell,
    title: 'Overdue, on sight',
    description: 'Late payments turn red the second they cross the due date. Nothing slips through.',
  },
  {
    icon: ListChecks,
    title: 'Export anytime',
    description: 'Download a month as Excel — share with your accountant or keep an offline copy.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first',
    description: 'One-handed use on a phone. Polished on tablet and desktop. Works on slow networks.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data, locked down',
    description: 'Email/password sign-in. Strict per-user security rules. Nobody else sees your records.',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const pageBg = useColorModeValue('gray.50', 'navy.900');
  const surface = useColorModeValue('white', 'navy.800');
  const border = useColorModeValue('gray.200', 'navy.700');
  const muted = useColorModeValue('gray.600', 'gray.300');
  const heroAccent = useColorModeValue('brand.50', 'brand.900');
  const heroBlobA = useColorModeValue('brand.100', 'brand.800');
  const heroBlobB = useColorModeValue('navy.50', 'navy.700');
  const stepBadgeBg = useColorModeValue('navy.700', 'brand.400');
  const stepBadgeColor = useColorModeValue('white', 'navy.900');
  const ctaBg = useColorModeValue('navy.700', 'navy.800');

  if (loading) {
    return (
      <Center minH="100dvh" bg={pageBg}>
        <Spinner color="brand.500" size="lg" thickness="3px" />
      </Center>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <Box bg={pageBg} sx={{ scrollBehavior: 'smooth' }}>
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={20}
        bg={surface}
        borderBottomWidth="1px"
        borderColor={border}
        backdropFilter="saturate(180%) blur(8px)"
      >
        <Container maxW="6xl" py={3} px={{ base: 4, md: 6 }}>
          <HStack justify="space-between">
            <Logo size="md" />
            <HStack spacing={2}>
              <Button as={RouterLink} to="/login" variant="ghost" minH="40px">
                Sign in
              </Button>
              <Button
                as={RouterLink}
                to="/signup"
                colorScheme="brand"
                minH="40px"
                rightIcon={<Icon as={ArrowRight} boxSize={4} />}
              >
                Get started
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Box position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="-120px"
          right="-120px"
          w="380px"
          h="380px"
          borderRadius="full"
          bg={heroBlobA}
          filter="blur(60px)"
          opacity={0.6}
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-160px"
          left="-160px"
          w="420px"
          h="420px"
          borderRadius="full"
          bg={heroBlobB}
          filter="blur(80px)"
          opacity={0.55}
          pointerEvents="none"
        />

        <Container maxW="6xl" py={{ base: 16, md: 24 }} px={{ base: 4, md: 6 }} position="relative">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 12, lg: 16 }} alignItems="center">
            <MotionStack {...fadeUp} spacing={6}>
              <Tag size="md" bg={heroAccent} color="brand.700" _dark={{ color: 'brand.100' }} borderRadius="full" px={3} py={1} alignSelf="flex-start">
                <Icon as={Sparkles} boxSize={3.5} mr={1.5} />
                <TagLabel fontWeight="semibold">For personal lenders</TagLabel>
              </Tag>
              <Heading
                as="h1"
                size={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontWeight="extrabold"
                lineHeight="1.05"
                letterSpacing="-0.03em"
              >
                Track every{' '}
                <Box as="span" color="brand.500">
                  rupee
                </Box>{' '}
                you've lent.
              </Heading>
              <Text fontSize={{ base: 'md', md: 'lg' }} color={muted} maxW="xl" lineHeight="1.6">
                MyDudduBook tracks every loan, every payment, and every overdue rupee — so you always
                know who owes you what.
              </Text>
              <HStack spacing={3} pt={2} flexWrap="wrap">
                <Button
                  as={RouterLink}
                  to="/signup"
                  colorScheme="brand"
                  size="lg"
                  minH="52px"
                  px={7}
                  rightIcon={<Icon as={ArrowRight} boxSize={4} />}
                >
                  Get started — it's free
                </Button>
                <Button as={RouterLink} to="/login" variant="ghost" size="lg" minH="52px" px={6}>
                  Sign in
                </Button>
              </HStack>
              <HStack
                spacing={{ base: 4, md: 8 }}
                pt={6}
                divider={<Divider orientation="vertical" h="32px" />}
                flexWrap="wrap"
              >
                <Stack spacing={0}>
                  <Heading size="md" letterSpacing="-0.02em">
                    12-month
                  </Heading>
                  <Text fontSize="xs" color={muted}>
                    schedules auto-generated
                  </Text>
                </Stack>
                <Stack spacing={0}>
                  <Heading size="md" letterSpacing="-0.02em">
                    ₹0
                  </Heading>
                  <Text fontSize="xs" color={muted}>
                    free forever
                  </Text>
                </Stack>
                <Stack spacing={0}>
                  <Heading size="md" letterSpacing="-0.02em">
                    1 min
                  </Heading>
                  <Text fontSize="xs" color={muted}>
                    to set up
                  </Text>
                </Stack>
              </HStack>
            </MotionStack>

            <MotionBox
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
              position="relative"
            >
              <DashboardPreview />
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>

      <Box bg={surface} borderTopWidth="1px" borderBottomWidth="1px" borderColor={border}>
        <Container maxW="6xl" py={{ base: 14, md: 20 }} px={{ base: 4, md: 6 }}>
          <MotionStack {...fadeUp} spacing={3} textAlign="center" mb={{ base: 10, md: 14 }} align="center">
            <Tag colorScheme="brand" size="sm" borderRadius="full" px={3} py={1}>
              How it works
            </Tag>
            <Heading size={{ base: 'xl', md: '2xl' }} maxW="2xl" letterSpacing="-0.02em">
              Three steps to your first tracked loan
            </Heading>
          </MotionStack>

          <MotionBox {...stagger}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }}>
              {STEPS.map((step, idx) => (
                <MotionBox
                  key={step.title}
                  variants={staggerChild}
                  bg={pageBg}
                  borderRadius="2xl"
                  p={{ base: 6, md: 7 }}
                  borderWidth="1px"
                  borderColor={border}
                  position="relative"
                >
                  <Center
                    bg={stepBadgeBg}
                    color={stepBadgeColor}
                    w={10}
                    h={10}
                    borderRadius="full"
                    fontWeight="bold"
                    fontSize="sm"
                    position="absolute"
                    top={5}
                    right={5}
                  >
                    {idx + 1}
                  </Center>
                  <Center bg={heroAccent} color="brand.600" w={12} h={12} borderRadius="xl" mb={5}>
                    <Icon as={step.icon} boxSize={6} />
                  </Center>
                  <Heading size="md" mb={2} letterSpacing="-0.01em">
                    {step.title}
                  </Heading>
                  <Text color={muted} fontSize="sm" lineHeight="1.6">
                    {step.description}
                  </Text>
                </MotionBox>
              ))}
            </SimpleGrid>
          </MotionBox>
        </Container>
      </Box>

      <Container maxW="6xl" py={{ base: 14, md: 20 }} px={{ base: 4, md: 6 }}>
        <MotionStack {...fadeUp} spacing={3} textAlign="center" mb={{ base: 10, md: 14 }} align="center">
          <Tag colorScheme="brand" size="sm" borderRadius="full" px={3} py={1}>
            Everything you need
          </Tag>
          <Heading size={{ base: 'xl', md: '2xl' }} maxW="2xl" letterSpacing="-0.02em">
            A finance book — but smarter
          </Heading>
        </MotionStack>

        <MotionBox {...stagger}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
            {FEATURES.map((f) => (
              <MotionBox
                key={f.title}
                variants={staggerChild}
                bg={surface}
                borderWidth="1px"
                borderColor={border}
                borderRadius="2xl"
                p={{ base: 6, md: 7 }}
                _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
                sx={{ transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
              >
                <Stack spacing={4}>
                  <Center bg={heroAccent} color="brand.600" w={12} h={12} borderRadius="xl">
                    <Icon as={f.icon} boxSize={6} />
                  </Center>
                  <Heading size="md" letterSpacing="-0.01em">
                    {f.title}
                  </Heading>
                  <Text color={muted} fontSize="sm" lineHeight="1.6">
                    {f.description}
                  </Text>
                </Stack>
              </MotionBox>
            ))}
          </SimpleGrid>
        </MotionBox>
      </Container>

      <Container maxW="5xl" py={{ base: 14, md: 20 }} px={{ base: 4, md: 6 }}>
        <MotionBox
          {...fadeUp}
          bg={ctaBg}
          color="white"
          borderRadius="3xl"
          p={{ base: 8, md: 14 }}
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-80px"
            right="-80px"
            w="280px"
            h="280px"
            borderRadius="full"
            bg="brand.500"
            opacity={0.2}
            filter="blur(60px)"
          />
          <Stack spacing={5} align="center" position="relative">
            <Heading size={{ base: 'xl', md: '2xl' }} maxW="2xl" letterSpacing="-0.02em">
              Stop chasing notes. Start tracking.
            </Heading>
            <Text color="whiteAlpha.800" maxW="xl" fontSize={{ base: 'md', md: 'lg' }}>
              Free to use. Sign up in under a minute.
            </Text>
            <Button
              as={RouterLink}
              to="/signup"
              colorScheme="brand"
              size="lg"
              minH="52px"
              minW="220px"
              rightIcon={<Icon as={ArrowRight} boxSize={4} />}
            >
              Create your free account
            </Button>
          </Stack>
        </MotionBox>
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
            <Text fontSize="xs" color={muted}>
              © {new Date().getFullYear()} MyDudduBook. Lend smart. Track easy.
            </Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

function DashboardPreview() {
  const cardBg = useColorModeValue('white', 'navy.800');
  const cardBorder = useColorModeValue('gray.200', 'navy.700');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const statBg = useColorModeValue('brand.50', 'brand.900');
  const statColor = useColorModeValue('navy.700', 'gray.50');

  return (
    <Box position="relative">
      <Box
        position="absolute"
        top="-24px"
        right="-24px"
        w="120px"
        h="120px"
        borderRadius="full"
        bg="brand.400"
        opacity={0.18}
        filter="blur(20px)"
      />
      <Box
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="2xl"
        borderWidth="1px"
        borderColor={cardBorder}
        p={{ base: 5, md: 6 }}
        transform={{ base: 'none', md: 'rotate(-2deg)' }}
        _hover={{ transform: 'rotate(0deg)' }}
        transition="transform 0.5s ease"
      >
        <Stack spacing={4}>
          <HStack justify="space-between">
            <HStack>
              <Logo size="sm" />
            </HStack>
            <Badge colorScheme="brand" borderRadius="full" px={2} py={0.5}>
              Live
            </Badge>
          </HStack>

          <Box bg={statBg} p={4} borderRadius="xl">
            <Text fontSize="xs" color={muted} mb={1} fontWeight="medium">
              Total Outstanding
            </Text>
            <Heading size="lg" color={statColor} letterSpacing="-0.02em" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              ₹2,45,000
            </Heading>
            <HStack spacing={1} mt={1}>
              <Icon as={TrendingUp} boxSize={3.5} color="brand.600" />
              <Text fontSize="xs" color="brand.600" fontWeight="semibold">
                12 active loans
              </Text>
            </HStack>
          </Box>

          <Stack spacing={2}>
            <PreviewRow name="Ramesh K." amount="₹15,000" status="paid" />
            <PreviewRow name="Suresh M." amount="₹10,000" status="pending" />
            <PreviewRow name="Priya S." amount="₹8,000" status="overdue" />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function PreviewRow({
  name,
  amount,
  status,
}: {
  name: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
}) {
  const rowBg = useColorModeValue('gray.50', 'navy.900');
  const muted = useColorModeValue('gray.500', 'gray.400');

  const scheme = status === 'paid' ? 'green' : status === 'pending' ? 'orange' : 'red';
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <HStack bg={rowBg} p={3} borderRadius="lg" justify="space-between">
      <Stack spacing={0} minW={0}>
        <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
          {name}
        </Text>
        <Text fontSize="xs" color={muted}>
          Due 05 May 2026
        </Text>
      </Stack>
      <HStack spacing={2}>
        <Text fontSize="sm" fontWeight="bold" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {amount}
        </Text>
        <Badge colorScheme={scheme} borderRadius="md" fontSize="2xs" textTransform="none">
          {label}
        </Badge>
      </HStack>
    </HStack>
  );
}
