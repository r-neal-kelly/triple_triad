import { Random_Integer_Inclusive } from "../../utils";
import { Random_Float_Inclusive } from "../../utils";

import { Instance } from "./instance";

export class Random extends Instance
{
    constructor(
        {
            min_red = 0,
            max_red = 255,

            min_green = 0,
            max_green = 255,

            min_blue = 0,
            max_blue = 255,

            min_alpha = 0.0,
            max_alpha = 1.0,
        }: {
            min_red?: number,
            max_red?: number,

            min_green?: number,
            max_green?: number,

            min_blue?: number,
            max_blue?: number,

            min_alpha?: number,
            max_alpha?: number,
        },
    )
    {
        if (min_red < 0 || min_red > max_red) {
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
            super({
                red: Random_Integer_Inclusive(min_red, max_red),
                green: Random_Integer_Inclusive(min_green, max_green),
                blue: Random_Integer_Inclusive(min_blue, max_blue),
                alpha: Random_Float_Inclusive(min_alpha, max_alpha),
            });
        }
    }
}
