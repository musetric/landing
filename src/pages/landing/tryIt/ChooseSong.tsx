import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { displayFont } from '../../../app/theme.js';

type ChooseSongProps = {
  disabled: boolean;
  onChoose: (file: File) => void;
};

export const ChooseSong = (props: ChooseSongProps) => {
  const { disabled, onChoose } = props;
  const { t } = useTranslation();
  const [over, setOver] = useState(false);

  return (
    <Box
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => {
        setOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const file = event.dataTransfer.files.item(0);
        if (file && !disabled) {
          onChoose(file);
        }
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        px: 1.5,
        py: 'clamp(28px, 6cqi, 52px)',
        border: '1.5px dashed',
        borderColor: over ? 'primary.main' : 'rgba(245, 239, 230, 0.22)',
        borderRadius: '20px',
        textAlign: 'center',
      }}
    >
      <SvgIcon sx={{ fontSize: 40, color: 'primary.main' }}>
        <path
          d='M9 18V5l12-2v13'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <circle
          cx='6'
          cy='18'
          r='3'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.6'
        />
        <circle
          cx='18'
          cy='16'
          r='3'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.6'
        />
      </SvgIcon>
      <Typography
        component='h3'
        sx={{
          fontFamily: displayFont,
          fontWeight: 500,
          fontSize: 'clamp(26px, 4cqi, 32px)',
          lineHeight: 1.1,
        }}
      >
        {t('landing.try.drop')}
      </Typography>
      <Button
        component='label'
        variant='contained'
        disabled={disabled}
        sx={{ minHeight: 56, px: 3.75, borderRadius: '18px', fontSize: 18 }}
      >
        {t('landing.try.choose')}
        <Box
          component='input'
          type='file'
          accept='audio/*'
          onChange={(event) => {
            const file = event.target.files?.item(0);
            event.target.value = '';
            if (file) {
              onChoose(file);
            }
          }}
          sx={{ display: 'none' }}
        />
      </Button>
      <Typography
        color='textSecondary'
        sx={{ fontSize: 14, textWrap: 'balance' }}
      >
        {t('landing.try.formats')}
      </Typography>
      <Typography color='textSecondary' sx={{ fontSize: 14 }}>
        {t('landing.try.private')}
      </Typography>
    </Box>
  );
};
