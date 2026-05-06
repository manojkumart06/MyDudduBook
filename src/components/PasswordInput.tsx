import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  type InputProps,
} from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput(
  props,
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup size={props.size ?? 'lg'}>
      <Input {...props} ref={ref} type={visible ? 'text' : 'password'} pr="3rem" />
      <InputRightElement h="full" pr={1}>
        <IconButton
          aria-label={visible ? 'Hide password' : 'Show password'}
          icon={visible ? <EyeOff size={18} /> : <Eye size={18} />}
          onClick={() => setVisible((v) => !v)}
          variant="ghost"
          size="sm"
          tabIndex={-1}
          color="gray.500"
          _hover={{ color: 'gray.700', bg: 'transparent' }}
        />
      </InputRightElement>
    </InputGroup>
  );
});
