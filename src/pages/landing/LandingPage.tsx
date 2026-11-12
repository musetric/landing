import { SitePage } from '../../app/SitePage.js';
import { FaqSection } from './FaqSection.js';
import { HeroSection } from './HeroSection.js';
import { JoinSection } from './JoinSection.js';
import { PromisesSection } from './PromisesSection.js';
import { StepsSection } from './StepsSection.js';
import { TeachersSection } from './TeachersSection.js';
import { TrySection } from './tryIt/TrySection.js';

export const LandingPage = () => (
  <SitePage>
    <HeroSection />
    <TrySection />
    <StepsSection />
    <TeachersSection />
    <PromisesSection />
    <JoinSection />
    <FaqSection />
  </SitePage>
);
