import { Assert } from "../utils";
import { Random_Integer_Exclusive } from "../utils";

import * as Enum from "./enum";
import * as Color from "./color";
import * as Rules from "./rules";
import * as Player from "./player";

export class Options
{
    static Min_Player_Count():
        Player.Count
    {
        return Rules.Instance.Min_Player_Count();
    }

    static Max_Player_Count():
        Player.Count
    {
        return Rules.Instance.Max_Player_Count();
    }

    private rules: Rules.Instance;

    private use_small_board: boolean;

    private player_color_pool: Array<Color.Instance>;
    private player_colors: Array<Color.Instance>;
    private player_color_pool_select_index: Color.Index;

    constructor(
        {
            rules = new Rules.Instance({}),

            use_small_board = true,
        }: {
            rules?: Rules.Instance,

            use_small_board?: boolean,
        },
    )
    {
        this.rules = rules.Clone();

        this.use_small_board = use_small_board;

        this.player_color_pool = new Color.Uniques({
            color_count: 10,
            max_value: 152,
            alpha: 0.7,
            from_radians_z: 1.5,
            radians_x: 0.0,
            orientation: Enum.RGBA.BLUE,
        }).Colors();
        this.player_colors = [];
        this.player_color_pool_select_index = 0;

        Assert(rules.Player_Count() <= this.player_color_pool.length);
        for (let idx = 0, end = rules.Player_Count(); idx < end; idx += 1) {
            this.Increment_Player_Colors();
        }
    }

    Rules():
        Rules.Instance
    {
        return this.rules;
    }

    Use_Small_Board():
        boolean
    {
        return this.use_small_board;
    }

    Player_Count():
        Player.Count
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());

        return this.Rules().Player_Count();
    }

    Can_Decrement_Player_Count():
        boolean
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());

        return this.Rules().Can_Decrement_Player_Count();
    }

    Can_Increment_Player_Count():
        boolean
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());

        return this.Rules().Can_Increment_Player_Count();
    }

    Decrement_Player_Count():
        void
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());
        Assert(this.Can_Decrement_Player_Count());

        this.Rules().Decrement_Player_Count();
        this.Decrement_Player_Colors();
    }

    Increment_Player_Count():
        void
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());
        Assert(this.Can_Increment_Player_Count());

        this.Rules().Increment_Player_Count();
        this.Increment_Player_Colors();
    }

    private Decrement_Player_Colors():
        void
    {
        this.player_color_pool.push(this.player_colors.pop() as Color.Instance);
    }

    private Increment_Player_Colors():
        void
    {
        Assert(this.player_color_pool.length > 0);

        const pool_index: Color.Index =
            Random_Integer_Exclusive(0, this.player_color_pool.length);

        this.player_colors.push(this.player_color_pool[pool_index]);
        this.player_color_pool[pool_index] =
            this.player_color_pool[this.player_color_pool.length - 1];
        this.player_color_pool.pop();
    }

    Player_Color_Count():
        Color.Count
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());

        return this.player_colors.length;
    }

    Player_Color(player_color_index: Color.Index):
        Color.Instance
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());
        Assert(
            player_color_index != null &&
            player_color_index >= 0 &&
            player_color_index < this.player_colors.length
        );

        return this.player_colors[player_color_index];
    }

    Player_Colors():
        Array<Color.Instance>
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());

        return Array.from(this.player_colors);
    }

    Select_Previous_Player_Color(player_color_index: Color.Index):
        Color.Instance
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());
        Assert(
            player_color_index != null &&
            player_color_index >= 0 &&
            player_color_index < this.player_colors.length
        );

        if (this.player_color_pool.length > 0) {
            if (
                this.player_color_pool_select_index > this.player_color_pool.length ||
                this.player_color_pool_select_index === 0
            ) {
                this.player_color_pool_select_index = this.player_color_pool.length;
            }
            this.player_color_pool_select_index -= 1;

            const old_color: Color.Instance =
                this.player_colors[player_color_index];
            const new_color: Color.Instance =
                this.player_color_pool[this.player_color_pool_select_index];

            this.player_colors[player_color_index] = new_color;
            this.player_color_pool[this.player_color_pool_select_index] = old_color;

            return new_color;
        } else {
            return this.player_colors[player_color_index];
        }
    }

    Select_Next_Player_Color(player_color_index: Color.Index):
        Color.Instance
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());
        Assert(
            player_color_index != null &&
            player_color_index >= 0 &&
            player_color_index < this.player_colors.length
        );

        if (this.player_color_pool.length > 0) {
            this.player_color_pool_select_index += 1;
            if (this.player_color_pool_select_index >= this.player_color_pool.length) {
                this.player_color_pool_select_index = 0;
            }
            const old_color: Color.Instance =
                this.player_colors[player_color_index];
            const new_color: Color.Instance =
                this.player_color_pool[this.player_color_pool_select_index];

            this.player_colors[player_color_index] = new_color;
            this.player_color_pool[this.player_color_pool_select_index] = old_color;

            return new_color;
        } else {
            return this.player_colors[player_color_index];
        }
    }
}
