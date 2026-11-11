import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const DownloadButton = () => {
  const { t } = useTranslation();

  return (
    <Button
      variant='outlined'
      disabled
      sx={{
        flexDirection: 'column',
        minHeight: 62,
        maxWidth: '100%',
        px: 3.5,
        py: 1,
        borderRadius: 5,
        lineHeight: 1.3,
        '&.Mui-disabled': {
          color: 'text.primary',
          borderColor: 'primary.main',
          bgcolor: 'rgba(214, 184, 90, 0.12)',
        },
      }}
    >
      <Box component='span' sx={{ fontSize: 18 }}>
        {t('download.soon.label')}
      </Box>
      <Box
        component='span'
        sx={{ fontSize: 13, fontWeight: 400, color: 'text.secondary' }}
      >
        {t('download.soon.note')}
      </Box>
    </Button>
  );
};
