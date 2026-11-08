import { Box, Button } from '@mui/material';
import { type Install } from './install.js';

type InstallButtonProps = {
  install: Install;
};

export const InstallButton = (props: InstallButtonProps) => {
  const { install } = props;

  return (
    <Button
      href={install.href}
      variant='contained'
      sx={{
        flexDirection: 'column',
        minHeight: 62,
        px: 3.5,
        py: 1,
        borderRadius: 5,
        lineHeight: 1.3,
      }}
    >
      <Box component='span' sx={{ fontSize: 18 }}>
        {install.label}
      </Box>
      <Box component='span' sx={{ fontSize: 13, fontWeight: 400 }}>
        {install.note}
      </Box>
    </Button>
  );
};
