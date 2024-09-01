import {
  buildMessage,
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';


export function NotNull(validationOptions?: ValidationOptions) {
  return ValidateBy({
    name: 'NotNull',
    validator: {
      validate: (value, args?: ValidationArguments) => value !== null && value !== '' && value !== 'null' && value !== 'undefined',
      defaultMessage: buildMessage(eachPrefix => eachPrefix + '$property should not be empty', validationOptions),
    },
  }, validationOptions);
}
