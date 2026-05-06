import {
  Box,
  HStack,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface ResponsiveColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'start' | 'center' | 'end';
  hideBelowMd?: boolean;
  isNumeric?: boolean;
}

interface Props<T> {
  columns: ResponsiveColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowHighlight?: (row: T) => boolean;
  emptyState?: ReactNode;
}

export function ResponsiveTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  rowHighlight,
  emptyState,
}: Props<T>) {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;
  const cardBg = useColorModeValue('white', 'navy.800');
  const highlightBg = useColorModeValue('red.50', 'red.900');
  const borderColor = useColorModeValue('gray.200', 'navy.700');
  const hoverBg = useColorModeValue('gray.50', 'navy.700');
  const headBg = useColorModeValue('gray.50', 'navy.900');

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  if (isMobile) {
    return (
      <Stack spacing={3}>
        {rows.map((row) => {
          const highlight = rowHighlight?.(row);
          return (
            <Box
              key={getRowKey(row)}
              bg={highlight ? highlightBg : cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              cursor={onRowClick ? 'pointer' : 'default'}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              _hover={onRowClick ? { boxShadow: 'sm' } : undefined}
              transition="box-shadow 0.15s ease"
            >
              <Stack spacing={2}>
                {columns.map((col) => (
                  <HStack key={col.key} justify="space-between" align="start" spacing={3}>
                    <Text fontSize="xs" color="gray.500" flexShrink={0}>
                      {col.header}
                    </Text>
                    <Box
                      textAlign="end"
                      fontSize="sm"
                      sx={col.isNumeric ? { fontVariantNumeric: 'tabular-nums' } : undefined}
                      minW={0}
                    >
                      {col.render(row)}
                    </Box>
                  </HStack>
                ))}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    );
  }

  return (
    <TableContainer borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={cardBg}>
      <Table variant="simple" size="md">
        <Thead bg={headBg}>
          <Tr>
            {columns.map((col) => (
              <Th key={col.key} textAlign={col.align ?? (col.isNumeric ? 'end' : 'start')} whiteSpace="nowrap">
                {col.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row) => {
            const highlight = rowHighlight?.(row);
            return (
              <Tr
                key={getRowKey(row)}
                bg={highlight ? highlightBg : undefined}
                _hover={onRowClick ? { bg: hoverBg, cursor: 'pointer' } : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <Td
                    key={col.key}
                    textAlign={col.align ?? (col.isNumeric ? 'end' : 'start')}
                    sx={col.isNumeric ? { fontVariantNumeric: 'tabular-nums' } : undefined}
                  >
                    {col.render(row)}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
