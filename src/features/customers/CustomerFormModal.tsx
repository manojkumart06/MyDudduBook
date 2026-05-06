import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { customerFormSchema, type CustomerFormValues } from '@/schemas/customer';
import type { Customer } from '@/types';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

export function CustomerFormModal({ isOpen, onClose, customer }: Props) {
  const toast = useToast();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name ?? '',
      phone: customer?.phone ?? '',
      notes: customer?.notes ?? '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: customer?.name ?? '',
        phone: customer?.phone ?? '',
        notes: customer?.notes ?? '',
      });
    }
  }, [isOpen, customer, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (customer) {
        await updateMutation.mutateAsync({ id: customer.id, values });
        toast({ status: 'success', title: 'Customer updated' });
      } else {
        await createMutation.mutateAsync(values);
        toast({ status: 'success', title: 'Customer added' });
      }
      onClose();
    } catch {
      toast({ status: 'error', title: 'Could not save customer' });
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onSubmit} noValidate>
        <ModalHeader>{customer ? 'Edit customer' : 'Add customer'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel>Name</FormLabel>
              <Input size="lg" autoFocus {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.phone}>
              <FormLabel>Phone</FormLabel>
              <Input type="tel" inputMode="tel" size="lg" {...register('phone')} />
              <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.notes}>
              <FormLabel>Notes</FormLabel>
              <Textarea rows={3} {...register('notes')} />
              <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose} minH="44px">
            Cancel
          </Button>
          <Button type="submit" colorScheme="brand" isLoading={isSubmitting} minH="44px">
            {customer ? 'Save changes' : 'Add customer'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
