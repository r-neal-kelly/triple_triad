import { Integer } from "../../types";
import { Float } from "../../types";

/* Contains RGBA values for a color. */
export class Instance
{
    private red: Integer;
    private green: Integer;
    private blue: Integer;
    private alpha: Float;

    constructor(
        {
            red = 0,
            green = 0,
            blue = 0,
            alpha = 1.0,
        }: {
            red?: Integer,
            green?: Integer,
            blue?: Integer,
            alpha?: Float,
        }
    )
    {
        if (
            red < 0 || red > 255 ||
            green < 0 || green > 255 ||
            blue < 0 || blue > 255
        ) {
            throw new Error(`Integer must be from 0 to 255.`);
        } else if (alpha < 0.0 || alpha > 1.0) {
            throw new Error(`Float must be from 0.0 to 1.0`);
        } else {
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.alpha = alpha;

            Object.freeze(this);
        }
    }

    Red():
        Integer
    {
        return this.red;
    }

    Green():
        Integer
    {
        return this.green;
    }

    Blue():
        Integer
    {
        return this.blue;
    }

    Alpha():
        Float
    {
        return this.alpha;
    }

    Percent_Difference_From(other_color: Instance):
        Float
    {
        let percent_difference = 0;

        for (const [color_a, color_b] of
            [
                [this.Red(), other_color.Red()],
                [this.Green(), other_color.Green()],
                [this.Blue(), other_color.Blue()],
            ] as Array<[number, number]>
        ) {
            if (color_a > color_b) {
                percent_difference += (color_a - color_b) * 100 / 255;
            } else {
                percent_difference += (color_b - color_a) * 100 / 255;
            }
        }

        const alpha_a = this.Alpha();
        const alpha_b = other_color.Alpha();
        if (alpha_a > alpha_b) {
            percent_difference += (alpha_a - alpha_b) * 100;
        } else {
            percent_difference += (alpha_b - alpha_a) * 100;
        }

        return percent_difference / 4;
    }
}
