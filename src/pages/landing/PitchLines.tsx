import { Box } from '@mui/material';
import { pitchBox, singerPitch, takePitch } from './voiceLines.js';

type PitchLinesProps = {
  height: number;
};

export const PitchLines = (props: PitchLinesProps) => {
  const { height } = props;

  return (
    <Box
      component='svg'
      viewBox={pitchBox}
      preserveAspectRatio='none'
      aria-hidden='true'
      sx={{ display: 'block', width: '100%', height }}
    >
      <rect
        x='520'
        y='0'
        width='140'
        height='150'
        fill='rgba(150, 190, 230, 0.08)'
      />
      <polyline
        points={singerPitch}
        fill='none'
        stroke='#d6b85a'
        strokeWidth='5'
        strokeLinejoin='round'
        strokeLinecap='round'
      />
      <polyline
        points={takePitch}
        fill='none'
        stroke='#96bee6'
        strokeWidth='4'
        strokeLinejoin='round'
        strokeLinecap='round'
      />
    </Box>
  );
};
