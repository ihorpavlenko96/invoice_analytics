import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsHoneycombEmailConstraint implements ValidatorConstraintInterface {
    validate(email: string, args: ValidationArguments) {
        if (!email) return true; // Let @IsEmail() and @IsNotEmpty() handle empty values

        const domain = email.split('@')[1];
        return domain && domain.toLowerCase() === 'honeycombsoft.com';
    }

    defaultMessage(args: ValidationArguments) {
        return 'Invalid email domain. Please use your @honeycombsoft.com email address';
    }
}

export function IsHoneycombEmail(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsHoneycombEmailConstraint,
        });
    };
}
