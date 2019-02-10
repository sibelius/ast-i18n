import { remove } from 'diacritics';

export const getStableKey = (str: string, keyMaxLenght: number = 40) => {
  return remove(str).toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/ +/g, '_')
    .replace(/\s+/g, '')
    .replace(/[.*+?^${}()|[\]\\\/-:,"]/g, '')
    .replace(/'+/g, '')
    .replace(/[^\x00-\x7F]/g, "")
    .slice(0, keyMaxLenght);
};

export const getStableValue = (str: string) => {
  return str
    .trim()
    .replace(/\s+/g, ' ')
};
