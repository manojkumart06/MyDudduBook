import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Link,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { authSignInSchema, type SignInValues } from '@/schemas/payment';
import { useAuth } from './AuthContext';
import { AuthLayout } from './AuthLayout';
import { mapAuthError } from './errors';

export default function LoginPage() {
  const { signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(authSignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err) {
      toast({ status: 'error', title: 'Sign-in failed', description: mapAuthError(err) });
    }
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your MyDudduBook account"
      footer={
        <>
          New here?{' '}
          <Link as={RouterLink} to="/signup" color="brand.500" fontWeight="medium">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Stack spacing={4}>
          <FormControl isInvalid={!!errors.email} isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              size="lg"
              {...register('email')}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              autoComplete="current-password"
              size="lg"
              {...register('password')}
            />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            minH="44px"
            isLoading={isSubmitting}
            loadingText="Signing in"
          >
            Sign in
          </Button>

          <Link
            as={RouterLink}
            to="/forgot-password"
            color="brand.500"
            fontSize="sm"
            textAlign="center"
          >
            Forgot password?
          </Link>
        </Stack>
      </form>
    </AuthLayout>
  );
}
