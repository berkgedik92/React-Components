import Card from "./Card";

export default class CardGroup {

    private groupName: string;
    private groupIndex: number;
    private cards: Card[];

    public constructor(groupName: string, groupIndex: number, cards: Card[]) {
        this.groupName = groupName;
        this.groupIndex = groupIndex;
        this.cards = Array.from(cards);
    }

    public static fromJson(data: any): CardGroup {
        return new CardGroup(
            data["groupName"],
            data["groupIndex"],
            data["cards"].map((card: any) => Card.fromJson(card["attributes"]))
        );
    }

    public getGroupName(): string {
        return this.groupName;
    }

    public getGroupIndex(): number {
        return this.groupIndex;
    }

    public addCard(card: Card, index: number) {
        this.cards = this.cards.slice(0, index).concat([card]).concat(this.cards.slice(index, this.cards.length));
    }

    public removeCard(index: number): Card {
        let card = this.cards[index];
        this.cards = this.cards.slice(0, index).concat(this.cards.slice(index + 1, this.cards.length));
        return card;
    }

    public getSize(): number {
        return this.cards.length;
    }

    public getSizeWithPredicate(predicate: any): number {
        if (predicate !== undefined) {
            return this.cards.length;
        }
        return this.cards.filter(predicate).length;
    }

    public getCard(index: number): Card {
        return this.cards[index];
    }

    public getCards(): Array<Card> {
        return this.cards;
    }

    public putCardAttribute(key: string, value: string | number | boolean, cardIndex: number) {
        this.cards[cardIndex].putAttribute(key, value);
    }
}
