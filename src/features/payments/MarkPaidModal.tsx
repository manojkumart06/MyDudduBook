import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
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
import { Controller, useForm } from 'react-hook-form';
import { markPaidSchema, type MarkPaidValues } from '@/schemas/payment';
import { useMarkPaid } from '@/hooks/usePayments';
import { toDate } from '@/lib/formatters';
import type { Payment } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function MarkPaidModal({ isOpen, onClose, payment }: Props) {
  const markPaid = useMarkPaid();
  const toast = useToast();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MarkPaidValues>({
    resolver: zodResolver(markPaidSchema),
    defaultValues: {
      receivedAmount: 0,
      paidDate: new Date().toISOString().slice(0, 10),
      note: '',
    },
  });

  useEffect(() => {
    if (isOpen && payment) {
      reset({
        receivedAmount: payment.expectedAmount,
        paidDate:
          (toDate(payment.paidDate) ?? new Date()).toISOString().slice(0, 10),
        note: payment.note ?? '',
      });
    }
  }, [isOpen, payment, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!payment) return;
    try {
      await markPaid.mutateAsync({ id: payment.id, values });
      toast({ status: 'success', title: 'Payment marked paid' });
      onClose();
    } catch {
      toast({ status: 'error', title: 'Could not update payment' });
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onSubmit} noValidate>
        <ModalHeader>Mark payment paid</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.receivedAmount} isRequired>
              <FormLabel>Received amount</FormLabel>
              <Controller
                control={control}
                name="receivedAmount"
                render={({ field }) => (
                  <InputGroup size="lg">
                    <InputLeftAddon>₹</InputLeftAddon>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="1"
                      min={0}
                      value={Number.isFinite(field.value) ? field.value : ''}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      onBlur={field.onBlur}
                    />
                  </InputGroup>
                )}
              />
              <FormErrorMessage>{errors.receivedAmount?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.paidDate} isRequired>
              <FormLabel>Paid date</FormLabel>
              <Input type="date" size="lg" {...register('paidDate')} />
              <FormErrorMessage>{errors.paidDate?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.note}>
              <FormLabel>Note</FormLabel>
              <Textarea rows={2} {...register('note')} />
              <FormErrorMessage>{errors.note?.message}</FormErrorMessage>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose} minH="44px">
            Cancel
          </Button>
          <Button type="submit" colorScheme="brand" isLoading={isSubmitting} minH="44px">
            Mark paid
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
