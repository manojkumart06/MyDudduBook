import { Box, Stack, Text, useColorMode, useColorModeValue } from '@chakra-ui/react';

export const APP_NAME = 'MyDudduBook';
export const APP_TAGLINE = 'Lend smart. Track easy.';

const BRAND_GREEN = '#84C547';
const NAVY = '#11233A';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  align?: 'start' | 'center';
}

const SIZES = {
  sm: { height: 32, tagline: 'xs' as const, gap: 1 },
  md: { height: 44, tagline: 'xs' as const, gap: 1.5 },
  lg: { height: 50, tagline: 'sm' as const, gap: 2 },
  xl: { height: 96, tagline: 'md' as const, gap: 3 },
};

interface ArtProps {
  height: number;
  textColor: string;
}

const VB_WIDTH = 240;
const VB_HEIGHT = 56;

function LogoArt({ height, textColor }: ArtProps) {
  const aspect = VB_WIDTH / VB_HEIGHT;
  const naturalWidth = height * aspect;

  return (
    <Box
      as="svg"
      role="img"
      aria-label={APP_NAME}
      viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
      preserveAspectRatio="xMinYMid meet"
      display="block"
      overflow="visible"
      sx={{
        width: '100%',
        height: 'auto',
        maxWidth: `${naturalWidth}px`,
        maxHeight: `${height}px`,
      }}
    >
      <rect x="0" y="0" width="56" height="56" rx="12" fill={BRAND_GREEN} />
      <path
        d="M10 12 L28 14 L46 12 L46 42 L28 44 L10 42 Z"
        fill="white"
        strokeLinejoin="round"
      />
      <line x1="28" y1="14" x2="28" y2="44" stroke={BRAND_GREEN} strokeWidth="2" />
      <line x1="14" y1="20" x2="26" y2="21" stroke={BRAND_GREEN} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="14" y1="26" x2="26" y2="27" stroke={BRAND_GREEN} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="14" y1="32" x2="26" y2="33" stroke={BRAND_GREEN} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="30" y1="21" x2="42" y2="20" stroke={BRAND_GREEN} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="30" y1="27" x2="42" y2="26" stroke={BRAND_GREEN} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="30" y1="33" x2="42" y2="32" stroke={BRAND_GREEN} strokeWidth="1.8" strokeLinecap="round" />
      <text
        x="68"
        y="38"
        fontSize="22"
        fontWeight="800"
        letterSpacing="-0.02em"
        fontFamily="inherit"
      >
        <tspan fill={textColor}>My</tspan>
        <tspan fill={BRAND_GREEN}>duddu</tspan>
        <tspan fill={textColor}>Book</tspan>
      </text>
    </Box>
  );
}

export function Logo({ size = 'md', showTagline = false, align = 'start' }: LogoProps) {
  const cfg = SIZES[size];
  const textColor = useColorModeValue(NAVY, '#FFFFFF');
  const taglineColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Stack
      spacing={cfg.gap}
      align={align === 'center' ? 'center' : 'flex-start'}
      textAlign={align === 'center' ? 'center' : 'start'}
      width="100%"
      minW={0}
    >
      <LogoArt height={cfg.height} textColor={textColor} />
      {showTagline && (
        <Text
          fontSize={cfg.tagline}
          color={taglineColor}
          fontWeight="medium"
          letterSpacing="0.01em"
        >
          {APP_TAGLINE}
        </Text>
      )}
    </Stack>
  );
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Box
      as="svg"
      role="img"
      aria-label={APP_NAME}
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 64 64"
    >
      <rect width="64" height="64" rx="14" fill={BRAND_GREEN} />
      <g transform="translate(8 8)">
        <path d="M10 12 L24 14 L38 12 L38 36 L24 38 L10 36 Z" fill="white" />
        <line x1="24" y1="14" x2="24" y2="38" stroke={BRAND_GREEN} strokeWidth="2" />
        <line x1="14" y1="20" x2="22" y2="21" stroke={BRAND_GREEN} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="14" y1="25" x2="22" y2="26" stroke={BRAND_GREEN} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="14" y1="30" x2="22" y2="31" stroke={BRAND_GREEN} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="26" y1="21" x2="34" y2="20" stroke={BRAND_GREEN} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="26" y1="26" x2="34" y2="25" stroke={BRAND_GREEN} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="26" y1="31" x2="34" y2="30" stroke={BRAND_GREEN} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </Box>
  );
}

export function useThemedLogoSrc(): string {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? '/BookLogoDark.svg' : '/BookLogo.svg';
}
