export const getStableString = (str: string) => {
  return str.toLocaleLowerCase().split(' ').join('_');
};
