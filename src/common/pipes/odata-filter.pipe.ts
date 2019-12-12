import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";
import { createFilter } from 'odata-v4-mongodb'


@Injectable()
export class OdataFilterPipe<T> implements PipeTransform<T> {

    constructor() { }

    async transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            return undefined;
        }

        value = value
            .replace(/contains\(tolower\((.*?)\),(.*?)\)/g, "contains($1, $2)")
            .replace(/startswith\(tolower\((.*?)\),(.*?)\)/g, "startswith($1, $2)")
            .replace(/endswith\(tolower\((.*?)\),(.*?)\)/g, "endswith($1, $2)");
      
        value = value.replace(/'(.*?)'/g, (match, matchGroup) => {
            return `'${encodeURIComponent(matchGroup)}'`;
        });

        return createFilter(value);
    }
}
