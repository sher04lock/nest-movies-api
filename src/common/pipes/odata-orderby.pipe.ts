import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class OdataOrderByPipe<T> implements PipeTransform<T> {

    constructor() { }

    async transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            return undefined;
        }

        const [field, sortOrderString] = value.split(" ");

        let sortOrder = sortOrderString === 'desc' ? -1 : 1;

        return {
            [field]: sortOrder,
        };
    }
}
