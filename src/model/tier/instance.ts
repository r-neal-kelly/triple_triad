import * as Enum from "../enum";
import * as Pack from "../pack";
import { Count } from "./count";
import { Index } from "./index";
import { JSON } from "./json";
import * as Card from "../card";

/* Contains all the collectible cards in a single tier of a pack. */
export class Instance
{
    static Min_Count():
        Count
    {
        return Enum.Difficulty._COUNT_;
    }

    private pack: Pack.Instance;
    private index: Index;
    private cards: Array<Card.Instance>;

    constructor(
        {
            pack,
            tier_index,
            tier_json,
        }: {
            pack: Pack.Instance,
            tier_index: Index,
            tier_json: JSON,
        },
    )
    {
        if ((tier_json.length as Card.Count) < 1) {
            throw new Error(`Each tier must have at least one card.`);
        } else {
            this.pack = pack;
            this.index = tier_index;
            this.cards = tier_json.map(function (
                this: Instance,
                card_json: Card.JSON,
                card_index: Card.Index,
            ):
                Card.Instance
            {
                Object.freeze(card_json);

                return new Card.Instance({
                    tier: this,
                    card_index,
                    card_json,
                });
            }, this);

            Object.freeze(this);
            Object.freeze(this.cards);
        }
    }

    Pack():
        Pack.Instance
    {
        return this.pack;
    }

    Index():
        Index
    {
        return this.index;
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

    Cards():
        Array<Card.Instance>
    {
        return Array.from(this.cards);
    }
}
