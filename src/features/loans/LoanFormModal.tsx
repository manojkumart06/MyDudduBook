import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { formatCurrency, computeMonthlyInterest } from '@/lib/formatters';
import { loanFormSchema, type LoanFormValues } from '@/schemas/loan';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateLoan } from '@/hooks/useLoans';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function LoanFormModal({ isOpen, onClose, defaultCustomerId }: Props) {
  const customersQ = useCustomers();
  const createLoan = useCreateLoan();
  const toast = useToast();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      customerId: defaultCustomerId ?? '',
      principalAmount: 0,
      interestRate: 5,
      startDate: today(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        customerId: defaultCustomerId ?? '',
        principalAmount: 0,
        interestRate: 5,
        startDate: today(),
      });
    }
  }, [isOpen, defaultCustomerId, reset]);

  const principal = Number(watch('principalAmount') || 0);
  const rate = Number(watch('interestRate') || 0);
  const monthly = computeMonthlyInterest(principal, rate);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createLoan.mutateAsync(values);
      toast({
        status: 'success',
        title: 'Loan created',
        description: '12 monthly payments were scheduled.',
      });
      onClose();
    } catch {
      toast({ status: 'error', title: 'Could not create loan' });
    }
  });

  const customers = customersQ.data ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onSubmit} noValidate>
        <ModalHeader>Add loan</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.customerId} isRequired>
              <FormLabel>Customer</FormLabel>
              <Select size="lg" placeholder="Select customer" {...register('customerId')}>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.customerId?.message}</FormErrorMessage>
              {customers.length === 0 && (
                <FormHelperText color="orange.500">
                  Add a customer first before creating a loan.
                </FormHelperText>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.principalAmount} isRequired>
              <FormLabel>Principal amount</FormLabel>
              <Controller
                control={control}
                name="principalAmount"
                render={({ field }) => (
                  <InputGroup size="lg">
                    <InputLeftAddon>₹</InputLeftAddon>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="1"
                      value={Number.isFinite(field.value) ? field.value : ''}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      onBlur={field.onBlur}
                    />
                  </InputGroup>
                )}
              />
              <FormErrorMessage>{errors.principalAmount?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.interestRate} isRequired>
              <FormLabel>Interest rate</FormLabel>
              <Controller
                control={control}
                name="interestRate"
                render={({ field }) => (
                  <InputGroup size="lg">
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min={0}
                      max={100}
                      value={Number.isFinite(field.value) ? field.value : ''}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      onBlur={field.onBlur}
                    />
                    <InputRightAddon>% / month</InputRightAddon>
                  </InputGroup>
                )}
              />
              <FormErrorMessage>{errors.interestRate?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.startDate} isRequired>
              <FormLabel>Start date</FormLabel>
              <Input type="date" size="lg" {...register('startDate')} />
              <FormErrorMessage>{errors.startDate?.message}</FormErrorMessage>
            </FormControl>

            <Stack
              bg="brand.50"
              _dark={{ bg: 'brand.900' }}
              p={3}
              borderRadius="md"
              spacing={0}
            >
              <Text fontSize="xs" color="brand.700" _dark={{ color: 'brand.200' }}>
                Monthly interest
              </Text>
              <Text fontSize="xl" fontWeight="bold" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(monthly)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                12 monthly payments will be generated automatically.
              </Text>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose} minH="44px">
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="brand"
            isLoading={isSubmitting}
            isDisabled={customers.length === 0}
            minH="44px"
          >
            Create loan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
