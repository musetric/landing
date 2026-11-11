import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const FaqSection = () => {
  const { t } = useTranslation();
  const questions = [
    { question: t('landing.faq.start.q'), answer: t('landing.faq.start.a') },
    { question: t('landing.faq.try.q'), answer: t('landing.faq.try.a') },
    { question: t('landing.faq.buy.q'), answer: t('landing.faq.buy.a') },
    { question: t('landing.faq.songs.q'), answer: t('landing.faq.songs.a') },
    {
      question: t('landing.faq.microphone.q'),
      answer: t('landing.faq.microphone.a'),
    },
    {
      question: t('landing.faq.recordings.q'),
      answer: t('landing.faq.recordings.a'),
    },
    {
      question: t('landing.faq.students.q'),
      answer: t('landing.faq.students.a'),
    },
  ];

  return (
    <Container
      id='faq'
      component='section'
      maxWidth='md'
      sx={{ pb: { xs: 9, md: 12 } }}
    >
      <Typography
        variant='h2'
        sx={{ mb: 2.5, fontSize: 'clamp(2.1rem, 4.2vw, 3.4rem)' }}
      >
        {t('landing.faq.title')}
      </Typography>
      {questions.map((item) => (
        <Box
          component='details'
          key={item.question}
          sx={{ py: 2.25, borderTop: 1, borderColor: 'divider' }}
        >
          <Box
            component='summary'
            sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 19 }}
          >
            {item.question}
          </Box>
          <Typography color='textSecondary' sx={{ mt: 1.25 }}>
            {item.answer}
          </Typography>
        </Box>
      ))}
    </Container>
  );
};
