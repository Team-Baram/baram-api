export * from './crypto.util';
export * from './winston.util';

export const base64urlEncode = (str: string) => {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};
