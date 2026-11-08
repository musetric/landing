import { SitePage } from '../../app/SitePage.js';
import { FaqSection } from './FaqSection.js';
import { HeroSection } from './HeroSection.js';
import { JoinSection } from './JoinSection.js';
import { PromisesSection } from './PromisesSection.js';
import { StepsSection } from './StepsSection.js';
import { TeachersSection } from './TeachersSection.js';
import { VoiceFigure } from './VoiceFigure.js';

export const LandingPage = () => (
  <SitePage>
    <HeroSection />
    <VoiceFigure />
    <StepsSection />
    <TeachersSection />
    <PromisesSection />
    <JoinSection />
    <FaqSection />
  </SitePage>
);
