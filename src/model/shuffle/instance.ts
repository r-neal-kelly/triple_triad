import { Random_Integer_Inclusive } from "../../utils";
import { Random_Integer_Exclusive } from "../../utils";

import * as Pack from "../pack";
import * as Tier from "../tier";
import * as Card from "../card";

/* Provides a fine-tuned way to randomly generate a list of cards from an individual pack. */
export class Instance
{
    #pack: Pack.Instance;
    #min_tier_index: Tier.Index;
    #max_tier_index: Tier.Index;

    constructor(
        {
            pack,
            min_tier_index,
            max_tier_index,
        }: {
            pack: Pack.Instance,
            min_tier_index: Tier.Index,
            max_tier_index: Tier.Index,
        },
    )
    {
        if (min_tier_index > max_tier_index) {
            throw new Error(`The min_tier_index cannot be greater than the max_tier_index: ${min_tier_index} > ${max_tier_index}`);
        } else if (max_tier_index >= pack.Tier_Count()) {
            throw new Error(`The max_tier_index includes a non-existent tier in the pack "${pack.Name()}"`);
        } else {
            this.#pack = pack;
            this.#min_tier_index = min_tier_index;
            this.#max_tier_index = max_tier_index;

            Object.freeze(this);
        }
    }

    Pack():
        Pack.Instance
    {
        return this.#pack;
    }

    Min_Tier_Index():
        Tier.Index
    {
        return this.#min_tier_index;
    }

    Max_Tier_Index():
        Tier.Index
    {
        return this.#max_tier_index;
    }

    Cards(card_count: Card.Count):
        Array<Card.Instance>
    {
        // It's guaranteed that at least one card exists in every tier, and that every pack has at least one tier.

        const min_tier_index: Tier.Index = this.Min_Tier_Index();
        const max_tier_index: Tier.Index = this.Max_Tier_Index();

        const results: Array<Card.Instance> = [];
        for (let idx = 0, end = card_count; idx < end; idx += 1) {
            const tier_index: Tier.Index = Random_Integer_Inclusive(min_tier_index, max_tier_index);
            const tier: Tier.Instance = this.#pack.Tier(tier_index);
            results.push(tier.Card(Random_Integer_Exclusive(0, tier.Card_Count())));
        }

        return results;
    }

    Unique_Cards(card_count: Card.Count):
        Array<Card.Instance>
    {
        const pack: Pack.Instance = this.Pack();
        const min_tier_index: Tier.Index = this.Min_Tier_Index();
        const max_tier_index: Tier.Index = this.Max_Tier_Index();

        const cards: Array<Card.Instance> = [];
        for (let idx = min_tier_index, end = max_tier_index + 1; idx < end; idx += 1) {
            cards.push(...pack.Tier(idx).Cards());
        }

        if (card_count > cards.length) {
            throw new Error(`The card_count exceeds the number of available unique cards.`);
        } else {
            const results: Array<Card.Instance> = [];
            for (let idx = 0, end = card_count; idx < end; idx += 1) {
                const card_index: Card.Index = Random_Integer_Exclusive(0, cards.length);
                results.push(cards[card_index]);
                cards[card_index] = cards[cards.length - 1];
                cards.pop();
            }

            return results;
        }
    }
}
