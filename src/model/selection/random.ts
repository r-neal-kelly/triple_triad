import * as Card from "../card";
import * as Color from "../color";
import { Collection } from "../collection";
import { Instance } from "./instance";

/* Utilizes random generation of cards to create a selection. */
export class Random extends Instance
{
    constructor(
        {
            collection,
            color,
            is_of_human,

            card_count,
            allow_repeats = true,
            allow_multiple_packs = false,
        }: {
            collection: Collection,
            color: Color.Instance,
            is_of_human: boolean,

            card_count: Card.Count,
            allow_repeats?: boolean,
            allow_multiple_packs?: boolean,
        }
    )
    {
        if (card_count < 1) {
            throw new Error(`'card_count' must be greater than 0 for a selection.`);
        } else {
            const cards: Array<Card.Instance> = collection.Random_Cards({
                card_count,
                allow_repeats,
                allow_multiple_packs,
            });

            super({
                collection,
                color,
                cards,
                is_of_human,
            });
        }
    }
}
