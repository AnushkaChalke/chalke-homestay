import { format, isValid, parse, parseISO } from 'date-fns';

export const DATE_INPUT_FORMAT = 'dd-MM-yyyy';

export function parseFlexibleDate(value: string) {
  if (!value) return null;

  const isoMatch = /^\d{4}-\d{2}-\d{2}/.test(value);
  const parsed = isoMatch ? parseISO(value) : parse(value, DATE_INPUT_FORMAT, new Date());

  return isValid(parsed) ? parsed : null;
}

export function formatDateInputValue(value: string | Date | null | undefined) {
  if (!value) return '';

  const parsed = typeof value === 'string' ? parseFlexibleDate(value) : value;
  return parsed && isValid(parsed) ? format(parsed, DATE_INPUT_FORMAT) : '';
}

export function toIsoDateString(value: string) {
  const parsed = parseFlexibleDate(value);
  return parsed ? format(parsed, 'yyyy-MM-dd') : '';
}