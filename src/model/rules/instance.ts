import { Assert } from "../../utils";

import * as Card from "../card";
import * as Board from "../board";
import * as Player from "../player";

const MIN_ROW_COUNT: Board.Row.Count = 2;
const MAX_ROW_COUNT: Board.Row.Count = 9;
const DEFAULT_ROW_COUNT: Board.Row.Count = 3;

const MIN_COLUMN_COUNT: Board.Column.Count = 2;
const MAX_COLUMN_COUNT: Board.Column.Count = 9;
const DEFAULT_COLUMN_COUNT: Board.Column.Count = 3;

const MIN_PLAYER_COUNT: Player.Count = 2;
const MAX_PLAYER_COUNT: Player.Count = 9;
const DEFAULT_PLAYER_COUNT: Player.Count = 2;

/* A selection of rules which an arena must abide by. */
export class Instance
{
    static Min_Row_Count():
        Board.Row.Count
    {
        return MIN_ROW_COUNT;
    }

    static Max_Row_Count():
        Board.Row.Count
    {
        return MAX_ROW_COUNT;
    }

    static Default_Row_Count():
        Board.Row.Count
    {
        return DEFAULT_ROW_COUNT;
    }

    static Min_Column_Count():
        Board.Column.Count
    {
        return MIN_COLUMN_COUNT;
    }

    static Max_Column_Count():
        Board.Column.Count
    {
        return MAX_COLUMN_COUNT;
    }

    static Default_Column_Count():
        Board.Column.Count
    {
        return DEFAULT_COLUMN_COUNT;
    }

    static Min_Player_Count():
        Player.Count
    {
        return MIN_PLAYER_COUNT;
    }

    static Max_Player_Count():
        Player.Count
    {
        return MAX_PLAYER_COUNT;
    }

    static Default_Player_Count():
        Player.Count
    {
        return DEFAULT_PLAYER_COUNT;
    }

    private static Can_Use_These_Counts(
        {
            row_count,
            column_count,
            player_count,
        }: {
            row_count: Board.Row.Count,
            column_count: Board.Column.Count,
            player_count: Player.Count,
        },
    ):
        boolean
    {
        Assert(row_count != null);
        Assert(column_count != null);
        Assert(player_count != null);

        if (row_count >= MIN_ROW_COUNT &&
            row_count <= MAX_ROW_COUNT &&

            column_count >= MIN_COLUMN_COUNT &&
            column_count <= MAX_COLUMN_COUNT &&

            player_count >= MIN_PLAYER_COUNT &&
            player_count <= MAX_PLAYER_COUNT
        ) {
            return player_count <= (row_count * column_count);
        } else {
            return false;
        }
    }

    private row_count: Board.Row.Count;
    private column_count: Board.Column.Count;
    private player_count: Player.Count;

    private open: boolean;
    private same: boolean;
    private plus: boolean;
    private wall: boolean;
    private combo: boolean;
    private random: boolean;

    constructor(
        {
            row_count = DEFAULT_ROW_COUNT,
            column_count = DEFAULT_COLUMN_COUNT,
            player_count = DEFAULT_PLAYER_COUNT,

            open = true,
            same = false,
            plus = false,
            wall = false,
            combo = false,
            random = true, // temp until we get selection view up and running
        }: {
            row_count?: Board.Row.Count,
            column_count?: Board.Column.Count,
            player_count?: Player.Count,

            open?: boolean,
            same?: boolean,
            plus?: boolean,
            wall?: boolean,
            combo?: boolean,
            random?: boolean,
        }
    )
    {
        Assert(
            row_count != null &&
            row_count >= MIN_ROW_COUNT &&
            row_count <= MAX_ROW_COUNT,
            `row_count of ${row_count} is not >= ${MIN_ROW_COUNT} and <= ${MAX_ROW_COUNT}`,
        );
        Assert(
            column_count != null &&
            column_count >= MIN_COLUMN_COUNT &&
            column_count <= MAX_COLUMN_COUNT,
            `column_count of ${column_count} is not >= ${MIN_COLUMN_COUNT} and <= ${MAX_COLUMN_COUNT}`,
        );
        Assert(
            player_count != null &&
            player_count >= MIN_PLAYER_COUNT &&
            player_count <= MAX_PLAYER_COUNT,
            `player_count of ${player_count} is not >= ${MIN_PLAYER_COUNT} and <= ${MAX_PLAYER_COUNT}`,
        );
        Assert(
            Instance.Can_Use_These_Counts({
                row_count,
                column_count,
                player_count,
            }),
            `A ${row_count} x ${column_count} grid has ${row_count * column_count} cells.
            There must be at least one cell per player.`,
        );

        this.row_count = row_count;
        this.column_count = column_count;
        this.player_count = player_count;

        this.open = open;
        this.same = same;
        this.plus = plus;
        this.wall = wall;
        this.combo = combo;
        this.random = random;
    }

    Clone():
        Instance
    {
        return new Instance({
            row_count: this.Row_Count(),
            column_count: this.Column_Count(),
            player_count: this.Player_Count(),

            open: this.Open(),
            same: this.Same(),
            plus: this.Plus(),
            wall: this.Wall(),
            combo: this.Combo(),
            random: this.Random(),
        });
    }

    Row_Count():
        Board.Row.Count
    {
        return this.row_count;
    }

    Column_Count():
        Board.Column.Count
    {
        return this.column_count;
    }

    Cell_Count():
        Board.Cell.Count
    {
        return this.row_count * this.column_count;
    }

    Player_Count():
        Player.Count
    {
        return this.player_count;
    }

    Selection_Card_Count():
        Card.Count
    {
        return Math.ceil(this.Cell_Count() / this.player_count);
    }

    Open():
        boolean
    {
        return this.open;
    }

    Same():
        boolean
    {
        return this.same;
    }

    Plus():
        boolean
    {
        return this.plus;
    }

    Wall():
        boolean
    {
        return this.wall;
    }

    Combo():
        boolean
    {
        return this.combo;
    }

    Random():
        boolean
    {
        return this.random;
    }

    Can_Decrement_Row_Count():
        boolean
    {
        return Instance.Can_Use_These_Counts({
            row_count: this.row_count - 1,
            column_count: this.column_count,
            player_count: this.player_count,
        });
    }

    Can_Decrement_Column_Count():
        boolean
    {
        return Instance.Can_Use_These_Counts({
            row_count: this.row_count,
            column_count: this.column_count - 1,
            player_count: this.player_count,
        });
    }

    Can_Decrement_Player_Count():
        boolean
    {
        return Instance.Can_Use_These_Counts({
            row_count: this.row_count,
            column_count: this.column_count,
            player_count: this.player_count - 1,
        });
    }

    Can_Increment_Row_Count():
        boolean
    {
        return Instance.Can_Use_These_Counts({
            row_count: this.row_count + 1,
            column_count: this.column_count,
            player_count: this.player_count,
        });
    }

    Can_Increment_Column_Count():
        boolean
    {
        return Instance.Can_Use_These_Counts({
            row_count: this.row_count,
            column_count: this.column_count + 1,
            player_count: this.player_count,
        });
    }

    Can_Increment_Player_Count():
        boolean
    {
        return Instance.Can_Use_These_Counts({
            row_count: this.row_count,
            column_count: this.column_count,
            player_count: this.player_count + 1,
        });
    }

    Decrement_Row_Count():
        void
    {
        Assert(this.Can_Decrement_Row_Count());

        this.row_count -= 1;
    }

    Decrement_Column_Count():
        void
    {
        Assert(this.Can_Decrement_Column_Count());

        this.column_count -= 1;
    }

    Decrement_Player_Count():
        void
    {
        Assert(this.Can_Decrement_Player_Count());

        this.player_count -= 1;
    }

    Increment_Row_Count():
        void
    {
        Assert(this.Can_Increment_Row_Count());

        this.row_count += 1;
    }

    Increment_Column_Count():
        void
    {
        Assert(this.Can_Increment_Column_Count());

        this.column_count += 1;
    }

    Increment_Player_Count():
        void
    {
        Assert(this.Can_Increment_Player_Count());

        this.player_count += 1;
    }

    Can_Toggle_Same():
        boolean
    {
        return true;
    }

    Can_Toggle_Plus():
        boolean
    {
        return true;
    }

    Can_Toggle_Wall():
        boolean
    {
        return this.same || this.plus;
    }

    Can_Toggle_Combo():
        boolean
    {
        return this.same || this.plus;
    }

    Toggle_Same():
        void
    {
        this.same = !this.same;
        if (!this.Can_Toggle_Wall()) {
            this.wall = false;
        }
        if (!this.Can_Toggle_Combo()) {
            this.combo = false;
        }
    }

    Toggle_Plus():
        void
    {
        this.plus = !this.plus;
        if (!this.Can_Toggle_Wall()) {
            this.wall = false;
        }
        if (!this.Can_Toggle_Combo()) {
            this.combo = false;
        }
    }

    Toggle_Wall():
        void
    {
        if (!this.wall) {
            Assert(this.Can_Toggle_Wall());
        }

        this.wall = !this.wall;
    }

    Toggle_Combo():
        void
    {
        if (!this.combo) {
            Assert(this.Can_Toggle_Combo());
        }

        this.combo = !this.combo;
    }
}
