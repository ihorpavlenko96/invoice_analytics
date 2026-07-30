import clientConfig from './client/eslint.config.js';

const prefixPattern = (pattern) => {
  if (pattern.startsWith('**/')) {
    return `client/${pattern}`;
  }

  return `client/${pattern}`;
};

export default clientConfig.map((config) => ({
  ...config,
  files: config.files?.map(prefixPattern),
  ignores: config.ignores?.map(prefixPattern),
}));
