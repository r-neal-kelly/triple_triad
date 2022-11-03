import * as Pack from "../pack";
import * as Tier from "../tier";
import { Index } from "./index";
import { Name } from "./name";
import { Rank } from "./rank";
import { Element } from "./element";
import { Image } from "./image";
import { JSON } from "./json";

/* Contains the data for each individual card in a pack. */
export class Instance
{
    private tier: Tier.Instance;
    private index: Index;
    private card_json: JSON;

    constructor(
        {
            tier,
            card_index,
            card_json,
        }: {
            tier: Tier.Instance,
            card_index: Index,
            card_json: JSON,
        }
    )
    {
        this.tier = tier;
        this.index = card_index;
        this.card_json = card_json;

        Object.freeze(this);
    }

    Pack():
        Pack.Instance
    {
        return this.tier.Pack();
    }

    Tier():
        Tier.Instance
    {
        return this.tier;
    }

    Index():
        Index
    {
        return this.index;
    }

    Name():
        Name
    {
        return this.card_json.name;
    }

    Image():
        Image
    {
        return this.card_json.image;
    }

    Element():
        Element
    {
        return this.card_json.element;
    }

    Left():
        Rank
    {
        return this.card_json.left;
    }

    Top():
        Rank
    {
        return this.card_json.top;
    }

    Right():
        Rank
    {
        return this.card_json.right;
    }

    Bottom():
        Rank
    {
        return this.card_json.bottom;
    }
}
