import { type KnipConfig } from 'knip';

const config: KnipConfig = {
  includeEntryExports: true,
  ignoreExportsUsedInFile: true,
  ignoreBinaries: ['jscpd', 'editorconfig-checker'],
  ignoreFiles: ['i18next.config.ts'],
};

export default config;
