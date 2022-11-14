import { Float } from "../../types";

import { Random_Boolean } from "../../utils";
import { Random_Float_Inclusive } from "../../utils";
import { Random_Float_Exclusive } from "../../utils";

import * as Enum from "../enum";
import * as Pack from "../pack";
import { Collection } from "../collection";
import * as Shuffle from "../shuffle";
import * as Selection from "../selection";
import * as Color from "../color";
import { Options } from "../options";
import * as Rules from "../rules";
import { Main } from "../main";
import { Index } from "./index";
import * as Arena from "../arena";

export class Instance
{
    private main: Main;
    private index: Index;
    private arena: Arena.Instance;

    constructor(
        {
            main,
            index,
        }: {
            main: Main,
            index: Index,
        },
    )
    {
        this.main = main;
        this.index = index;
        this.arena = Instance.Generate(main.Packs().As_Array());
    }

    Main():
        Main
    {
        return this.main;
    }

    Index():
        Index
    {
        return this.index;
    }

    Arena():
        Arena.Instance
    {
        return this.arena;
    }

    Is_Visible():
        boolean
    {
        return this.Index() === this.Main().Current_Exhibition_Index();
    }

    Regenerate():
        void
    {
        this.arena = Instance.Generate(this.main.Packs().As_Array());
    }

    private static Generate(packs: Array<Pack.Instance>):
        Arena.Instance
    {
        const random_rules: Rules.Random = new Rules.Random({});

        const random_colors: Array<Color.HSLA> = [];
        {
            const hue_interval: Float = 360 / random_rules.Player_Count();
            const hue_start: Float = Random_Float_Exclusive(0.0, hue_interval);
            const saturation: Float = Random_Float_Inclusive(
                Options.Min_Player_Color_Saturation(),
                Options.Max_Player_Color_Saturation(),
            );
            const lightness: Float = Random_Float_Inclusive(
                Options.Min_Player_Color_Lightness(),
                Options.Max_Player_Color_Lightness(),
            );
            const alpha: Float = 0.7;

            for (
                let idx = 0, hue = hue_start, end = random_rules.Player_Count();
                idx < end;
                idx += 1, hue += hue_interval
            ) {
                random_colors.push(new Color.HSLA({
                    hue: hue > 360 ? hue - 360 : hue,
                    saturation: saturation,
                    lightness: lightness,
                    alpha: alpha,
                }));
            }

            random_colors.sort(() => Random_Boolean() ? 1 : -1);
        }

        const random_selections: Array<Selection.Random> = [];
        for (let idx = 0, end = random_rules.Player_Count(); idx < end; idx += 1) {
            random_selections.push(
                new Selection.Random({
                    collection: new Collection({
                        default_shuffle: new Shuffle.Random({
                            packs: packs,
                            min_difficulty: Enum.Difficulty.VERY_EASY,
                            max_difficulty: Enum.Difficulty.VERY_HARD,
                            allow_multiple_difficulties: true,
                        }),
                    }),
                    color: random_colors[idx],
                    is_of_human: false,
                    card_count: random_rules.Selection_Card_Count(),
                })
            );
        }

        return new Arena.Instance({
            rules: random_rules,
            selections: random_selections,
        });
    }
}
