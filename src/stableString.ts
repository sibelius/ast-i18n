// import { remove } from 'diacritics';
export const getStableKey = (str: string) => {
  return str.toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/ +/g, '_')
    .replace(/\s+/g, '')
};

export const getStableValue = (str: string) => {
  return str.toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
};
