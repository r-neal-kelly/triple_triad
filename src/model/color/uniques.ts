import { Instance } from "./instance";
import { Count } from "./count";
import { Index } from "./index";
import { Min } from "./min";
import { Max } from "./max";
import { Random } from "./random";

// I think another way to do this would be to a 3d space, select a non-changing radius
// and just rotate around the plane using sin/cosine to get an equal distribution
export class Uniques
{
    private min_red: Min;
    private max_red: Max;

    private min_green: Min;
    private max_green: Max;

    private min_blue: Min;
    private max_blue: Max;

    private min_alpha: Min;
    private max_alpha: Max;

    private color_count: Count;
    private colors: Array<Instance>;

    private did_interpolate: boolean;

    constructor(
        {
            color_count,

            min_red = 0,
            max_red = 255,

            min_green = 0,
            max_green = 255,

            min_blue = 0,
            max_blue = 255,

            min_alpha = 0.0,
            max_alpha = 1.0,
        }: {
            color_count: Count,

            min_red?: Min,
            max_red?: Max,

            min_green?: Min,
            max_green?: Max,

            min_blue?: Min,
            max_blue?: Max,

            min_alpha?: Min,
            max_alpha?: Max,
        }
    )
    {
        if (color_count < 0) {
            throw new Error(
                `color_count of ${color_count} is less than 0.`
            );
        } else if (min_red < 0 || min_red > max_red) {
            throw new Error(
                `min_red of ${min_red} is greater than max_red of ${max_red}.`
            );
        } else if (min_green < 0 || min_green > max_green) {
            throw new Error(
                `min_green of ${min_green} is greater than max_green of ${max_green}.`
            );
        } else if (min_blue < 0 || min_blue > max_blue) {
            throw new Error(
                `min_blue of ${min_blue} is greater than max_blue of ${max_blue}.`
            );
        } else if (min_alpha < 0 || min_alpha > max_alpha) {
            throw new Error(
                `min_alpha of ${min_alpha} is greater than max_alpha of ${max_alpha}.`
            );
        } else {
            this.min_red = min_red;
            this.max_red = max_red;

            this.min_green = min_green;
            this.max_green = max_green;

            this.min_blue = min_blue;
            this.max_blue = max_blue;

            this.min_alpha = min_alpha;
            this.max_alpha = max_alpha;

            this.color_count = color_count;
            this.colors = [];

            const min_percent_difference: number = this.Min_Percent_Difference();
            const max_failure_count: number = 50;

            let failure_count: number = 0;
            while (this.colors.length < color_count) {
                if (failure_count <= max_failure_count) {
                    const new_color: Random = new Random(
                        {
                            min_red,
                            max_red,

                            min_green,
                            max_green,

                            min_blue,
                            max_blue,

                            min_alpha,
                            max_alpha,
                        }
                    );

                    let is_different_enough: boolean = true;
                    for (const old_color of this.colors) {
                        if (new_color.Percent_Difference_From(old_color) < min_percent_difference) {
                            failure_count += 1;
                            is_different_enough = false;
                            break;
                        }
                    }

                    if (is_different_enough) {
                        this.colors.push(new_color);
                    }
                } else {
                    // temp
                    // we need to interpolate between the first two colors
                    // with the greatest difference.
                    this.colors.push(new Random(
                        {
                            min_red,
                            max_red,

                            min_green,
                            max_green,

                            min_blue,
                            max_blue,

                            min_alpha,
                            max_alpha,
                        }
                    ));
                }
            }

            this.did_interpolate = failure_count > max_failure_count;

            Object.freeze(this.colors);
            Object.freeze(this);
        }
    }

    Min_Red():
        Min
    {
        return this.min_red;
    }

    Max_Red():
        Max
    {
        return this.max_red;
    }

    Min_Green():
        Min
    {
        return this.min_green;
    }

    Max_Green():
        Max
    {
        return this.max_green;
    }

    Min_Blue():
        Min
    {
        return this.min_blue;
    }

    Max_Blue():
        Max
    {
        return this.max_blue;
    }

    Min_Alpha():
        Min
    {
        return this.min_alpha;
    }

    Max_Alpha():
        Max
    {
        return this.max_alpha;
    }

    Color_Count():
        Count
    {
        return this.color_count;
    }

    Color(color_index: Index):
        Instance
    {
        if (color_index == null || color_index < 0 || color_index > this.Color_Count()) {
            throw new Error(`Invalid color_index of ${color_index}.`)
        } else {
            return this.colors[color_index];
        }
    }

    Colors():
        Array<Instance>
    {
        return Array.from(this.colors);
    }

    Did_Interpolate():
        boolean
    {
        return this.did_interpolate;
    }

    private Min_Percent_Difference():
        number
    {
        if (this.color_count > 0) {
            // if there were no ranges, the min_percent_difference would simply be
            // (100 / color_count), but because ranges are allowed, it's as if we're
            // only using a percentage of each color in the count. so we must multiply
            // the color_count by the average range's scale, such that if only 50% of
            // each range is used on average, then our equation would be
            // (100 / (color_count * 0.5)). this would make it so that upon comparison
            // of each random color generated, there must be a higher min_percent_difference
            // between the colors with these ranges, to ensure more uniqueness. Because
            // they randomly generating colors and not equally distributing them, we need to
            // further decrease the min_percent_difference to ensure that we can get as many
            // randomly unique colors upto the color_count as possible within reason.
            let total_decimal_of_ranges_used: number = 0;
            for (const [min, max] of
                [
                    [this.Min_Red(), this.Max_Red()],
                    [this.Min_Green(), this.Max_Green()],
                    [this.Min_Blue(), this.Max_Blue()],
                ] as Array<[Min, Max]>
            ) {
                total_decimal_of_ranges_used += (max - min) * 1.0 / 255;
            }
            total_decimal_of_ranges_used += (this.Max_Alpha() - this.Min_Alpha());

            const average_decimal_of_ranges_used: number = total_decimal_of_ranges_used / 4;
            const reasonable_decimal_of_randomness: number = 0.75;

            return 100 / (this.Color_Count() * average_decimal_of_ranges_used * reasonable_decimal_of_randomness);
        } else {
            return 0;
        }
    }
}
