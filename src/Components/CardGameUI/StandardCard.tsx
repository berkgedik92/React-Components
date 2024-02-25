import Card from "./Card";

export default class StandardCard extends Card {

    public constructor(rank: string, suit: string, isJoker: boolean, deck: number) {
        super();
        this.attributes.set("rank", rank);
        this.attributes.set("suit", suit);
        this.attributes.set("isJoker", isJoker);
        this.attributes.set("deck", deck);
    }
}
