import { Integer } from "../../types";
import { Float } from "../../types";

/* Contains RGB and alpha values for a color. */
export class RGBA
{
    private red: Integer;
    private green: Integer;
    private blue: Integer;
    private alpha: Float;
    private luminance: Float | null;

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
        },
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
            this.luminance = null;
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

    Luminance():
        Float
    {
        if (this.luminance == null) {
            // https://www.w3.org/TR/WCAG22/#dfn-relative-luminance

            let r = this.red / 255.0;
            let g = this.green / 255.0;
            let b = this.blue / 255.0;

            r = r <= 0.04045 ?
                r / 12.92 :
                Math.pow((r + 0.055) / 1.055, 2.4);
            g = g <= 0.04045 ?
                g / 12.92 :
                Math.pow((g + 0.055) / 1.055, 2.4);
            b = b <= 0.04045 ?
                b / 12.92 :
                Math.pow((b + 0.055) / 1.055, 2.4);

            this.luminance = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
        }

        return this.luminance as Float;
    }

    Has_Higher_Contrast_With_White():
        boolean
    {
        // https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio

        const luminance: Float = this.Luminance();

        return (1.0 + 0.05) / (luminance + 0.05) > (luminance + 0.05) / (0.0 + 0.05);
    }

    Has_Higher_Contrast_With_Black():
        boolean
    {
        // https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio

        const luminance: Float = this.Luminance();

        return (luminance + 0.05) / (0.0 + 0.05) > (1.0 + 0.05) / (luminance + 0.05);
    }

    Percent_Difference_From(other: RGBA):
        Float
    {
        let percent_difference = 0;

        for (const [color_a, color_b] of
            [
                [this.Red(), other.Red()],
                [this.Green(), other.Green()],
                [this.Blue(), other.Blue()],
            ] as Array<[number, number]>
        ) {
            if (color_a > color_b) {
                percent_difference += (color_a - color_b) * 100 / 255;
            } else {
                percent_difference += (color_b - color_a) * 100 / 255;
            }
        }

        const alpha_a = this.Alpha();
        const alpha_b = other.Alpha();
        if (alpha_a > alpha_b) {
            percent_difference += (alpha_a - alpha_b) * 100;
        } else {
            percent_difference += (alpha_b - alpha_a) * 100;
        }

        return percent_difference / 4;
    }
}

(window as any).RGBA = RGBA;
