import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsNotEmpty, IsNumberString, Validate } from 'class-validator';

export class OrderDto {

    @IsOptional()
    @IsString()
    email: string;

    @IsOptional()
    @IsNumberString({ no_symbols: true }, { message: 'Phone number must be a valid number' })
    @Validate(({ value }) => {
        const phoneNumber = parseInt(value, 10);
        if (isNaN(phoneNumber)) {
            throw new Error('Phone number must be a valid number');
        }
        return true;
    })
    phoneNumber: number;
}

export class ContactResponseDto {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];

    constructor(
        primaryContactId: number,
        emails: string[],
        phoneNumbers: string[],
        secondaryContactIds: number[]
    ) {
        this.primaryContactId = primaryContactId;
        this.emails = emails;
        this.phoneNumbers = phoneNumbers;
        this.secondaryContactIds = secondaryContactIds;
        return this;
    }
}
