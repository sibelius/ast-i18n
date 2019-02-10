export const getStableString = (str: string) => {
  return str.toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .split(' ')
    .join('_');
};
