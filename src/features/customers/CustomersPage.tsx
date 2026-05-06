import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import { useDeferredValue, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { ResponsiveTable, type ResponsiveColumn } from '@/components/ResponsiveTable';
import { formatCurrency } from '@/lib/formatters';
import {
  countCustomerDependents,
  useCustomers,
  useDeleteCustomerCascade,
} from '@/hooks/useCustomers';
import { useCurrentUserId } from '@/features/auth/AuthContext';
import { useLoans } from '@/hooks/useLoans';
import { Users } from 'lucide-react';
import type { Customer } from '@/types';
import { CustomerFormModal } from './CustomerFormModal';

interface Row extends Customer {
  activeLoanCount: number;
  outstanding: number;
}

export default function CustomersPage() {
  const uid = useCurrentUserId();
  const customersQ = useCustomers();
  const loansQ = useLoans();
  const deleteMutation = useDeleteCustomerCascade();
  const toast = useToast();
  const navigate = useNavigate();

  const formModal = useDisclosure();
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleteCounts, setDeleteCounts] = useState<{ loans: number; payments: number } | null>(null);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const inputBg = useColorModeValue('white', 'navy.800');
  const inputBorder = useColorModeValue('gray.200', 'navy.700');

  const rows: Row[] = useMemo(() => {
    const customers = customersQ.data ?? [];
    const loans = loansQ.data ?? [];
    const q = deferredSearch.trim().toLowerCase();
    return customers
      .filter((c) => {
        if (!q) return true;
        return c.name.toLowerCase().includes(q) || (c.phone ?? '').toLowerCase().includes(q);
      })
      .map<Row>((c) => {
        const activeLoans = loans.filter((l) => l.customerId === c.id && l.status === 'active');
        return {
          ...c,
          activeLoanCount: activeLoans.length,
          outstanding: activeLoans.reduce((sum, l) => sum + l.principalAmount, 0),
        };
      });
  }, [customersQ.data, loansQ.data, deferredSearch]);

  const openAdd = () => {
    setEditing(null);
    formModal.onOpen();
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    formModal.onOpen();
  };

  const askDelete = async (customer: Customer) => {
    setDeleteTarget(customer);
    setDeleteCounts(null);
    try {
      const counts = await countCustomerDependents(uid, customer.id);
      setDeleteCounts(counts);
    } catch {
      setDeleteCounts({ loans: 0, payments: 0 });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ status: 'success', title: 'Customer deleted' });
    } catch {
      toast({ status: 'error', title: 'Could not delete customer' });
    } finally {
      setDeleteTarget(null);
      setDeleteCounts(null);
    }
  };

  const columns: ResponsiveColumn<Row>[] = [
    { key: 'name', header: 'Name', render: (r) => <Text fontWeight="medium">{r.name}</Text> },
    {
      key: 'phone',
      header: 'Phone',
      render: (r) => <Text color="gray.500">{r.phone ?? '—'}</Text>,
    },
    {
      key: 'active',
      header: 'Active Loans',
      isNumeric: true,
      render: (r) => <Text>{r.activeLoanCount}</Text>,
    },
    {
      key: 'outstanding',
      header: 'Total Outstanding',
      isNumeric: true,
      render: (r) => <Text fontWeight="semibold">{formatCurrency(r.outstanding)}</Text>,
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
            <MenuItem onClick={() => navigate(`/customers/${r.id}`)}>View</MenuItem>
            <MenuItem onClick={() => openEdit(r)}>Edit</MenuItem>
            <MenuItem color="red.500" onClick={() => askDelete(r)}>
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      ),
    },
  ];

  const loading = customersQ.isLoading || loansQ.isLoading;

  return (
    <Box>
      <PageHeader
        title="Customers"
        description="People you've lent money to"
        action={
          <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={openAdd} minH="44px">
            Add customer
          </Button>
        }
      />

      <Stack spacing={4}>
        <InputGroup size="lg" maxW={{ base: 'full', md: 'md' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search by name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg={inputBg}
            borderColor={inputBorder}
            _hover={{ borderColor: inputBorder }}
          />
        </InputGroup>

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
            onRowClick={(r) => navigate(`/customers/${r.id}`)}
            emptyState={
              <EmptyState
                icon={Users}
                title={search ? 'No customers match your search' : 'No customers yet'}
                description={
                  search
                    ? 'Try a different name or phone number.'
                    : 'Add your first customer to start tracking loans.'
                }
                action={search ? undefined : { label: 'Add customer', onClick: openAdd }}
              />
            }
          />
        )}
      </Stack>

      <CustomerFormModal isOpen={formModal.isOpen} onClose={formModal.onClose} customer={editing} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete customer"
        description={
          deleteCounts ? (
            <Text>
              This will permanently delete <b>{deleteTarget?.name}</b>, along with{' '}
              <b>{deleteCounts.loans}</b> loan{deleteCounts.loans === 1 ? '' : 's'} and{' '}
              <b>{deleteCounts.payments}</b> payment{deleteCounts.payments === 1 ? '' : 's'}. This cannot be
              undone.
            </Text>
          ) : (
            <HStack>
              <Skeleton height="16px" width="200px" />
            </HStack>
          )
        }
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteCounts(null);
        }}
      />
    </Box>
  );
}
