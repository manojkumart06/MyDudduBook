import { Box, Button, HStack, Heading, Icon, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { ArrowLeft, Compass } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const iconBg = useColorModeValue('brand.50', 'brand.900');
  const iconColor = useColorModeValue('brand.600', 'brand.200');
  const muted = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box
      minH={{ base: '60vh', md: '70vh' }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 8, md: 16 }}
    >
      <Stack spacing={6} align="center" textAlign="center" maxW="md" px={{ base: 4, md: 0 }}>
        <Box bg={iconBg} color={iconColor} p={4} borderRadius="full">
          <Icon as={Compass} boxSize={10} />
        </Box>
        <Stack spacing={2}>
          <Heading size="xl">404</Heading>
          <Heading size="md">Page not found</Heading>
        </Stack>
        <Text color={muted}>
          The page you're looking for doesn't exist or may have been moved.
        </Text>
        <HStack spacing={3} pt={2} flexWrap="wrap" justify="center">
          <Button
            leftIcon={<Icon as={ArrowLeft} boxSize={4} />}
            variant="outline"
            onClick={() => navigate(-1)}
            minH="44px"
          >
            Go back
          </Button>
          <Button as={RouterLink} to="/dashboard" colorScheme="brand" minH="44px">
            Back to dashboard
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
}
