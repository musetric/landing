import { useSyncExternalStore } from 'react';

export type Platform = 'ios' | 'android' | 'mac' | 'windows';

export const platforms: Platform[] = ['ios', 'android', 'mac', 'windows'];

export type Device = Platform | 'unknown';

const readDevice = (): Device => {
  const { userAgent, maxTouchPoints } = navigator;
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return 'ios';
  }
  if (/Macintosh/.test(userAgent)) {
    return maxTouchPoints > 1 ? 'ios' : 'mac';
  }
  if (/Android/.test(userAgent)) {
    return 'android';
  }
  if (/Windows/.test(userAgent)) {
    return 'windows';
  }
  return 'unknown';
};

const readServerDevice = (): Device => 'unknown';

const subscribe = (): (() => void) => () => undefined;

export const useDevice = (): Device =>
  useSyncExternalStore(subscribe, readDevice, readServerDevice);
