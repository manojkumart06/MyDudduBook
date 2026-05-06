import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Outlet } from 'react-router-dom';
import { Logo } from './Logo';
import { Sidebar } from './Sidebar';
import { BottomTabBar } from './BottomTabBar';

const SIDEBAR_WIDTH = 240;

export function AppLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, md: true }) ?? false;

  const bg = useColorModeValue('gray.50', 'navy.900');
  const surfaceBg = useColorModeValue('white', 'navy.800');
  const borderCol = useColorModeValue('gray.200', 'navy.700');

  return (
    <Box minH="100dvh" bg={bg}>
      {isDesktop && (
        <Box
          as="aside"
          position="fixed"
          left={0}
          top={0}
          bottom={0}
          w={`${SIDEBAR_WIDTH}px`}
          borderRightWidth="1px"
          borderColor={borderCol}
          bg={surfaceBg}
          zIndex={10}
        >
          <Sidebar onNavigate={() => undefined} />
        </Box>
      )}

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <Sidebar onNavigate={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box pl={{ base: 0, md: `${SIDEBAR_WIDTH}px` }}>
        {!isDesktop && (
          <Flex
            as="header"
            position="sticky"
            top={0}
            zIndex={5}
            bg={surfaceBg}
            borderBottomWidth="1px"
            borderColor={borderCol}
            px={4}
            h="56px"
            align="center"
            gap={2}
          >
            <IconButton
              aria-label="Open navigation"
              icon={<HamburgerIcon />}
              onClick={onOpen}
              variant="ghost"
              minW="44px"
              minH="44px"
            />
            <Logo size="sm" />
          </Flex>
        )}

        <Box
          as="main"
          px={{ base: 4, md: 6, lg: 8 }}
          py={{ base: 4, md: 6 }}
          pb={{ base: 'calc(80px + env(safe-area-inset-bottom))', md: 8 }}
          maxW="1440px"
          mx="auto"
        >
          <Outlet />
        </Box>

        {!isDesktop && <BottomTabBar />}
      </Box>
    </Box>
  );
}
