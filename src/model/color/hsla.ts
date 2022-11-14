import { Float } from "../../types";

import { Assert } from "../../utils";

/* Contains HSL and alpha values for a color. */
export class HSLA
{
    private hue: Float;
    private saturation: Float;
    private lightness: Float;
    private alpha: Float;

    constructor(
        {
            hue = 0,
            saturation = 0,
            lightness = 0,
            alpha = 1.0,
        }: {
            hue?: Float,
            saturation?: Float,
            lightness?: Float,
            alpha?: Float,
        }
    )
    {
        Assert(saturation != null && saturation >= 0.0 && saturation <= 100.0);
        Assert(lightness != null && lightness >= 0.0 && lightness <= 100.0);
        Assert(alpha != null && alpha >= 0.0 && alpha <= 1.0);

        this.hue = hue;
        this.saturation = saturation;
        this.lightness = lightness;
        this.alpha = alpha;

        Object.freeze(this);
    }

    Hue():
        Float
    {
        return this.hue;
    }

    Saturation():
        Float
    {
        return this.saturation;
    }

    Lightness():
        Float
    {
        return this.lightness;
    }

    Alpha():
        Float
    {
        return this.alpha;
    }

    Percent_Difference_From(other: HSLA):
        Float
    {
        let percent_difference = 0;

        {
            const hue_a: Float = this.Hue();
            const hue_b: Float = other.Hue();
            if (hue_a > hue_b) {
                percent_difference += (hue_a - hue_b) * 100 / 360;
            } else {
                percent_difference += (hue_b - hue_a) * 100 / 360;
            }
        }

        {
            const saturation_a: Float = this.Saturation();
            const saturation_b: Float = other.Saturation();
            if (saturation_a > saturation_b) {
                percent_difference += saturation_a - saturation_b;
            } else {
                percent_difference += saturation_b - saturation_a;
            }
        }

        {
            const lightness_a: Float = this.Lightness();
            const lightness_b: Float = other.Lightness();
            if (lightness_a > lightness_b) {
                percent_difference += lightness_a - lightness_b;
            } else {
                percent_difference += lightness_b - lightness_a;
            }
        }

        {
            const alpha_a = this.Alpha();
            const alpha_b = other.Alpha();
            if (alpha_a > alpha_b) {
                percent_difference += (alpha_a - alpha_b) * 100;
            } else {
                percent_difference += (alpha_b - alpha_a) * 100;
            }
        }

        return percent_difference / 4;
    }
}
