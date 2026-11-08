import { useTranslation } from 'react-i18next';
import { type Device } from './device.js';

const testRequest = (subject: string): string =>
  `mailto:musetric@gmail.com?subject=${encodeURIComponent(subject)}`;

export type Install = {
  label: string;
  note: string;
  href: string;
};

export const useInstalls = (): Record<Device, Install> => {
  const { t } = useTranslation();

  return {
    ios: {
      label: t('install.ios.label'),
      note: t('install.ios.note'),
      href: testRequest('Join the Musetric test on iPhone or iPad'),
    },
    android: {
      label: t('install.android.label'),
      note: t('install.android.note'),
      href: testRequest('Join the Musetric test on Android'),
    },
    mac: {
      label: t('install.mac.label'),
      note: t('install.mac.note'),
      href: testRequest('Join the Musetric test on Mac'),
    },
    windows: {
      label: t('install.windows.label'),
      note: t('install.windows.note'),
      href: testRequest('Join the Musetric test on Windows'),
    },
    unknown: {
      label: t('install.unknown.label'),
      note: t('install.unknown.note'),
      href: testRequest('Join the Musetric test'),
    },
  };
};
