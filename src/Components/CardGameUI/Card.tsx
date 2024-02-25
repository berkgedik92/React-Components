export default class Card {
    
    protected attributes: Map<string, string | number | boolean> = new Map<string, string | number | boolean>();

    public getAttribute(key: string): string | number | boolean {
        let result: string | number | boolean | undefined = this.attributes.get(key);
        if (result === undefined) {
            throw new Error("Card does not have attribute " + key);
        }
        return this.attributes.get(key)!;
    }

    public putAttribute(key: string, obj: string | number | boolean) {
        this.attributes.set(key, obj);
    }

    public setAttributes(newAttr: Map<string, string | number | boolean>) {
        this.attributes = newAttr;
    }

    public getAttributes(): Map<string, string | number | boolean> {
        return this.attributes;
    }

    public static fromJson(data: any): Card {
        let card: Card = new Card();
        let keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            card.putAttribute(keys[i], data[keys[i]]);
        }
        return card;
    }
}
