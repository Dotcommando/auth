import { ValidateIf, ValidationOptions } from 'class-validator';

export function ValidateIfNull(validationOptions?: ValidationOptions) {
  return ValidateIf((object, value) => value !== undefined, validationOptions);
}
