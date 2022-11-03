import { Assert, Random_Boolean } from "../../utils";
import { Random_Integer_Inclusive } from "../../utils";

import { Instance } from "./instance";
import * as Board from "../board";
import * as Player from "../player";

export class Random extends Instance
{
    constructor(
        {
            min_row_count = 3,
            max_row_count = 9,

            min_column_count = 3,
            max_column_count = 9,

            min_player_count = 2,
            max_player_count = 9,

            allow_open = true,
            allow_same = true,
            allow_plus = true,
            allow_wall = true,
            allow_combo = true,
            allow_random = true,
        }: {
            min_row_count?: Board.Row.Count,
            max_row_count?: Board.Row.Count,

            min_column_count?: Board.Column.Count,
            max_column_count?: Board.Column.Count,

            min_player_count?: Player.Count,
            max_player_count?: Player.Count,

            allow_open?: boolean,
            allow_same?: boolean,
            allow_plus?: boolean,
            allow_wall?: boolean,
            allow_combo?: boolean,
            allow_random?: boolean,
        },
    )
    {
        Assert(min_row_count * min_column_count >= max_player_count);

        if (min_row_count < 0 || min_row_count > max_row_count) {
            throw new Error(
                `min_row_count of ${min_row_count} is greater than max_row_count of ${max_row_count}.`
            );
        } else if (min_column_count < 0 || min_column_count > max_column_count) {
            throw new Error(
                `min_column_count of ${min_column_count} is greater than max_column_count of ${max_column_count}.`
            );
        } else if (min_player_count < 0 || min_player_count > max_player_count) {
            throw new Error(
                `min_player_count of ${min_player_count} is greater than max_player_count of ${max_player_count}.`
            );
        } else {
            super({
                row_count: Random_Integer_Inclusive(min_row_count, max_row_count),
                column_count: Random_Integer_Inclusive(min_column_count, max_column_count),
                player_count: Random_Integer_Inclusive(min_player_count, max_player_count),

                open: allow_open ?
                    Random_Boolean() :
                    false,
                same: allow_same ?
                    Random_Boolean() :
                    false,
                plus: allow_plus ?
                    Random_Boolean() :
                    false,
                wall: allow_wall ?
                    Random_Boolean() :
                    false,
                combo: allow_combo ?
                    Random_Boolean() :
                    false,
                random: allow_random ?
                    Random_Boolean() :
                    false,
            });
        }
    }
}
