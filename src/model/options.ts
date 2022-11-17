import { Integer } from "../types";
import { Index } from "../types";
import { Float } from "../types";

import { Assert } from "../utils";
import { Random_Integer_Exclusive } from "../utils";

import * as Enum from "./enum";
import * as Color from "./color";
import * as Rules from "./rules";
import * as Player from "./player";

export class Options
{
    static Default_Animation_Time():
        Float
    {
        return 1.0;
    }

    static Min_Animation_Time():
        Float
    {
        return 0.0;
    }

    static Max_Animation_Time():
        Float
    {
        return 2.0;
    }

    static Animation_Time_Interval():
        Float
    {
        return 0.1;
    }

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

    static Player_Color_Pool_Count():
        Integer
    {
        return 12;
    }

    static Default_Player_Color_Palette():
        Float
    {
        return 0.0;
    }

    static Player_Color_Palette_Interval():
        Float
    {
        return (360.0 / Options.Player_Color_Pool_Count()) / 6;
    }

    static Min_Player_Color_Palette():
        Float
    {
        return 0.0;
    }

    static Max_Player_Color_Palette():
        Float
    {
        return (
            (360.0 / Options.Player_Color_Pool_Count()) -
            this.Player_Color_Palette_Interval()
        );
    }

    static Default_Player_Color_Saturation():
        Float
    {
        return 50.0;
    }

    static Player_Color_Saturation_Interval():
        Float
    {
        return 5.0;
    }

    static Min_Player_Color_Saturation():
        Float
    {
        return (
            this.Default_Player_Color_Saturation() -
            (this.Player_Color_Saturation_Interval() * 2)
        );
    }

    static Max_Player_Color_Saturation():
        Float
    {
        return (
            this.Default_Player_Color_Saturation() +
            (this.Player_Color_Saturation_Interval() * 8)
        );
    }

    static Default_Player_Color_Lightness():
        Float
    {
        return 40.0;
    }

    static Player_Color_Lightness_Interval():
        Float
    {
        return 3.0;
    }

    static Min_Player_Color_Lightness():
        Float
    {
        return (
            this.Default_Player_Color_Lightness() -
            (this.Player_Color_Lightness_Interval() * 6)
        );
    }

    static Max_Player_Color_Lightness():
        Float
    {
        return (
            this.Default_Player_Color_Lightness() +
            (this.Player_Color_Lightness_Interval() * 6)
        );
    }

    private rules: Rules.Instance;

    private measurement: Enum.Measurement;
    private use_small_board: boolean;

    private animation_time: Float;

    private player_types: Array<Player.Type>;

    private player_color_palette: Float;
    private player_color_saturation: Float;
    private player_color_lightness: Float;
    private player_color_alpha: Float;
    private player_color_pool: Array<Color.HSLA>;
    private player_colors: Array<Color.HSLA>;
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

        this.animation_time = Options.Default_Animation_Time();

        this.player_types = [];
        this.player_types.push(Player.Type.HUMAN);
        for (let idx = 0, end = this.rules.Player_Count() - 1; idx < end; idx += 1) {
            this.player_types.push(Player.Type.COMPUTER);
        }
        Assert(this.player_types.length === this.rules.Player_Count());

        this.player_color_palette = Options.Default_Player_Color_Palette();
        this.player_color_saturation = Options.Default_Player_Color_Saturation();
        this.player_color_lightness = Options.Default_Player_Color_Lightness();
        this.player_color_alpha = 0.7;
        this.player_color_pool = [];
        this.player_colors = [];
        this.player_color_pool_select_index = 0;

        const hue_interval: Float = 360.0 / Options.Player_Color_Pool_Count();
        for (let hue = 0, end = 360; hue < end; hue += hue_interval) {
            this.player_color_pool.push(new Color.HSLA({
                hue: hue + this.player_color_palette,
                saturation: this.player_color_saturation,
                lightness: this.player_color_lightness,
                alpha: this.player_color_alpha,
            }));
        }

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

    Animation_Time():
        Float
    {
        return this.animation_time;
    }

    Can_Decrement_Animation_Time():
        boolean
    {
        return this.animation_time > Options.Min_Animation_Time();
    }

    Can_Increment_Animation_Time():
        boolean
    {
        return this.animation_time < Options.Max_Animation_Time();
    }

    Decrement_Animation_Time():
        void
    {
        Assert(this.Can_Decrement_Animation_Time());

        this.animation_time -= Options.Animation_Time_Interval();
        if (this.animation_time < Options.Min_Animation_Time()) {
            this.animation_time = Options.Min_Animation_Time();
        }
    }

    Increment_Animation_Time():
        void
    {
        Assert(this.Can_Increment_Animation_Time());

        this.animation_time += Options.Animation_Time_Interval();
        if (this.animation_time > Options.Max_Animation_Time()) {
            this.animation_time = Options.Max_Animation_Time();
        }
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
        Color.HSLA
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
        Array<Color.HSLA>
    {
        Assert(this.player_colors.length === this.Rules().Player_Count());

        return Array.from(this.player_colors);
    }

    Select_Previous_Player_Color(player_color_index: Color.Index):
        Color.HSLA
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

            const old_color: Color.HSLA =
                this.player_colors[player_color_index];
            const new_color: Color.HSLA =
                this.player_color_pool[this.player_color_pool_select_index];

            this.player_colors[player_color_index] = new_color;
            this.player_color_pool[this.player_color_pool_select_index] = old_color;

            return new_color;
        } else {
            return this.player_colors[player_color_index];
        }
    }

    Select_Next_Player_Color(player_color_index: Color.Index):
        Color.HSLA
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
            const old_color: Color.HSLA =
                this.player_colors[player_color_index];
            const new_color: Color.HSLA =
                this.player_color_pool[this.player_color_pool_select_index];

            this.player_colors[player_color_index] = new_color;
            this.player_color_pool[this.player_color_pool_select_index] = old_color;

            return new_color;
        } else {
            return this.player_colors[player_color_index];
        }
    }

    Player_Color_Palette_Index():
        Index
    {
        const default_palette: Float = Options.Default_Player_Color_Palette();

        if (this.player_color_palette < default_palette) {
            return -(
                (default_palette - this.player_color_palette) /
                Options.Player_Color_Palette_Interval()
            );
        } else {
            return (
                (this.player_color_palette - default_palette) /
                Options.Player_Color_Palette_Interval()
            );
        }
    }

    Can_Decrement_Player_Color_Palette():
        boolean
    {
        return this.player_color_palette > Options.Min_Player_Color_Palette();
    }

    Can_Increment_Player_Color_Palette():
        boolean
    {
        return this.player_color_palette < Options.Max_Player_Color_Palette();
    }

    Decrement_Player_Color_Palette():
        void
    {
        Assert(this.Can_Decrement_Player_Color_Palette());

        const interval: Float = Options.Player_Color_Palette_Interval();

        this.player_color_palette -= interval;

        for (let idx = 0, end = this.player_color_pool.length; idx < end; idx += 1) {
            this.player_color_pool[idx] = new Color.HSLA({
                hue: this.player_color_pool[idx].Hue() - interval,
                saturation: this.player_color_saturation,
                lightness: this.player_color_lightness,
                alpha: this.player_color_alpha,
            });
        }
        for (let idx = 0, end = this.player_colors.length; idx < end; idx += 1) {
            this.player_colors[idx] = new Color.HSLA({
                hue: this.player_colors[idx].Hue() - interval,
                saturation: this.player_color_saturation,
                lightness: this.player_color_lightness,
                alpha: this.player_color_alpha,
            });
        }
    }

    Increment_Player_Color_Palette():
        void
    {
        Assert(this.Can_Increment_Player_Color_Palette());

        const interval: Float = Options.Player_Color_Palette_Interval();

        this.player_color_palette += interval;

        for (let idx = 0, end = this.player_color_pool.length; idx < end; idx += 1) {
            this.player_color_pool[idx] = new Color.HSLA({
                hue: this.player_color_pool[idx].Hue() + interval,
                saturation: this.player_color_saturation,
                lightness: this.player_color_lightness,
                alpha: this.player_color_alpha,
            });
        }
        for (let idx = 0, end = this.player_colors.length; idx < end; idx += 1) {
            this.player_colors[idx] = new Color.HSLA({
                hue: this.player_colors[idx].Hue() + interval,
                saturation: this.player_color_saturation,
                lightness: this.player_color_lightness,
                alpha: this.player_color_alpha,
            });
        }
    }

    Player_Color_Saturation_Index():
        Index
    {
        const default_saturation: Float = Options.Default_Player_Color_Saturation();

        if (this.player_color_saturation < default_saturation) {
            return -(
                (default_saturation - this.player_color_saturation) /
                Options.Player_Color_Saturation_Interval()
            );
        } else {
            return (
                (this.player_color_saturation - default_saturation) /
                Options.Player_Color_Saturation_Interval()
            );
        }
    }

    Can_Decrement_Player_Color_Saturation():
        boolean
    {
        return this.player_color_saturation > Options.Min_Player_Color_Saturation();
    }

    Can_Increment_Player_Color_Saturation():
        boolean
    {
        return this.player_color_saturation < Options.Max_Player_Color_Saturation();
    }

    Decrement_Player_Color_Saturation():
        void
    {
        Assert(this.Can_Decrement_Player_Color_Saturation());

        this.player_color_saturation -= Options.Player_Color_Saturation_Interval();

        this.Update_Player_Colors_And_Pool();
    }

    Increment_Player_Color_Saturation():
        void
    {
        Assert(this.Can_Increment_Player_Color_Saturation());

        this.player_color_saturation += Options.Player_Color_Saturation_Interval();

        this.Update_Player_Colors_And_Pool();
    }

    Player_Color_Lightness_Index():
        Index
    {
        const default_lightness: Float = Options.Default_Player_Color_Lightness();

        if (this.player_color_lightness < default_lightness) {
            return -(
                (default_lightness - this.player_color_lightness) /
                Options.Player_Color_Lightness_Interval()
            );
        } else {
            return (
                (this.player_color_lightness - default_lightness) /
                Options.Player_Color_Lightness_Interval()
            );
        }
    }

    Can_Decrement_Player_Color_Lightness():
        boolean
    {
        return this.player_color_lightness > Options.Min_Player_Color_Lightness();
    }

    Can_Increment_Player_Color_Lightness():
        boolean
    {
        return this.player_color_lightness < Options.Max_Player_Color_Lightness();
    }

    Decrement_Player_Color_Lightness():
        void
    {
        Assert(this.Can_Decrement_Player_Color_Lightness());

        this.player_color_lightness -= Options.Player_Color_Lightness_Interval();

        this.Update_Player_Colors_And_Pool();
    }

    Increment_Player_Color_Lightness():
        void
    {
        Assert(this.Can_Increment_Player_Color_Lightness());

        this.player_color_lightness += Options.Player_Color_Lightness_Interval();

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
        this.player_color_pool.push(this.player_colors.pop() as Color.HSLA);
    }

    private Increment_Player_Colors():
        void
    {
        Assert(this.player_color_pool.length > 0);

        let pool_index: Color.Index;
        if (this.player_colors.length === 0) {
            pool_index = Random_Integer_Exclusive(0, this.player_color_pool.length);
        } else {
            const possible_indices: Array<[Color.Index, Float]> =
                this.player_color_pool.map(function (
                    this: Options,
                    color: Color.HSLA,
                    index: Color.Index,
                ):
                    [Color.Index, Float]
                {
                    let total_difference: Float = 0.0;
                    for (let idx = 0, end = this.player_colors.length; idx < end; idx += 1) {
                        total_difference +=
                            this.player_colors[idx].Percent_Difference_From(color);
                    }

                    return [index, total_difference / this.player_colors.length];
                }, this).sort(function (
                    a: [Color.Index, Float],
                    b: [Color.Index, Float],
                ):
                    number
                {
                    return b[1] - a[1];
                }).filter(function (
                    value: [Color.Index, Float],
                    index: Color.Index,
                    array: Array<[Color.Index, Float]>,
                ):
                    boolean
                {
                    return value[1] >= array[0][1];
                });
            pool_index =
                possible_indices[Random_Integer_Exclusive(0, possible_indices.length)][0];
        }

        this.player_colors.push(this.player_color_pool[pool_index]);
        this.player_color_pool[pool_index] =
            this.player_color_pool[this.player_color_pool.length - 1];
        this.player_color_pool.pop();
    }

    private Update_Player_Colors_And_Pool():
        void
    {
        for (let idx = 0, end = this.player_color_pool.length; idx < end; idx += 1) {
            this.player_color_pool[idx] = new Color.HSLA({
                hue: this.player_color_pool[idx].Hue(),
                saturation: this.player_color_saturation,
                lightness: this.player_color_lightness,
                alpha: this.player_color_alpha,
            });
        }
        for (let idx = 0, end = this.player_colors.length; idx < end; idx += 1) {
            this.player_colors[idx] = new Color.HSLA({
                hue: this.player_colors[idx].Hue(),
                saturation: this.player_color_saturation,
                lightness: this.player_color_lightness,
                alpha: this.player_color_alpha,
            });
        }
    }
}
