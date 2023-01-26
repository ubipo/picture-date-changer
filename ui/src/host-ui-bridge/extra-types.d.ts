import type { Media } from './generated-bindings';

export interface MediaWithDateTime extends Media {
    dateTime: string;
}
