import { Random_Integer_Inclusive } from "../../utils";
import { Random_Integer_Exclusive } from "../../utils";

import * as Enum from "../enum";
import * as Pack from "../pack";
import * as Tier from "../tier";
import { Instance } from "./instance";

export class Random extends Instance
{
    constructor(
        {
            packs,
            min_difficulty = Enum.Difficulty.VERY_EASY,
            max_difficulty = Enum.Difficulty.VERY_HARD,
            allow_multiple_difficulties = true,
        }: {
            packs: Array<Pack.Instance>,
            min_difficulty?: Enum.Difficulty,
            max_difficulty?: Enum.Difficulty,
            allow_multiple_difficulties?: boolean,
        },
    )
    {
        if (packs.length < 1) {
            throw new Error(`packs must have at least one pack to choose from.`);
        } else if (min_difficulty < 0 || min_difficulty > max_difficulty) {
            throw new Error(
                `min_difficulty of ${min_difficulty} is greater than max_difficulty of ${max_difficulty}.`
            );
        } else {
            const pack: Pack.Instance = packs[Random_Integer_Exclusive(0, packs.length)];

            let min_tier_index: Tier.Index = 0;
            let max_tier_index: Tier.Index = 0;
            if (allow_multiple_difficulties) {
                const from_difficulty: Enum.Difficulty =
                    Random_Integer_Inclusive(min_difficulty, max_difficulty);
                const to_difficulty: Enum.Difficulty =
                    Random_Integer_Inclusive(from_difficulty, max_difficulty);
                const from_tiers_by_difficulty: Array<Tier.Instance> =
                    pack.Tiers_By_Difficulty(from_difficulty);
                const to_tiers_by_difficulty: Array<Tier.Instance> =
                    pack.Tiers_By_Difficulty(to_difficulty);
                min_tier_index = from_tiers_by_difficulty[0].Index();
                max_tier_index = to_tiers_by_difficulty[to_tiers_by_difficulty.length - 1].Index();
            } else {
                const difficulty: Enum.Difficulty =
                    Random_Integer_Inclusive(min_difficulty, max_difficulty);
                const tiers_by_difficulty: Array<Tier.Instance> =
                    pack.Tiers_By_Difficulty(difficulty);
                min_tier_index = tiers_by_difficulty[0].Index();
                max_tier_index = tiers_by_difficulty[tiers_by_difficulty.length - 1].Index();
            }

            super(
                {
                    pack,
                    min_tier_index,
                    max_tier_index,
                }
            );
        }
    }
}
