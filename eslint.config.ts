import { createRequire } from 'node:module';
import { config } from '@musetric/eslint-config';

const require = createRequire(import.meta.url);
const resolvePlugin = require('eslint-import-resolver-typescript');

const musetricConfig = config();

const override = {
  settings: {
    'import-x/resolver': resolvePlugin.createTypeScriptImportResolver({
      conditionNames: ['import', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.cts', '.mts', '.js', '.jsx', '.cjs', '.mjs'],
    }),
    'import-x/resolver-next': resolvePlugin.createTypeScriptImportResolver({
      conditionNames: ['import', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.cts', '.mts', '.js', '.jsx', '.cjs', '.mjs'],
    }),
  },
};

export default [...musetricConfig, override];