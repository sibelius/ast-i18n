import { getStableKey } from '../stableString';

it('should handle convert to lowercase', () => {
  expect(getStableKey('AWESOME')).toBe('awesome');
});

it('should transform white space to underscore', () => {
  expect(getStableKey('AWESOME wOrk')).toBe('awesome_work');
});

it('should not add underscore because of start white space', () => {
  expect(getStableKey('       AWESOME wOrk')).toBe('awesome_work');
});

it('should not add underscore because of end white space', () => {
  expect(getStableKey('       AWESOME wOrk           ')).toBe('awesome_work');
});

it('should not add multiple underscores because of multiple white spaces', () => {
  expect(getStableKey('       AWESOME         wOrk           ')).toBe('awesome_work');
});

it('should remove diacrits', () => {
  expect(getStableKey('Olá Brasil')).toBe('ola_brasil');
});

// TODO - figure it out how to remove this ×
it.skip('handle weird chars', () => {
  expect(getStableKey('×_fechar'), 'x_fechar');
});
