import { type KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/staticPage.tsx'],
  ignoreIssues: { 'src/staticPage.tsx': ['exports'] },
  includeEntryExports: true,
  ignoreExportsUsedInFile: true,
  ignoreBinaries: ['jscpd', 'editorconfig-checker'],
  ignoreFiles: ['i18next.config.ts'],
};

export default config;
