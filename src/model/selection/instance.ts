import * as Card from "../card";
import * as Color from "../color";
import { Collection } from "../collection";

/* Contains a list of individual cards drawn from a collection and their color, with possible repeats. */
export class Instance
{
    private collection: Collection;
    private color: Color.Instance;
    private cards: Array<Card.Instance>;
    private is_of_human: boolean;

    constructor(
        {
            collection,
            color,
            cards,
            is_of_human,
        }: {
            collection: Collection,
            color: Color.Instance,
            cards: Array<Card.Instance>,
            is_of_human: boolean,
        }
    )
    {
        if (cards.length < 1) {
            throw new Error(`Must have a least one card in the selection.`);
        } else {
            this.collection = collection;
            this.color = color;
            this.cards = Array.from(cards);
            this.is_of_human = is_of_human;

            Object.freeze(this);
            Object.freeze(this.cards);
        }
    }

    Collection():
        Collection
    {
        return this.collection;
    }

    Color():
        Color.Instance
    {
        return this.color;
    }

    Is_Of_Human():
        boolean
    {
        return this.is_of_human;
    }

    Is_Of_Computer():
        boolean
    {
        return !this.Is_Of_Human();
    }

    Card_Count():
        Card.Count
    {
        return this.cards.length;
    }

    Card(card_index: Card.Index):
        Card.Instance
    {
        if (card_index >= 0 && card_index < this.Card_Count()) {
            return this.cards[card_index];
        } else {
            throw new Error("Invalid card_index.");
        }
    }
}
