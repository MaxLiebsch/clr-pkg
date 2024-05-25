export interface Infos {
    total: number;
    new: number;
    old: number;
    missingProperties: {
        name: number;
        price: number;
        link: number;
        image: number;
    }
}