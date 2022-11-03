import { Index } from "../../types";

import * as Enum from "../enum";
import { Packs } from "../packs";
import { Name } from "./name";
import { JSON } from "./json";
import * as Tier from "../tier";

/* Contains all the tiers and each of their collectible cards. */
export class Instance
{
    private packs: Packs;
    private name: Name;
    private tiers: Array<Tier.Instance>;
    private difficulties: Array<Array<Tier.Instance>>;

    constructor(
        {
            packs,
            pack_json,
        }: {
            packs: Packs,
            pack_json: JSON,
        },
    )
    {
        if (pack_json.tiers.length < Tier.Instance.Min_Count()) {
            throw new Error(`The pack ${pack_json.name} must have at least ${Tier.Instance.Min_Count()} tiers.`);
        } else {
            this.packs = packs;
            this.name = pack_json.name;
            this.tiers = pack_json.tiers.map(function (
                this: Instance,
                tier_json: Tier.JSON,
                tier_index: Tier.Index,
            ):
                Tier.Instance
            {
                Object.freeze(tier_json);

                return new Tier.Instance({
                    pack: this,
                    tier_index,
                    tier_json,
                });
            }, this);
            this.difficulties = [];
            {
                const min_tiers_per_difficulty: Tier.Count =
                    Math.floor(this.Tier_Count() / Enum.Difficulty._COUNT_);
                const counts_per_difficulty: Array<Tier.Count> =
                    new Array(Enum.Difficulty._COUNT_).fill(min_tiers_per_difficulty);
                const tiers_to_distribute: Tier.Count =
                    this.Tier_Count() % Enum.Difficulty._COUNT_;
                if (tiers_to_distribute > 0) {
                    // we favor the right hand side of the array when the count or remainder is even,
                    // thus giving the harder difficulties more cards to deal with.
                    // this calculation requires that count > 0, take > 0, and take < count.
                    const middle_idx_to_distribute: Index =
                        Math.floor(Enum.Difficulty._COUNT_ / 2);
                    const start_idx_to_distribute: Index =
                        middle_idx_to_distribute - (Math.ceil(tiers_to_distribute / 2) - 1);
                    for (let idx = start_idx_to_distribute, end = idx + tiers_to_distribute; idx < end; idx += 1) {
                        counts_per_difficulty[idx] += 1;
                    }
                }

                let tier_idx: Tier.Index = 0;
                for (const count of counts_per_difficulty) {
                    const difficulty: Array<Tier.Instance> = [];
                    for (let count_idx = 0, end = count; count_idx < end; count_idx += 1) {
                        difficulty.push(this.Tier(tier_idx));
                        tier_idx += 1;
                    }
                    this.difficulties.push(difficulty);
                    Object.freeze(difficulty);
                }
            }

            Object.freeze(this);
            Object.freeze(this.tiers);
            Object.freeze(this.difficulties);
        }
    }

    Packs():
        Packs
    {
        return this.packs;
    }

    Name():
        Name
    {
        return this.name;
    }

    Tier_Count():
        Tier.Count
    {
        return this.tiers.length;
    }

    Tier(tier_index: Tier.Index):
        Tier.Instance
    {
        if (tier_index >= 0 && tier_index < this.Tier_Count()) {
            return this.tiers[tier_index];
        } else {
            throw new Error("Invalid tier_index.");
        }
    }

    Tiers():
        Array<Tier.Instance>
    {
        return Array.from(this.tiers);
    }

    Tiers_By_Difficulty(difficulty: Enum.Difficulty):
        Array<Tier.Instance>
    {
        if (
            difficulty == null ||
            difficulty < Enum.Difficulty._FIRST_ ||
            difficulty > Enum.Difficulty._LAST_
        ) {
            throw new Error(`Invalid difficulty: ${difficulty}.`);
        } else {
            return Array.from(this.difficulties[difficulty]);
        }
    }
}
