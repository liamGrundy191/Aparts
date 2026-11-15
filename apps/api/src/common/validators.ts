import { isDateOnly } from '@aparts/shared';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

/** For @Transform: trims strings and leaves every other value for the validators to reject. */
export const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

/** A real calendar date written as YYYY-MM-DD. The same check the web forms run. */
export function IsDateOnly(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isDateOnly',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) => typeof value === 'string' && isDateOnly(value),
        defaultMessage: ({ property }: ValidationArguments) =>
          `${property} must be a date like 2026-01-31`,
      },
    });
}

/** This YYYY-MM-DD date must be later than the one in `otherProperty`. */
export function IsAfterDate(otherProperty: string, options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isAfterDate',
      target: object.constructor,
      propertyName,
      constraints: [otherProperty],
      options,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const other = (args.object as Record<string, unknown>)[otherProperty];
          // YYYY-MM-DD strings sort the same way as the dates they stand for
          return typeof value === 'string' && typeof other === 'string' && value > other;
        },
        defaultMessage: ({ property }: ValidationArguments) =>
          `${property} must be after ${otherProperty}`,
      },
    });
}
