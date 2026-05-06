import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  Stack,
  Tag,
  Text,
  useDisclosure,
  useToast,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { ResponsiveTable, type ResponsiveColumn } from '@/components/ResponsiveTable';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { derivedStatus, isOverdue } from '@/lib/overdue';
import { useCustomers } from '@/hooks/useCustomers';
import { useDeletePayment, usePayments } from '@/hooks/usePayments';
import type { Payment, PaymentStatus } from '@/types';
import { MarkPaidModal } from './MarkPaidModal';

type Chip = 'all' | PaymentStatus;

const CHIPS: { key: Chip; label: string; scheme: string }[] = [
  { key: 'all', label: 'All', scheme: 'gray' },
  { key: 'paid', label: 'Paid', scheme: 'green' },
  { key: 'pending', label: 'Pending', scheme: 'orange' },
  { key: 'overdue', label: 'Overdue', scheme: 'red' },
];

interface Row extends Payment {
  customerName: string;
}

export default function PaymentsPage() {
  const [chip, setChip] = useState<Chip>('all');
  const [monthStr, setMonthStr] = useState<string>('');
  const [markTarget, setMarkTarget] = useState<Payment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const markModal = useDisclosure();
  const deletePayment = useDeletePayment();
  const toast = useToast();

  const monthRange = useMemo(() => {
    if (!monthStr) return null;
    const [y, m] = monthStr.split('-').map((s) => Number(s));
    if (!y || !m) return null;
    const d = new Date(y, m - 1, 1);
    return { start: startOfMonth(d), end: endOfMonth(d) };
  }, [monthStr]);

  const customersQ = useCustomers();
  const paymentsQ = usePayments({
    status: chip === 'all' || chip === 'overdue' ? undefined : chip,
    monthStart: monthRange?.start,
    monthEnd: monthRange?.end,
    pageSize: 200,
  });

  const rows: Row[] = useMemo(() => {
    const byId = new Map(customersQ.data?.map((c) => [c.id, c.name]) ?? []);
    return (paymentsQ.data ?? [])
      .filter((p) => {
        if (chip === 'overdue') return isOverdue(p);
        return true;
      })
      .map<Row>((p) => ({ ...p, customerName: byId.get(p.customerId) ?? 'Unknown' }));
  }, [paymentsQ.data, customersQ.data, chip]);

  const openMark = (payment: Payment) => {
    setMarkTarget(payment);
    markModal.onOpen();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePayment.mutateAsync(deleteTarget.id);
      toast({ status: 'success', title: 'Payment deleted' });
    } catch {
      toast({ status: 'error', title: 'Could not delete payment' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns: ResponsiveColumn<Row>[] = [
    { key: 'customer', header: 'Customer', render: (r) => <Text fontWeight="medium">{r.customerName}</Text> },
    { key: 'due', header: 'Due Date', render: (r) => <Text>{formatDate(r.dueDate)}</Text> },
    {
      key: 'expected',
      header: 'Expected',
      isNumeric: true,
      render: (r) => <Text>{formatCurrency(r.expectedAmount)}</Text>,
    },
    {
      key: 'received',
      header: 'Received',
      isNumeric: true,
      render: (r) => (
        <Text>{r.receivedAmount != null ? formatCurrency(r.receivedAmount) : '—'}</Text>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={derivedStatus(r)} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      render: (r) => (
        <HStack spacing={1} justify="flex-end">
          {r.status !== 'paid' && (
            <Button size="sm" colorScheme="brand" variant="outline" minH="36px" onClick={() => openMark(r)}>
              Mark Paid
            </Button>
          )}
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Row actions"
              icon={<ChevronDownIcon />}
              size="sm"
              variant="ghost"
              minW="36px"
              minH="36px"
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList onClick={(e) => e.stopPropagation()}>
              <MenuItem onClick={() => openMark(r)}>{r.status === 'paid' ? 'Edit payment' : 'Mark paid'}</MenuItem>
              <MenuItem color="red.500" onClick={() => setDeleteTarget(r)}>
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      ),
    },
  ];

  const loading = paymentsQ.isLoading || customersQ.isLoading;

  return (
    <Box>
      <PageHeader title="Payments" description="Filter and record payments" />

      <Stack spacing={4}>
        <Wrap align="center" spacing={2}>
          {CHIPS.map((c) => (
            <WrapItem key={c.key}>
              <Tag
                as="button"
                size="lg"
                onClick={() => setChip(c.key)}
                colorScheme={chip === c.key ? c.scheme : 'gray'}
                variant={chip === c.key ? 'solid' : 'subtle'}
                cursor="pointer"
                minH="36px"
                px={4}
                borderRadius="full"
              >
                {c.label}
              </Tag>
            </WrapItem>
          ))}
          <WrapItem>
            <HStack spacing={1}>
              <Input
                type="month"
                size="sm"
                value={monthStr}
                onChange={(e) => setMonthStr(e.target.value)}
                maxW="180px"
                borderRadius="full"
              />
              {monthStr && (
                <Button size="sm" variant="ghost" onClick={() => setMonthStr('')} minH="36px">
                  Clear
                </Button>
              )}
            </HStack>
          </WrapItem>
        </Wrap>

        {loading ? (
          <Stack spacing={2}>
            <Skeleton height="56px" />
            <Skeleton height="56px" />
            <Skeleton height="56px" />
            <Skeleton height="56px" />
          </Stack>
        ) : (
          <ResponsiveTable
            columns={columns}
            rows={rows}
            getRowKey={(r) => r.id}
            rowHighlight={(r) => isOverdue(r)}
            emptyState={
              <EmptyState
                icon={Filter}
                title="No payments match the filter"
                description={
                  chip === 'all' && !monthStr
                    ? 'Create a loan to auto-generate scheduled payments.'
                    : 'Try changing the filter or month.'
                }
              />
            }
          />
        )}

        <Text fontSize="xs" color="gray.500">
          {monthStr
            ? `Showing payments for ${format(new Date(`${monthStr}-01`), 'MMMM yyyy')}`
            : 'Showing most recent 200 payments'}
        </Text>
      </Stack>

      <MarkPaidModal isOpen={markModal.isOpen} onClose={markModal.onClose} payment={markTarget} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete payment"
        description="This will permanently delete this payment record. This cannot be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deletePayment.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
