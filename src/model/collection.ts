import { Random_Integer_Exclusive } from "../utils";

import * as Pack from "./pack";
import * as Card from "./card";
import { Card_And_Count } from "./card_and_count";
import * as Shuffle from "./shuffle";
import * as Player from "./player";

/* Contains a number of cards held by a player and several shuffles from which to generate cards. */
export class Collection
{
    private owner_name: Player.Name;
    private default_shuffle: Shuffle.Instance;
    private shuffle_count: Shuffle.Count;
    private shuffles: { [index: Pack.Name]: Shuffle.Instance };
    private pack_card_and_counts: { [index: Pack.Name]: Array<Card_And_Count> }; // may want to keep each pack sorted

    constructor(
        {
            owner_name = ``,
            default_shuffle,
        }: {
            owner_name?: Player.Name,
            default_shuffle: Shuffle.Instance,
        },
    )
    {
        this.owner_name = owner_name;
        this.default_shuffle = default_shuffle;
        this.shuffle_count = 0;
        this.shuffles = {};
        this.pack_card_and_counts = {};

        this.Add_Shuffle(default_shuffle);
    }

    Owner_Name():
        Player.Name
    {
        return this.owner_name;
    }

    Shuffle_Count():
        Shuffle.Count
    {
        return this.shuffle_count;
    }

    Shuffle(pack_name: Pack.Name):
        Shuffle.Instance
    {
        return this.shuffles[pack_name];
    }

    Default_Shuffle():
        Shuffle.Instance
    {
        return this.default_shuffle;
    }

    Random_Shuffle():
        Shuffle.Instance
    {
        return Object.values(this.shuffles)[Random_Integer_Exclusive(0, this.Shuffle_Count())];
    }

    Add_Shuffle(shuffle: Shuffle.Instance):
        void
    {
        if (this.shuffles[shuffle.Pack().Name()]) {
            throw new Error(`This collection already has a shuffle for the "${shuffle.Pack().Name()}" pack.`);
        } else {
            this.shuffle_count += 1;
            this.shuffles[shuffle.Pack().Name()] = shuffle;
        }
    }

    Remove_Shuffle(pack_name: Pack.Name):
        void
    {
        if (this.shuffles[pack_name]) {
            this.shuffle_count -= 1;
            delete this.shuffles[pack_name];
        }
    }

    Add_Card(
        card: Card.Instance,
        card_count: Card.Count,
    ):
        void
    {

    }

    Remove_Card(
        card: Card.Instance,
        card_count: Card.Count,
    ):
        void
    {

    }

    Random_Cards(
        {
            card_count,
            allow_repeats = true,
            allow_multiple_packs = false,
        }: {
            card_count: Card.Count,
            allow_repeats: boolean,
            allow_multiple_packs: boolean,
        }
    ):
        Array<Card.Instance>
    {
        // we need to be able to select random cards from the card_and_counts too, but for now we'll keep it easy
        // we also need to add the functionality to use multiple packs, but one thing at a time here

        if (allow_repeats) {
            return this.Random_Shuffle().Cards(card_count);
        } else {
            return this.Random_Shuffle().Unique_Cards(card_count);
        }
    }

    Serialize():
        object
    {
        // if we serialize by indices into a pack but the pack is changed, there's no way to know the difference.
        // we could serialize with card names, but that may be overkill here.
        return {};
    }

    Deserialize(save_data: object):
        void
    {

    }
}
