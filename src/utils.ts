import { Integer } from "./types";
import { Float } from "./types";

export function Assert(
    boolean: boolean,
    message: string = `Tripped assert!`,
):
    void
{
    if (!boolean) {
        throw new Error(message);
    }
}

export async function Wait(milliseconds: Integer):
    Promise<void>
{
    return new Promise(function (
        resolve,
        reject,
    ):
        void
    {
        setTimeout(resolve, milliseconds);
    });
}

export function Random_Boolean():
    boolean
{
    return Math.random() < 0.5;
}

export function Random_Integer_Inclusive(
    from_inclusive: Integer,
    to_inclusive: Integer,
):
    Integer
{
    if (from_inclusive <= to_inclusive) {
        return Math.floor((Math.random() * ((to_inclusive + 1) - from_inclusive)) + from_inclusive);
    } else {
        throw new Error(`from_inclusive must be <= to_inclusive.`);
    }
}

export function Random_Integer_Exclusive(
    from_inclusive: Integer,
    to_exclusive: Integer,
):
    Integer
{
    if (from_inclusive < to_exclusive) {
        return Math.floor((Math.random() * (to_exclusive - from_inclusive)) + from_inclusive);
    } else {
        throw new Error(`from_inclusive must be < to_exclusive.`);
    }
}

export function Random_Float_Inclusive(
    from_inclusive: Float,
    to_inclusive: Float,
):
    Float
{
    if (from_inclusive <= to_inclusive) {
        return (Math.random() * ((to_inclusive + Number.EPSILON) - from_inclusive)) + from_inclusive;
    } else {
        throw new Error(`from_inclusive must be <= to_inclusive.`);
    }
}

export function Random_Float_Exclusive(
    from_inclusive: Float,
    to_exclusive: Float,
):
    Float
{
    if (from_inclusive < to_exclusive) {
        return (Math.random() * (to_exclusive - from_inclusive)) + from_inclusive;
    } else {
        throw new Error(`from_inclusive must be < to_exclusive.`);
    }
}

export function Random_String():
    string
{
    return `${Date.now()}_${Math.random()}`;
}

export function Is_Odd_Integer(
    integer: Integer,
):
    boolean
{
    return (integer & 1) > 0;
}

export function Is_Even_Integer(
    integer: Integer,
):
    boolean
{
    return (integer & 1) === 0;
}

export function Percent(percent: Float, of: Float):
    Float
{
    return percent * of / 100;
}

let x_scrollbar_height: Float | null = null;
export function X_Scrollbar_Height():
    Float
{
    if (x_scrollbar_height == null) {
        const outer: HTMLElement = document.createElement(`div`);
        outer.style.width = `100%`;
        outer.style.height = `100%`;
        outer.style.zIndex = `-1`;
        outer.style.overflowX = `scroll`;
        outer.style.visibility = `hidden`;

        const inner: HTMLElement = document.createElement(`div`);
        inner.style.width = `200%`;
        inner.style.height = `100%`;
        inner.style.overflowX = `hidden`;

        outer.appendChild(inner);
        document.body.appendChild(outer);

        x_scrollbar_height = outer.offsetHeight - inner.offsetHeight;

        document.body.removeChild(outer);
    }

    return x_scrollbar_height as Float;
}

let y_scrollbar_width: Float | null = null;
export function Y_Scrollbar_Width():
    Float
{
    if (y_scrollbar_width == null) {
        const outer: HTMLElement = document.createElement(`div`);
        outer.style.width = `100%`;
        outer.style.height = `100%`;
        outer.style.zIndex = `-1`;
        outer.style.overflowY = `scroll`;
        outer.style.visibility = `hidden`;

        const inner: HTMLElement = document.createElement(`div`);
        inner.style.width = `100%`;
        inner.style.height = `200%`;
        inner.style.overflowY = `hidden`;

        outer.appendChild(inner);
        document.body.appendChild(outer);

        y_scrollbar_width = outer.offsetWidth - inner.offsetWidth;

        document.body.removeChild(outer);
    }

    return y_scrollbar_width as Float;
}

export function Fitted_Font_Size_X(
    text: string,
    guess: Float,
    styles: { [index: string]: string },
):
    Float
{
    const element: HTMLElement = document.createElement(`div`);
    element.style.visibility = `hidden`;
    document.body.appendChild(element);
    element.textContent = text;

    for (const [key, value] of Object.entries(styles)) {
        (element.style as any)[key] = value;
    }
    element.style.fontSize = `${guess}px`;

    let max_scroll_left: Float;

    element.scrollLeft = element.scrollWidth;
    max_scroll_left = element.scrollLeft;
    while (max_scroll_left === 0) {
        guess *= 4;
        element.style.fontSize = `${guess}px`;
        element.scrollLeft = element.scrollWidth;
        max_scroll_left = element.scrollLeft;
    }

    guess = element.clientWidth * guess / element.scrollWidth;
    element.style.fontSize = `${guess}px`;
    element.scrollLeft = element.scrollWidth;
    max_scroll_left = element.scrollLeft;

    if (max_scroll_left === 0) {
        while (max_scroll_left === 0) {
            guess += 0.5;
            element.style.fontSize = `${guess}px`;
            element.scrollLeft = element.scrollWidth;
            max_scroll_left = element.scrollLeft;
        }
        guess -= 0.5;
    } else {
        while (max_scroll_left > 0) {
            guess -= 0.5;
            element.style.fontSize = `${guess}px`;
            element.scrollLeft = element.scrollWidth;
            max_scroll_left = element.scrollLeft;
        }
    }

    document.body.removeChild(element);

    return guess > 0.0 ? guess : 0.0;
}

export function Fitted_Font_Size_Y(
    text: string,
    guess: Float,
    styles: { [index: string]: string },
):
    Float
{
    const element: HTMLElement = document.createElement(`div`);
    element.style.visibility = `hidden`;
    document.body.appendChild(element);
    element.textContent = text;

    for (const [key, value] of Object.entries(styles)) {
        (element.style as any)[key] = value;
    }
    element.style.fontSize = `${guess}px`;

    let max_scroll_top: Float;

    element.scrollTop = element.scrollHeight;
    max_scroll_top = element.scrollTop;
    while (max_scroll_top === 0) {
        guess *= 4;
        element.style.fontSize = `${guess}px`;
        element.scrollTop = element.scrollHeight;
        max_scroll_top = element.scrollTop;
    }

    guess = element.clientHeight * guess / element.scrollHeight;
    element.style.fontSize = `${guess}px`;
    element.scrollTop = element.scrollHeight;
    max_scroll_top = element.scrollTop;

    if (max_scroll_top === 0) {
        while (max_scroll_top === 0) {
            guess += 0.5;
            element.style.fontSize = `${guess}px`;
            element.scrollTop = element.scrollHeight;
            max_scroll_top = element.scrollTop;
        }
        guess -= 0.5;
    } else {
        while (max_scroll_top > 0) {
            guess -= 0.5;
            element.style.fontSize = `${guess}px`;
            element.scrollTop = element.scrollHeight;
            max_scroll_top = element.scrollTop;
        }
    }

    document.body.removeChild(element);

    return guess > 0.0 ? guess : 0.0;
}

export function Fitted_Font_Size_XY(
    text: string,
    guess: Float,
    styles: { [index: string]: string },
):
    Float
{
    const element: HTMLElement = document.createElement(`div`);
    element.style.visibility = `hidden`;
    document.body.appendChild(element);
    element.textContent = text;

    for (const [key, value] of Object.entries(styles)) {
        (element.style as any)[key] = value;
    }
    element.style.fontSize = `${guess}px`;

    let max_scroll_left: Float;
    let max_scroll_top: Float;

    element.scrollLeft = element.scrollWidth;
    max_scroll_left = element.scrollLeft;
    element.scrollTop = element.scrollHeight;
    max_scroll_top = element.scrollTop;
    while (max_scroll_left === 0 && max_scroll_top === 0) {
        guess *= 4;
        element.style.fontSize = `${guess}px`;
        element.scrollLeft = element.scrollWidth;
        max_scroll_left = element.scrollLeft;
        element.scrollTop = element.scrollHeight;
        max_scroll_top = element.scrollTop;
    }

    guess = element.clientWidth * guess / element.scrollWidth;
    element.style.fontSize = `${guess}px`;
    guess = element.clientHeight * guess / element.scrollHeight;
    element.style.fontSize = `${guess}px`;
    element.scrollLeft = element.scrollWidth;
    max_scroll_left = element.scrollLeft;
    element.scrollTop = element.scrollHeight;
    max_scroll_top = element.scrollTop;

    if (max_scroll_left === 0 && max_scroll_top === 0) {
        while (max_scroll_left === 0 && max_scroll_top === 0) {
            guess += 0.5;
            element.style.fontSize = `${guess}px`;
            element.scrollLeft = element.scrollWidth;
            max_scroll_left = element.scrollLeft;
            element.scrollTop = element.scrollHeight;
            max_scroll_top = element.scrollTop;
        }
        guess -= 0.5;
    } else {
        while (max_scroll_left > 0 || max_scroll_top > 0) {
            guess -= 0.5;
            element.style.fontSize = `${guess}px`;
            element.scrollLeft = element.scrollWidth;
            max_scroll_left = element.scrollLeft;
            element.scrollTop = element.scrollHeight;
            max_scroll_top = element.scrollTop;
        }
    }

    document.body.removeChild(element);

    return guess > 0.0 ? guess : 0.0;
}

export function Fit_Font_Size_XY(
    {
        element,
        guess = 16,
        interval = 0.5,
    }: {
        element: HTMLElement,
        guess?: Float,
        interval?: Float,
    },
):
    Float
{
    Assert(element.textContent !== ``);

    element.style.fontSize = `${guess}px`;

    let max_scroll_left: Float;
    let max_scroll_top: Float;

    element.scrollLeft = element.scrollWidth;
    max_scroll_left = element.scrollLeft;
    element.scrollTop = element.scrollHeight;
    max_scroll_top = element.scrollTop;
    while (max_scroll_left === 0 && max_scroll_top === 0) {
        guess *= 4;
        element.style.fontSize = `${guess}px`;
        element.scrollLeft = element.scrollWidth;
        max_scroll_left = element.scrollLeft;
        element.scrollTop = element.scrollHeight;
        max_scroll_top = element.scrollTop;
    }

    guess = element.clientWidth * guess / element.scrollWidth;
    element.style.fontSize = `${guess}px`;
    guess = element.clientHeight * guess / element.scrollHeight;
    element.style.fontSize = `${guess}px`;
    element.scrollLeft = element.scrollWidth;
    max_scroll_left = element.scrollLeft;
    element.scrollTop = element.scrollHeight;
    max_scroll_top = element.scrollTop;

    if (max_scroll_left === 0 && max_scroll_top === 0) {
        while (max_scroll_left === 0 && max_scroll_top === 0) {
            guess += interval;
            element.style.fontSize = `${guess}px`;
            element.scrollLeft = element.scrollWidth;
            max_scroll_left = element.scrollLeft;
            element.scrollTop = element.scrollHeight;
            max_scroll_top = element.scrollTop;
        }
        guess -= interval;
        element.style.fontSize = `${guess}px`;
    } else {
        while (max_scroll_left > 0 || max_scroll_top > 0) {
            guess -= interval;
            element.style.fontSize = `${guess}px`;
            element.scrollLeft = element.scrollWidth;
            max_scroll_left = element.scrollLeft;
            element.scrollTop = element.scrollHeight;
            max_scroll_top = element.scrollTop;
        }
    }

    return guess > 0.0 ? guess : 0.0;
}

export function Plot_Revolution(
    {
        radius,
        point_count,
        from_radians_z = 0.0,
        to_radians_z = from_radians_z + (Math.PI * 2),
        from_radians_x = 0.0,
        to_radians_x = from_radians_x + (Math.PI * 2),
    }: {
        radius: Float,
        point_count: Integer,
        from_radians_z?: Float,
        to_radians_z?: Float,
        from_radians_x?: Float,
        to_radians_x?: Float,
    },
):
    Array<{
        x: Float,
        y: Float,
        z: Float,
    }>
{
    Assert(radius >= 0);
    Assert(point_count >= 0);
    Assert(from_radians_z <= to_radians_z);
    Assert(from_radians_x <= to_radians_x);

    const points: Array<{
        x: Float,
        y: Float,
        z: Float,
    }> = [];

    const radians_z_interval: Float = (to_radians_z - from_radians_z) / point_count;
    const radians_x_interval: Float = (to_radians_x - from_radians_x) / point_count;

    for (let idx = 0, end = point_count; idx < end; idx += 1) {
        points.push({
            x: radius * Math.cos(from_radians_z) * Math.cos(from_radians_x),
            y: radius * Math.sin(from_radians_z) * Math.cos(from_radians_x),
            z: radius * Math.sin(from_radians_x),
        });

        from_radians_z += radians_z_interval;
        from_radians_x += radians_x_interval;
    }

    return points;
}

export function Plot_Bezier_Curve_3(
    step: Float,
    scale: Float,
    x1: Float,
    y1: Float,
    x2: Float,
    y2: Float,
    x3: Float,
    y3: Float,
):
    Array<{
        x: Float,
        y: Float,
    }>
{
    // https://javascript.info/bezier-curve
    // x = (1−t)^2 * x1 + 2 * (1−t) * t * x2 + t^2 * x3
    // y = (1−t)^2 * y1 + 2 * (1−t) * t * y2 + t^2 * y3

    Assert(step > 0.0 && step <= 1.0);

    const points: Array<{
        x: Float,
        y: Float,
    }> = [];

    for (let t = 0.0, end = 1.0; t <= end; t += step) {
        const a: Float = 1 - t;
        const b: Float = Math.pow(a, 2);
        const c: Float = 2 * a * t;
        const d: Float = Math.pow(t, 2);

        points.push({
            x: ((b * x1) + (c * x2) + (d * x3)) * scale,
            y: ((b * y1) + (c * y2) + (d * y3)) * scale,
        });
    }

    return points;
}

export function Plot_Bezier_Curve_4(
    step: Float,
    scale: Float,
    x1: Float, y1: Float,
    x2: Float, y2: Float,
    x3: Float, y3: Float,
    x4: Float, y4: Float,
):
    Array<{
        x: Float,
        y: Float,
    }>
{
    // https://javascript.info/bezier-curve
    // P = (1 - t)^3 * P1 + 3 * (1 - t)^2 * t * P2 + 3 * (1 - t) * t^2 * P3 + t^3 * P4

    const points: Array<{
        x: Float,
        y: Float,
    }> = [];

    Assert(step > 0.0 && step <= 1.0);

    for (let t = 0.0, end = 1.0; t <= end; t += step) {
        const a: Float = 1 - t;
        const b: Float = Math.pow(a, 3);
        const c: Float = 3 * Math.pow(a, 2) * t;
        const d: Float = 3 * a * Math.pow(t, 2);
        const e: Float = Math.pow(t, 3);

        points.push({
            x: ((b * x1) + (c * x2) + (d * x3) + (e * x4)) * scale,
            y: ((b * y1) + (c * y2) + (d * y3) + (e * y4)) * scale,
        })
    }

    return points;
}
