import {
  Box,
  Button,
  Grid,
  HStack,
  Heading,
  Icon,
  Input,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { endOfMonth, format, isAfter, isBefore, isSameMonth, startOfDay, startOfMonth } from 'date-fns';
import { AlertTriangle, CheckCircle2, Clock, Download, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useCurrentUserId } from '@/features/auth/AuthContext';
import { exportMonthlyPayments } from '@/lib/excelExport';
import { formatCurrency, formatDate, toDate } from '@/lib/formatters';
import { derivedStatus, isOverdue } from '@/lib/overdue';
import { useCustomers } from '@/hooks/useCustomers';
import { useLoans } from '@/hooks/useLoans';
import { useDashboardPayments, useMarkPaid, useSyncOverdue } from '@/hooks/usePayments';
import type { Customer, Payment } from '@/types';

export default function DashboardPage() {
  const uid = useCurrentUserId();
  const customersQ = useCustomers();
  const loansQ = useLoans({ status: 'active' });
  const paymentsQ = useDashboardPayments();
  const syncOverdue = useSyncOverdue();
  const markPaid = useMarkPaid();
  const toast = useToast();
  const exportInputBg = useColorModeValue('white', 'navy.800');
  const exportInputBorder = useColorModeValue('gray.200', 'navy.700');

  const [exportMonth, setExportMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    syncOverdue.mutate();
    // Only run on mount — re-sync if user reopens the app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customersById = useMemo(() => {
    const map = new Map<string, Customer>();
    (customersQ.data ?? []).forEach((c) => map.set(c.id, c));
    return map;
  }, [customersQ.data]);

  const loans = loansQ.data ?? [];
  const payments = paymentsQ.data ?? [];
  const now = startOfDay(new Date());
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekAhead = new Date(now);
  weekAhead.setDate(weekAhead.getDate() + 7);

  const totalInvested = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const monthlyExpected = loans.reduce((sum, l) => sum + l.monthlyInterest, 0);

  const receivedThisMonth = payments
    .filter((p) => {
      const paid = toDate(p.paidDate);
      return p.status === 'paid' && paid && isSameMonth(paid, now);
    })
    .reduce((sum, p) => sum + (p.receivedAmount ?? 0), 0);

  const pendingThisMonth = payments.filter((p) => {
    const due = toDate(p.dueDate);
    return p.status !== 'paid' && due && due >= monthStart && due <= monthEnd && !isOverdue(p, now);
  });
  const pendingThisMonthTotal = pendingThisMonth.reduce((sum, p) => sum + p.expectedAmount, 0);

  const overdue = payments.filter((p) => isOverdue(p, now));
  const overdueTotal = overdue.reduce((sum, p) => sum + p.expectedAmount, 0);

  const upcoming = payments
    .filter((p) => {
      const due = toDate(p.dueDate);
      return p.status !== 'paid' && due && !isBefore(due, now) && !isAfter(due, weekAhead);
    })
    .sort((a, b) => (toDate(a.dueDate)?.getTime() ?? 0) - (toDate(b.dueDate)?.getTime() ?? 0))
    .slice(0, 10);

  const recentActivity = payments
    .filter((p) => p.status === 'paid')
    .sort(
      (a, b) =>
        (toDate(b.updatedAt)?.getTime() ?? 0) - (toDate(a.updatedAt)?.getTime() ?? 0),
    )
    .slice(0, 10);

  const loading = customersQ.isLoading || loansQ.isLoading || paymentsQ.isLoading;

  const handleMarkPaid = async (payment: Payment) => {
    try {
      await markPaid.mutateAsync({
        id: payment.id,
        values: {
          receivedAmount: payment.expectedAmount,
          paidDate: new Date().toISOString().slice(0, 10),
          note: undefined,
        },
      });
      toast({ status: 'success', title: 'Payment marked paid' });
    } catch {
      toast({ status: 'error', title: 'Could not update payment' });
    }
  };

  const handleExport = async () => {
    if (!exportMonth) return;
    setIsExporting(true);
    try {
      const monthDate = new Date(`${exportMonth}-01T00:00:00`);
      const count = await exportMonthlyPayments({ uid, month: monthDate, customersById });
      if (count === 0) {
        toast({
          status: 'info',
          title: 'No payments to export',
          description: `Nothing scheduled in ${format(monthDate, 'MMMM yyyy')}.`,
        });
      } else {
        toast({
          status: 'success',
          title: 'Exported',
          description: `${count} payment${count === 1 ? '' : 's'} for ${format(monthDate, 'MMMM yyyy')}.`,
        });
      }
    } catch {
      toast({ status: 'error', title: 'Export failed' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        description="Your lending at a glance"
        action={
          <HStack spacing={2}>
            <Input
              type="month"
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              size="md"
              maxW="180px"
              minH="44px"
              bg={exportInputBg}
              borderColor={exportInputBorder}
              _hover={{ borderColor: exportInputBorder }}
            />
            <Button
              leftIcon={<Icon as={Download} boxSize={4} />}
              onClick={handleExport}
              isLoading={isExporting}
              loadingText="Exporting"
              colorScheme="brand"
              minH="44px"
            >
              Export
            </Button>
          </HStack>
        }
      />

      <Grid
        templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }}
        gap={{ base: 3, md: 4 }}
        mb={{ base: 6, md: 8 }}
      >
        <StatCard
          label="Total Invested"
          value={formatCurrency(totalInvested)}
          helper={`${loans.length} active loan${loans.length === 1 ? '' : 's'}`}
          icon={<Wallet size={18} />}
          isLoading={loading}
        />
        <StatCard
          label="Monthly Expected"
          value={formatCurrency(monthlyExpected)}
          helper="Across active loans"
          icon={<TrendingUp size={18} />}
          tone="default"
          isLoading={loading}
        />
        <StatCard
          label="Received This Month"
          value={formatCurrency(receivedThisMonth)}
          helper={formatDate(now, 'MMMM yyyy')}
          icon={<CheckCircle2 size={18} />}
          tone="success"
          isLoading={loading}
        />
        <StatCard
          label="Pending This Month"
          value={formatCurrency(pendingThisMonthTotal)}
          helper={`${pendingThisMonth.length} payment${pendingThisMonth.length === 1 ? '' : 's'}`}
          icon={<Clock size={18} />}
          tone="warning"
          isLoading={loading}
        />
        <StatCard
          label="Overdue"
          value={formatCurrency(overdueTotal)}
          helper={`${overdue.length} payment${overdue.length === 1 ? '' : 's'}`}
          icon={<AlertTriangle size={18} />}
          tone="danger"
          isLoading={loading}
        />
      </Grid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }}>
        <DashboardPanel
          title="Upcoming in 7 Days"
          empty="No payments due in the next week."
          isLoading={loading}
          isEmpty={upcoming.length === 0}
        >
          <Stack spacing={2} divider={<Divider />}>
            {upcoming.map((p) => (
              <HStack key={p.id} justify="space-between" spacing={3} py={2}>
                <Stack spacing={0} minW={0}>
                  <Text fontWeight="medium" noOfLines={1}>
                    {customersById.get(p.customerId)?.name ?? 'Unknown'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Due {formatDate(p.dueDate)}
                  </Text>
                </Stack>
                <HStack spacing={2} flexShrink={0}>
                  <Text fontSize="sm" fontWeight="semibold" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(p.expectedAmount)}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="brand"
                    variant="outline"
                    minH="36px"
                    onClick={() => handleMarkPaid(p)}
                    isLoading={markPaid.isPending && markPaid.variables?.id === p.id}
                  >
                    Mark Paid
                  </Button>
                </HStack>
              </HStack>
            ))}
          </Stack>
        </DashboardPanel>

        <DashboardPanel
          title="Recent Activity"
          empty="No payments recorded yet."
          isLoading={loading}
          isEmpty={recentActivity.length === 0}
        >
          <Stack spacing={2} divider={<Divider />}>
            {recentActivity.map((p) => (
              <HStack key={p.id} justify="space-between" spacing={3} py={2}>
                <Stack spacing={0} minW={0}>
                  <Text fontWeight="medium" noOfLines={1}>
                    {customersById.get(p.customerId)?.name ?? 'Unknown'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Paid {formatDate(p.paidDate)}
                  </Text>
                </Stack>
                <HStack spacing={2} flexShrink={0}>
                  <Text fontSize="sm" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(p.receivedAmount ?? 0)}
                  </Text>
                  <StatusBadge status={derivedStatus(p, now)} />
                </HStack>
              </HStack>
            ))}
          </Stack>
        </DashboardPanel>
      </SimpleGrid>

      {customersQ.data?.length === 0 && !loading && (
        <Box mt={8}>
          <Heading size="sm" mb={2}>
            Welcome to MyDudduBook
          </Heading>
          <Text color="gray.500" mb={4}>
            Start by adding your first customer.
          </Text>
          <Button as={RouterLink} to="/customers" colorScheme="brand" minH="44px">
            Add Customer
          </Button>
        </Box>
      )}
    </Box>
  );
}

function DashboardPanel({
  title,
  empty,
  isLoading,
  isEmpty,
  children,
}: {
  title: string;
  empty: string;
  isLoading: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  const bg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'navy.700');

  return (
    <Box bg={bg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" p={{ base: 4, md: 5 }}>
      <Heading size="sm" mb={3}>
        {title}
      </Heading>
      {isLoading ? (
        <Stack spacing={3}>
          <Skeleton height="16px" />
          <Skeleton height="16px" />
          <Skeleton height="16px" />
        </Stack>
      ) : isEmpty ? (
        <Text color="gray.500" fontSize="sm">
          {empty}
        </Text>
      ) : (
        children
      )}
    </Box>
  );
}

function Divider() {
  const color = useColorModeValue('gray.100', 'navy.700');
  return <Box borderBottomWidth="1px" borderColor={color} />;
}
