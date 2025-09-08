import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

export function IsHoneycombEmail(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isHoneycombEmail',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    
                    return value.toLowerCase().endsWith('@honeycombsoft.com');
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be from the @honeycombsoft.com domain`;
                },
            },
        });
    };
}