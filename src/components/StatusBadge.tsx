import { Badge } from '@chakra-ui/react';
import type { PaymentStatus } from '@/types';

const LABEL: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
};

const SCHEME: Record<PaymentStatus, string> = {
  paid: 'green',
  pending: 'orange',
  overdue: 'red',
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge colorScheme={SCHEME[status]} variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="xs">
      {LABEL[status]}
    </Badge>
  );
}
