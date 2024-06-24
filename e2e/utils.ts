import { customAlphabet } from 'nanoid';

const alphanumericAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const alphanumericId = (length: number) => {
  return customAlphabet(alphanumericAlphabet)(length);
};
