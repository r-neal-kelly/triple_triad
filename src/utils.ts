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
