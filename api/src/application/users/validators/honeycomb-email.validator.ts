import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsHoneycombEmail(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isHoneycombEmail',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown, _args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    // Case-insensitive check for @honeycombsoft.com domain
                    // Only exact domain allowed, no subdomains
                    const emailRegex = /^[^\s@]+@honeycombsoft\.com$/i;
                    return emailRegex.test(value);
                },
                defaultMessage(_args: ValidationArguments) {
                    return 'Email must be from @honeycombsoft.com domain';
                },
            },
        });
    };
}
