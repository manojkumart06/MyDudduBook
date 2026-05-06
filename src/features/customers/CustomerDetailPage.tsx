import {
  Box,
  Button,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { derivedStatus } from '@/lib/overdue';
import { useCustomer } from '@/hooks/useCustomers';
import { useCloseLoan, useDeleteLoan, useLoans } from '@/hooks/useLoans';
import { usePayments } from '@/hooks/usePayments';
import { CustomerFormModal } from './CustomerFormModal';
import { LoanFormModal } from '@/features/loans/LoanFormModal';
import { Wallet } from 'lucide-react';
import type { Loan } from '@/types';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const customerQ = useCustomer(id);
  const loansQ = useLoans({ customerId: id });
  const paymentsQ = usePayments({ customerId: id, pageSize: 100 });
  const closeLoan = useCloseLoan();
  const deleteLoan = useDeleteLoan();

  const editModal = useDisclosure();
  const loanModal = useDisclosure();
  const [closeTarget, setCloseTarget] = useState<Loan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Loan | null>(null);

  const bg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'navy.700');

  if (!customerQ.isLoading && !customerQ.data) {
    return (
      <Box>
        <Button leftIcon={<ArrowBackIcon />} variant="ghost" onClick={() => navigate('/customers')} mb={4}>
          Back
        </Button>
        <EmptyState
          title="Customer not found"
          description="This customer may have been deleted."
          action={{ label: 'Back to customers', onClick: () => navigate('/customers') }}
        />
      </Box>
    );
  }

  const customer = customerQ.data;
  const loans = loansQ.data ?? [];
  const payments = paymentsQ.data ?? [];
  const totalPrincipal = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.principalAmount, 0);
  const monthlyInterest = loans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.monthlyInterest, 0);

  const handleClose = async () => {
    if (!closeTarget) return;
    try {
      const removed = await closeLoan.mutateAsync(closeTarget.id);
      toast({
        status: 'success',
        title: 'Loan closed',
        description: `${removed} pending payment${removed === 1 ? '' : 's'} cancelled.`,
      });
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

  return (
    <Box>
      <Button
        as={RouterLink}
        to="/customers"
        leftIcon={<ArrowBackIcon />}
        variant="ghost"
        size="sm"
        mb={4}
        minH="36px"
      >
        All customers
      </Button>

      <PageHeader
        title={customer?.name ?? 'Customer'}
        description={customer?.phone ?? 'No phone number on file'}
        action={
          <HStack>
            <Button variant="outline" onClick={editModal.onOpen} minH="44px">
              Edit
            </Button>
            <Button colorScheme="brand" leftIcon={<AddIcon />} onClick={loanModal.onOpen} minH="44px">
              Add loan
            </Button>
          </HStack>
        }
      />

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={6}>
        <StatCard
          label="Active Loans"
          value={String(loans.filter((l) => l.status === 'active').length)}
          isLoading={loansQ.isLoading}
        />
        <StatCard
          label="Total Principal"
          value={formatCurrency(totalPrincipal)}
          isLoading={loansQ.isLoading}
        />
        <StatCard
          label="Monthly Interest"
          value={formatCurrency(monthlyInterest)}
          isLoading={loansQ.isLoading}
        />
      </SimpleGrid>

      {customer?.notes && (
        <Box bg={bg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" p={4} mb={6}>
          <Text fontSize="sm" color="gray.500" mb={1}>
            Notes
          </Text>
          <Text>{customer.notes}</Text>
        </Box>
      )}

      <Tabs colorScheme="brand" variant="line">
        <TabList>
          <Tab>Loans ({loans.length})</Tab>
          <Tab>Payments ({payments.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            {loans.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No loans yet"
                description="Record a new loan to auto-generate the next 12 monthly payments."
                action={{ label: 'Add loan', onClick: loanModal.onOpen }}
              />
            ) : (
              <Stack spacing={3}>
                {loans.map((loan) => (
                  <Box
                    key={loan.id}
                    bg={bg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    p={4}
                  >
                    <Stack
                      direction={{ base: 'column', md: 'row' }}
                      justify="space-between"
                      align={{ base: 'stretch', md: 'center' }}
                      spacing={3}
                    >
                      <Stack spacing={1} minW={0}>
                        <HStack>
                          <Heading size="sm">{formatCurrency(loan.principalAmount)}</Heading>
                          {loan.status === 'closed' && <StatusBadge status="paid" />}
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {loan.interestRate}% per month · {formatCurrency(loan.monthlyInterest)} / month
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Started {formatDate(loan.startDate)}
                        </Text>
                      </Stack>
                      <HStack>
                        {loan.status === 'active' && (
                          <Button size="sm" variant="outline" onClick={() => setCloseTarget(loan)} minH="36px">
                            Close loan
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => setDeleteTarget(loan)}
                          minH="36px"
                        >
                          Delete
                        </Button>
                      </HStack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </TabPanel>
          <TabPanel px={0}>
            {payments.length === 0 ? (
              <EmptyState
                title="No payments yet"
                description="Payments will appear here once loans are added."
              />
            ) : (
              <Stack spacing={2}>
                {payments.map((p) => (
                  <HStack
                    key={p.id}
                    bg={bg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={3}
                    justify="space-between"
                  >
                    <Stack spacing={0} minW={0}>
                      <Text fontWeight="medium">{formatDate(p.dueDate)}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {p.status === 'paid' ? `Paid ${formatDate(p.paidDate)}` : 'Due'}
                      </Text>
                    </Stack>
                    <HStack spacing={3}>
                      <Text sx={{ fontVariantNumeric: 'tabular-nums' }} fontWeight="semibold">
                        {formatCurrency(p.status === 'paid' ? p.receivedAmount ?? 0 : p.expectedAmount)}
                      </Text>
                      <StatusBadge status={derivedStatus(p)} />
                    </HStack>
                  </HStack>
                ))}
              </Stack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <CustomerFormModal isOpen={editModal.isOpen} onClose={editModal.onClose} customer={customer} />
      <LoanFormModal
        isOpen={loanModal.isOpen}
        onClose={loanModal.onClose}
        defaultCustomerId={customer?.id}
      />

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
