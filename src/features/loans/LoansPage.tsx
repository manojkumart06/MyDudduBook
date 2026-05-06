import {
  Box,
  Button,
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
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { ResponsiveTable, type ResponsiveColumn } from '@/components/ResponsiveTable';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useCustomers } from '@/hooks/useCustomers';
import { useCloseLoan, useDeleteLoan, useLoans } from '@/hooks/useLoans';
import { Wallet } from 'lucide-react';
import type { Loan } from '@/types';
import { LoanFormModal } from './LoanFormModal';

interface Row extends Loan {
  customerName: string;
}

export default function LoansPage() {
  const customersQ = useCustomers();
  const loansQ = useLoans();
  const closeLoan = useCloseLoan();
  const deleteLoan = useDeleteLoan();
  const navigate = useNavigate();
  const toast = useToast();

  const formModal = useDisclosure();
  const [closeTarget, setCloseTarget] = useState<Loan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Loan | null>(null);

  const rows: Row[] = useMemo(() => {
    const byId = new Map(customersQ.data?.map((c) => [c.id, c.name]) ?? []);
    return (loansQ.data ?? []).map<Row>((l) => ({ ...l, customerName: byId.get(l.customerId) ?? 'Unknown' }));
  }, [loansQ.data, customersQ.data]);

  const handleClose = async () => {
    if (!closeTarget) return;
    try {
      await closeLoan.mutateAsync(closeTarget.id);
      toast({ status: 'success', title: 'Loan closed' });
    } catch {
      toast({ status: 'error', title: 'Could not close loan' });
    } finally {
      setCloseTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLoan.mutateAsync(deleteTarget.id);
      toast({ status: 'success', title: 'Loan deleted' });
    } catch {
      toast({ status: 'error', title: 'Could not delete loan' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns: ResponsiveColumn<Row>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => <Text fontWeight="medium">{r.customerName}</Text>,
    },
    {
      key: 'principal',
      header: 'Principal',
      isNumeric: true,
      render: (r) => <Text fontWeight="semibold">{formatCurrency(r.principalAmount)}</Text>,
    },
    {
      key: 'rate',
      header: 'Rate',
      isNumeric: true,
      render: (r) => <Text>{r.interestRate}% / mo</Text>,
    },
    {
      key: 'monthly',
      header: 'Monthly Interest',
      isNumeric: true,
      render: (r) => <Text>{formatCurrency(r.monthlyInterest)}</Text>,
    },
    { key: 'start', header: 'Start Date', render: (r) => <Text>{formatDate(r.startDate)}</Text> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Tag colorScheme={r.status === 'active' ? 'green' : 'gray'} size="sm" variant="subtle">
          {r.status}
        </Tag>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      render: (r) => (
        <Menu>
          <MenuButton
            as={Button}
            size="sm"
            variant="ghost"
            rightIcon={<ChevronDownIcon />}
            onClick={(e) => e.stopPropagation()}
            minH="36px"
          >
            Actions
          </MenuButton>
          <MenuList onClick={(e) => e.stopPropagation()}>
            <MenuItem onClick={() => navigate(`/customers/${r.customerId}`)}>View customer</MenuItem>
            {r.status === 'active' && <MenuItem onClick={() => setCloseTarget(r)}>Close loan</MenuItem>}
            <MenuItem color="red.500" onClick={() => setDeleteTarget(r)}>
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      ),
    },
  ];

  const loading = loansQ.isLoading || customersQ.isLoading;

  return (
    <Box>
      <PageHeader
        title="Loans"
        description="All active and closed loans"
        action={
          <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={formModal.onOpen} minH="44px">
            Add loan
          </Button>
        }
      />

      {loading ? (
        <Stack spacing={2}>
          <Skeleton height="56px" />
          <Skeleton height="56px" />
          <Skeleton height="56px" />
        </Stack>
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.id}
          emptyState={
            <EmptyState
              icon={Wallet}
              title="No loans yet"
              description="Record a new loan — we'll generate the next 12 monthly payments automatically."
              action={{ label: 'Add loan', onClick: formModal.onOpen }}
            />
          }
        />
      )}

      <LoanFormModal isOpen={formModal.isOpen} onClose={formModal.onClose} />

      <ConfirmDialog
        isOpen={!!closeTarget}
        title="Close loan"
        description="All pending future payments for this loan will be cancelled. Paid payments stay in history."
        confirmLabel="Close loan"
        isLoading={closeLoan.isPending}
        onConfirm={handleClose}
        onClose={() => setCloseTarget(null)}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete loan"
        description="This will permanently delete the loan and all its payments. This cannot be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteLoan.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
