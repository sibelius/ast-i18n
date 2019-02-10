import { remove } from 'diacritics';
import slugify from 'slugify';

export const getStableKey = (str: string, keyMaxLenght: number = 40) => {
  const cleanStr = remove(str)
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/ +/g, '_')
    .replace(/\s+/g, '')
    .replace(/[.*+?^${}()|[\]\\\/-:,!"]/g, '')
    .replace(/'+/g, '')
    .replace(/[^\x00-\x7F]/g, "")
    .slice(0, keyMaxLenght);

  return slugify(cleanStr);
};

export const getStableValue = (str: string) => {
  return str
    .trim()
    .replace(/\s+/g, ' ')
};
