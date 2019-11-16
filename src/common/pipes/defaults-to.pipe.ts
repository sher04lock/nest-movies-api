import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class DefaultsTo<T> implements PipeTransform<T> {

    constructor(private readonly defaultValue: T) {

    }
    async transform(value: any, metadata: ArgumentMetadata) {
        if (value === undefined || value === null) {
            return this.defaultValue;
        }

        return value;
    }
}
