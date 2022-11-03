import { Float, Min } from "../../types";

import { Assert } from "../../utils";
import { Random_Integer_Inclusive } from "../../utils";
import { Random_Float_Inclusive } from "../../utils";
import { Plot_Revolution } from "../../utils";

import * as Enum from "../enum";

import { Instance } from "./instance";
import { Count } from "./count";
import { Index } from "./index";
import { Max } from "./max";

export class Uniques
{
    static Min_Alpha():
        Min
    {
        return 0.5;
    }

    static Max_Alpha():
        Max
    {
        return 0.8;
    }

    private colors: Array<Instance>;
    private max_value: Max;
    private alpha: Float;
    private from_radians_z: Float;
    private radians_x: Float;
    private orientation: Enum.RGBA;

    constructor(
        {
            color_count,
            max_value = Random_Integer_Inclusive(32, 255),
            alpha = Random_Float_Inclusive(Uniques.Min_Alpha(), Uniques.Max_Alpha()),
            from_radians_z = Random_Float_Inclusive(-Math.PI, Math.PI),
            radians_x = Random_Float_Inclusive(-0.5, 0.5),
            orientation = Random_Integer_Inclusive(Enum.RGBA.RED, Enum.RGBA.BLUE),
        }: {
            color_count: Count,
            max_value?: Max,
            alpha?: Float,
            from_radians_z?: Float,
            radians_x?: Float,
            orientation?: Enum.RGBA,
        },
    )
    {
        Assert(max_value >= 0);
        Assert(alpha >= Uniques.Min_Alpha() && alpha <= Uniques.Max_Alpha());
        Assert(color_count >= 0);
        Assert(orientation >= Enum.RGBA.RED && orientation <= Enum.RGBA.BLUE);

        this.colors = [];
        this.max_value = max_value;
        this.alpha = alpha;
        this.from_radians_z = from_radians_z;
        this.radians_x = radians_x;
        this.orientation = orientation;

        const radius: number = max_value / 2;
        const points: Array<{
            x: Float,
            y: Float,
            z: Float,
        }> = Plot_Revolution({
            radius: radius,
            point_count: color_count,
            from_radians_z: from_radians_z,
            from_radians_x: radians_x,
            to_radians_x: radians_x,
        });

        if (orientation === Enum.RGBA.RED) {
            for (const point of points) {
                this.colors.push(new Instance({
                    red: Math.floor(point.x + radius),
                    green: Math.floor(point.y + radius),
                    blue: Math.floor(point.z + radius),
                    alpha: alpha,
                }));
            }
        } else if (orientation === Enum.RGBA.GREEN) {
            for (const point of points) {
                this.colors.push(new Instance({
                    red: Math.floor(point.z + radius),
                    green: Math.floor(point.x + radius),
                    blue: Math.floor(point.y + radius),
                    alpha: alpha,
                }));
            }
        } else if (orientation === Enum.RGBA.BLUE) {
            for (const point of points) {
                this.colors.push(new Instance({
                    red: Math.floor(point.y + radius),
                    green: Math.floor(point.z + radius),
                    blue: Math.floor(point.x + radius),
                    alpha: alpha,
                }));
            }
        }

        Object.freeze(this.colors);
        Object.freeze(this);
    }

    Color_Count():
        Count
    {
        return this.colors.length;
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

    Max_Value():
        Max
    {
        return this.max_value;
    }

    Alpha():
        Float
    {
        return this.alpha;
    }

    From_Radians_Z():
        Float
    {
        return this.from_radians_z;
    }

    Radians_X():
        Float
    {
        return this.radians_x;
    }

    Orientation():
        Enum.RGBA
    {
        return this.orientation;
    }
}
