import { Integer } from "../types";
import { Index } from "../types";
import { Float } from "../types";

import { Assert } from "../utils";
import { Random_Integer_Exclusive } from "../utils";

import * as Enum from "./enum";
import * as Color from "./color";
import * as Rules from "./rules";
import * as Player from "./player";

type Color_And_Index = {
    color: Color.Instance;
    index: Color.Index;
}

type Color_Palette = {
    x: Float;
    y: Float;
    z: Float;
    orientation: Enum.RGBA;
}

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

    static Min_Player_Color_Brightness():
        Integer
    {
        return (
            this.Default_Player_Color_Brightness() -
            (this.Player_Color_Brightness_Interval() * 8)
        );
    }

    static Max_Player_Color_Brightness():
        Integer
    {
        return (
            this.Default_Player_Color_Brightness() +
            (this.Player_Color_Brightness_Interval() * 12)
        );
    }

    static Default_Player_Color_Brightness():
        Integer
    {
        return 152;
    }

    static Player_Color_Brightness_Interval():
        Integer
    {
        return 8;
    }

    static Color_Palettes():
        Array<Color_Palette>
    {
        return [
            {
                x: 0.0,
                y: 0.0,
                z: 1.5,
                orientation: Enum.RGBA.BLUE,
            },
            {
                x: 0.0,
                y: 0.0,
                z: 1.5,
                orientation: Enum.RGBA.GREEN,
            },
            {
                x: 0.0,
                y: 0.0,
                z: 1.5,
                orientation: Enum.RGBA.RED,
            },
        ];
    }

    private rules: Rules.Instance;

    private measurement: Enum.Measurement;
    private use_small_board: boolean;

    private player_types: Array<Player.Type>;

    private player_color_brightness: Float;
    private player_color_palettes: Array<Color_Palette>;
    private player_color_palette_index: Index;
    private player_color_pool: Array<Color_And_Index>;
    private player_colors: Array<Color_And_Index>;
    private player_color_pool_select_index: Color.Index;

    constructor(
        {
            rules = new Rules.Instance({}),

            measurement = Enum.Measurement.BEST_FIT,
            use_small_board = true,
        }: {
            rules?: Rules.Instance,

            measurement?: Enum.Measurement,
            use_small_board?: boolean,
        },
    )
    {
        this.rules = rules.Clone();

        this.measurement = measurement;
        this.use_small_board = use_small_board;

        this.player_types = [];
        this.player_types.push(Player.Type.HUMAN);
        for (let idx = 0, end = this.rules.Player_Count() - 1; idx < end; idx += 1) {
            this.player_types.push(Player.Type.COMPUTER);
        }
        Assert(this.player_types.length === this.rules.Player_Count());

        this.player_color_brightness = Options.Default_Player_Color_Brightness();
        this.player_color_palettes = Options.Color_Palettes();
        this.player_color_palette_index = 0;
        this.player_color_pool = new Color.Uniques({
            color_count: 10,
            max_value: this.player_color_brightness,
            alpha: 0.7,
            from_radians_z: this.player_color_palettes[this.player_color_palette_index].z,
            radians_x: this.player_color_palettes[this.player_color_palette_index].x,
            orientation: this.player_color_palettes[this.player_color_palette_index].orientation,
        }).Colors().map(function (
            color: Color.Instance,
            index: Color.Index,
        ):
            Color_And_Index
        {
            return ({
                color: color,
                index: index,
            });
        });
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

    Measurement():
        Enum.Measurement
    {
        return this.measurement;
    }

    Change_Measurement(measurement: Enum.Measurement):
        void
    {
        Assert(measurement != null);
        Assert(measurement >= Enum.Measurement._FIRST_);
        Assert(measurement <= Enum.Measurement._LAST_);

        this.measurement = measurement;
    }

    Toggle_Measurement():
        void
    {
        if (this.measurement < Enum.Measurement._LAST_) {
            this.measurement += 1;
        } else {
            this.measurement = Enum.Measurement._FIRST_;
        }
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
        this.Decrement_Player_Types();
        this.Decrement_Player_Colors();
    }

    Increment_Player_Count():
        void
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());
        Assert(this.Can_Increment_Player_Count());

        this.Rules().Increment_Player_Count();
        this.Increment_Player_Types();
        this.Increment_Player_Colors();
    }

    Player_Type(
        player_index: Player.Index,
    ):
        Player.Type
    {
        Assert(
            player_index != null &&
            player_index >= 0 &&
            player_index < this.player_types.length
        );

        return this.player_types[player_index];
    }

    Change_Player_Type(
        player_index: Player.Index,
        player_type: Player.Type,
    ):
        void
    {
        Assert(
            player_index != null &&
            player_index >= 0 &&
            player_index < this.player_types.length
        );

        this.player_types[player_index] = player_type;
    }

    Toggle_Player_Type(
        player_index: Player.Index,
    ):
        void
    {
        Assert(
            player_index != null &&
            player_index >= 0 &&
            player_index < this.player_types.length
        );

        if (this.player_types[player_index] === Player.Type.HUMAN) {
            this.player_types[player_index] = Player.Type.COMPUTER;
        } else {
            this.player_types[player_index] = Player.Type.HUMAN;
        }
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

        return this.player_colors[player_color_index].color;
    }

    Player_Colors():
        Array<Color.Instance>
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());

        const results: Array<Color.Instance> = [];
        for (const { color } of this.player_colors) {
            results.push(color);
        }

        return results;
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

            const old_color: Color_And_Index =
                this.player_colors[player_color_index];
            const new_color: Color_And_Index =
                this.player_color_pool[this.player_color_pool_select_index];

            this.player_colors[player_color_index] = new_color;
            this.player_color_pool[this.player_color_pool_select_index] = old_color;

            return new_color.color;
        } else {
            return this.player_colors[player_color_index].color;
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
            const old_color: Color_And_Index =
                this.player_colors[player_color_index];
            const new_color: Color_And_Index =
                this.player_color_pool[this.player_color_pool_select_index];

            this.player_colors[player_color_index] = new_color;
            this.player_color_pool[this.player_color_pool_select_index] = old_color;

            return new_color.color;
        } else {
            return this.player_colors[player_color_index].color;
        }
    }

    Player_Color_Brightness_Index():
        Index
    {
        const default_brightness: Integer = Options.Default_Player_Color_Brightness();

        if (this.player_color_brightness < default_brightness) {
            return -(
                (default_brightness - this.player_color_brightness) /
                Options.Player_Color_Brightness_Interval()
            );
        } else {
            return (
                (this.player_color_brightness - default_brightness) /
                Options.Player_Color_Brightness_Interval()
            );
        }
    }

    Can_Decrement_Player_Color_Brightness():
        boolean
    {
        return this.player_color_brightness > Options.Min_Player_Color_Brightness();
    }

    Can_Increment_Player_Color_Brightness():
        boolean
    {
        return this.player_color_brightness < Options.Max_Player_Color_Brightness();
    }

    Decrement_Player_Color_Brightness():
        void
    {
        Assert(this.Can_Decrement_Player_Color_Brightness());

        this.player_color_brightness -= Options.Player_Color_Brightness_Interval();

        this.Update_Player_Colors_And_Pool();
    }

    Increment_Player_Color_Brightness():
        void
    {
        Assert(this.Can_Increment_Player_Color_Brightness());

        this.player_color_brightness += Options.Player_Color_Brightness_Interval();

        this.Update_Player_Colors_And_Pool();
    }

    Player_Color_Palette_Index():
        Index
    {
        return this.player_color_palette_index;
    }

    Can_Decrement_Player_Color_Palette():
        boolean
    {
        return this.player_color_palette_index > 0;
    }

    Can_Increment_Player_Color_Palette():
        boolean
    {
        return this.player_color_palette_index < this.player_color_palettes.length - 1;
    }

    Decrement_Player_Color_Palette():
        void
    {
        Assert(this.Can_Decrement_Player_Color_Palette());

        this.player_color_palette_index -= 1;

        this.Update_Player_Colors_And_Pool();
    }

    Increment_Player_Color_Palette():
        void
    {
        Assert(this.Can_Increment_Player_Color_Palette());

        this.player_color_palette_index += 1;

        this.Update_Player_Colors_And_Pool();
    }

    private Decrement_Player_Types():
        void
    {
        this.player_types.pop();
    }

    private Increment_Player_Types():
        void
    {
        this.player_types.push(Player.Type.COMPUTER);
    }

    private Decrement_Player_Colors():
        void
    {
        this.player_color_pool.push(this.player_colors.pop() as Color_And_Index);
    }

    private Increment_Player_Colors():
        void
    {
        Assert(this.player_color_pool.length > 0);

        let pool_index: Color.Index;
        if (this.player_colors.length === 0) {
            pool_index = Random_Integer_Exclusive(0, this.player_color_pool.length);
        } else {
            pool_index =
                this.player_color_pool.map(function (
                    this: Options,
                    color: Color_And_Index,
                    index: Color.Index,
                ):
                    [Color.Index, Float]
                {
                    let total_difference: Float = 0.0;
                    for (let idx = 0, end = this.player_colors.length; idx < end; idx += 1) {
                        total_difference +=
                            this.player_colors[idx].color.Percent_Difference_From(color.color);
                    }

                    return [index, total_difference / this.player_colors.length];
                }, this).sort(function (
                    a: [Color.Index, Float],
                    b: [Color.Index, Float],
                ):
                    number
                {
                    return b[1] - a[1];
                })[0][0];
        }

        this.player_colors.push(this.player_color_pool[pool_index]);
        this.player_color_pool[pool_index] =
            this.player_color_pool[this.player_color_pool.length - 1];
        this.player_color_pool.pop();
    }

    private Update_Player_Colors_And_Pool():
        void
    {
        const new_colors: Array<Color.Instance> =
            new Color.Uniques({
                color_count: 10,
                max_value: this.player_color_brightness,
                alpha: 0.7,
                from_radians_z: this.player_color_palettes[this.player_color_palette_index].z,
                radians_x: this.player_color_palettes[this.player_color_palette_index].x,
                orientation: this.player_color_palettes[this.player_color_palette_index].orientation,
            }).Colors();

        for (let idx = 0, end = this.player_color_pool.length; idx < end; idx += 1) {
            const new_color_index: Color.Index = this.player_color_pool[idx].index;
            this.player_color_pool[idx] = {
                color: new_colors[new_color_index],
                index: new_color_index,
            };
        }
        for (let idx = 0, end = this.player_colors.length; idx < end; idx += 1) {
            const new_color_index: Color.Index = this.player_colors[idx].index;
            this.player_colors[idx] = {
                color: new_colors[new_color_index],
                index: new_color_index,
            };
        }
    }
}
