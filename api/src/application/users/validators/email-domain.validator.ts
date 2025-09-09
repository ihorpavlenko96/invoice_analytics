import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsEmailFromDomain(domain: string, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isEmailFromDomain',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [domain],
            options: validationOptions,
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    const [allowedDomain] = args.constraints as string[];
                    if (typeof value !== 'string') return false;

                    const emailParts = value.split('@');
                    if (emailParts.length !== 2) return false;

                    const emailDomain = emailParts[1];
                    return emailDomain === allowedDomain;
                },
                defaultMessage(args: ValidationArguments) {
                    const [allowedDomain] = args.constraints as string[];
                    return `Email must be from the @${allowedDomain} domain`;
                },
            },
        });
    };
}
