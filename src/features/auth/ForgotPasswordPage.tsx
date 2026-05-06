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
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/schemas/payment';
import { useAuth } from './AuthContext';
import { AuthLayout } from './AuthLayout';
import { mapAuthError } from './errors';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPassword(values.email);
      toast({
        status: 'success',
        title: 'Reset email sent',
        description: 'Check your inbox to continue.',
      });
      navigate('/login');
    } catch (err) {
      toast({ status: 'error', title: 'Could not send reset email', description: mapAuthError(err) });
    }
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send a reset link to your inbox"
      footer={
        <Link as={RouterLink} to="/login" color="brand.500" fontWeight="medium">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Stack spacing={4}>
          <FormControl isInvalid={!!errors.email} isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" autoComplete="email" size="lg" {...register('email')} />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            minH="44px"
            isLoading={isSubmitting}
            loadingText="Sending"
          >
            Send reset link
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}
