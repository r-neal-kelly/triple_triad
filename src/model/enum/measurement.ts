export enum Measurement
{
    _NONE_ = -1,

    BEST_FIT,
    HORIZONTAL,
    VERTICAL,

    _COUNT_,
    _FIRST_ = BEST_FIT,
    _LAST_ = VERTICAL,
}

export function Measurement_String(measurement: Measurement):
    string
{
    if (measurement === Measurement.BEST_FIT) {
        return `Best Fit`;
    } else if (measurement === Measurement.HORIZONTAL) {
        return `Horizontal`;
    } else if (measurement === Measurement.VERTICAL) {
        return `Vertical`;
    } else {
        throw new Error(`Invalid measurement.`);
    }
}
