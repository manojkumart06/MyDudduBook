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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PasswordInput } from '@/components/PasswordInput';
import { authSignUpSchema, type SignUpValues } from '@/schemas/payment';
import { useAuth } from './AuthContext';
import { AuthLayout } from './AuthLayout';
import { mapAuthError } from './errors';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(authSignUpSchema),
    defaultValues: { email: '', password: '', confirm: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values.email, values.password);
      toast({ status: 'success', title: 'Account created' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast({ status: 'error', title: 'Sign-up failed', description: mapAuthError(err) });
    }
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking loans in minutes"
      footer={
        <>
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="brand.500" fontWeight="medium">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Stack spacing={4}>
          <FormControl isInvalid={!!errors.email} isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" autoComplete="email" inputMode="email" size="lg" {...register('email')} />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel>Password</FormLabel>
            <PasswordInput autoComplete="new-password" size="lg" {...register('password')} />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.confirm} isRequired>
            <FormLabel>Confirm password</FormLabel>
            <PasswordInput autoComplete="new-password" size="lg" {...register('confirm')} />
            <FormErrorMessage>{errors.confirm?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            minH="44px"
            isLoading={isSubmitting}
            loadingText="Creating account"
          >
            Create account
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}
