import { Random_Integer_Inclusive } from "../../utils";
import { Random_Float_Inclusive } from "../../utils";

import { Instance } from "./instance";
import { Count } from "./count";
import { Index } from "./index";
import { Max } from "./max";

// I think another way to do this would be to a 3d space, select a non-changing radius
// and just rotate around the plane using sin/cosine to get an equal distribution
function Plot(
    radius: number,
    point_count: number,
    from_radians_z: number,
    from_radians_x: number,
):
    Array<{
        x: number,
        y: number,
        z: number,
    }>
{
    const points: Array<{
        x: number,
        y: number,
        z: number,
    }> = [];

    const interval: number = Math.PI * 2 / point_count;

    for (let idx = 0, end = point_count; idx < end; idx += 1) {
        points.push({
            x: radius * Math.cos(from_radians_z) * Math.cos(from_radians_x),
            y: radius * Math.sin(from_radians_z) * Math.cos(from_radians_x),
            z: radius * Math.sin(from_radians_x),
        });

        from_radians_z += interval;
        // it's better if we don't rotate on this axis for generating colors
        //from_radians_x += interval;
    }

    return points;
}

function Generate_Colors(
    max_value: number,
    color_count: number,
    from_radians_z: number,
    from_radians_x: number,
):
    Array<Instance>
{
    const Round = (value: number) => value > 0.5 ? Math.ceil(value) : Math.floor(value);

    const colors: Array<Instance> = [];

    const radius: number = max_value / 2;
    const points: Array<{
        x: number,
        y: number,
        z: number,
    }> = Plot(radius, color_count, from_radians_z, from_radians_x);

    const method: number = Random_Integer_Inclusive(1, 3);
    if (method === 1) {
        for (const point of points) {
            colors.push(new Instance({
                red: Round(point.x + radius),
                green: Round(point.y + radius),
                blue: Round(point.z + radius),
                alpha: 0.7,
            }));
        }
    } else if (method === 2) {
        for (const point of points) {
            colors.push(new Instance({
                red: Round(point.y + radius),
                green: Round(point.z + radius),
                blue: Round(point.x + radius),
                alpha: 0.7,
            }));
        }
    } else if (method === 3) {
        for (const point of points) {
            colors.push(new Instance({
                red: Round(point.z + radius),
                green: Round(point.x + radius),
                blue: Round(point.y + radius),
                alpha: 0.7,
            }));
        }
    }

    return colors;
}

function Generate_Random_Colors(
    max_value: number,
    color_count: number,
):
    Array<Instance>
{
    return Generate_Colors(
        max_value,
        color_count,
        Random_Float_Inclusive(-(Math.PI * 2), Math.PI * 2),
        // we need to limit this next value so that we get a good range of color
        Random_Float_Inclusive(-0.5, 0.5),
    );
}

export class Uniques
{
    private max_value: Max;
    private color_count: Count;
    private colors: Array<Instance>;

    constructor(
        {
            color_count,
            max_value,

        }: {
            color_count: Count,
            max_value: Max,
        },
    )
    {
        if (color_count < 0) {
            throw new Error(
                `color_count of ${color_count} is less than 0.`
            );
        } else if (max_value < 0 || max_value > 255) {
            throw new Error(
                `max_value of ${max_value} is invalid.`
            );
        } else {
            this.max_value = max_value;
            this.color_count = color_count;
            this.colors = Generate_Random_Colors(max_value, color_count);

            Object.freeze(this.colors);
            Object.freeze(this);
        }
    }

    Max_Value():
        Max
    {
        return this.max_value;
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
}
