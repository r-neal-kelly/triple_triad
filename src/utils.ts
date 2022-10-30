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
