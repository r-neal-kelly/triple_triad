import { Float } from "../../types";

import { Assert } from "../../utils";

import { RGBA } from "./rgba";

/* Contains HSL and alpha values for a color. */
export class HSLA
{
    private hue: Float;
    private saturation: Float;
    private lightness: Float;
    private alpha: Float;
    private luminance: Float | null;

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
        },
    )
    {
        Assert(saturation != null && saturation >= 0.0 && saturation <= 100.0);
        Assert(lightness != null && lightness >= 0.0 && lightness <= 100.0);
        Assert(alpha != null && alpha >= 0.0 && alpha <= 1.0);

        this.hue = Math.abs(hue) % 360;
        this.saturation = saturation;
        this.lightness = lightness;
        this.alpha = alpha;
        this.luminance = null;
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

    Luminance():
        Float
    {
        if (this.luminance == null) {
            this.luminance = this.RGBA().Luminance();
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

    RGBA():
        RGBA
    {
        // https://css-tricks.com/converting-color-spaces-in-javascript/

        const h = this.hue;
        const s = this.saturation / 100;
        const l = this.lightness / 100;
        const a = this.alpha;

        const c = (1 - Math.abs((2 * l) - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - (c / 2);

        let r;
        let g;
        let b;
        if (h >= 0 && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (h >= 60 && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (h >= 180 && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (h >= 240 && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else {
            r = c;
            g = 0;
            b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return new RGBA({
            red: r,
            green: g,
            blue: b,
            alpha: a,
        });
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

(window as any).HSLA = HSLA;
