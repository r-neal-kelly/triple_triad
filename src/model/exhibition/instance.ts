import * as Enum from "../enum";
import * as Pack from "../pack";
import { Collection } from "../collection";
import * as Shuffle from "../shuffle";
import * as Selection from "../selection";
import * as Color from "../color";
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

        const random_colors: Color.Uniques = new Color.Uniques({
            max_value: 191,
            color_count: random_rules.Player_Count(),
        });

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
                    color: random_colors.Color(idx),
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
