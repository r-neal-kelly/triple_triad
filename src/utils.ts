export type Integer =
    number;

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

export async function Wait(milliseconds: number):
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
    from_inclusive: number,
    to_inclusive: number,
):
    number
{
    if (from_inclusive <= to_inclusive) {
        return Math.floor((Math.random() * ((to_inclusive + 1) - from_inclusive)) + from_inclusive);
    } else {
        throw new Error(`from_inclusive must be <= to_inclusive.`);
    }
}

export function Random_Integer_Exclusive(
    from_inclusive: number,
    to_exclusive: number,
):
    number
{
    if (from_inclusive < to_exclusive) {
        return Math.floor((Math.random() * (to_exclusive - from_inclusive)) + from_inclusive);
    } else {
        throw new Error(`from_inclusive must be < to_exclusive.`);
    }
}

export function Random_Float_Inclusive(
    from_inclusive: number,
    to_inclusive: number,
):
    number
{
    if (from_inclusive <= to_inclusive) {
        return (Math.random() * ((to_inclusive + Number.EPSILON) - from_inclusive)) + from_inclusive;
    } else {
        throw new Error(`from_inclusive must be <= to_inclusive.`);
    }
}

export function Random_Float_Exclusive(
    from_inclusive: number,
    to_exclusive: number,
):
    number
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
    integer: number,
):
    boolean
{
    return (integer & 1) > 0;
}

export function Is_Even_Integer(
    integer: number,
):
    boolean
{
    return (integer & 1) === 0;
}
