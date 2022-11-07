import { Float } from "../types";

import { Percent } from "../utils";
import { X_Scrollbar_Height } from "../utils";
import { Y_Scrollbar_Width } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Main } from "./main";
import { Exhibition } from "./exhibition";
import { Arena } from "./arena";
import { Results } from "./results";

const PLAYER_GROUP_COUNT: Model.Player.Group.Count = 2;

interface Oriented_Board
{
    row_count: Model.Board.Row.Count;
    column_count: Model.Board.Column.Count;

    width: Float;
    height: Float;

    bumper_width: Float;
    bumper_height: Float;

    cells_width: Float;
    cells_height: Float;
    cells_padding: Float;
    cells_grid_gap: Float;

    cell_width: Float;
    cell_height: Float;
}

interface Oriented_Player
{
    count: Model.Player.Count;

    width: Float;
    height: Float;

    group_width: Float;
    group_height: Float;
    group_padding_left_right: Float;
    group_padding_top_bottom: Float;

    bumper_width: Float;
    bumper_height: Float;

    hand_width: Float;
    hand_height: Float;

    stake_width: Float;
    stake_height: Float;
}

interface Oriented_Content
{
    board: Vertical_Board;
    player: Vertical_Player;

    width: Float;
    height: Float;

    has_scrollbar: boolean;
}

class Vertical_Board implements Oriented_Board
{
    public row_count: Model.Board.Row.Count;
    public column_count: Model.Board.Column.Count;

    public width: Float;
    public height: Float;

    public bumper_width: Float;
    public bumper_height: Float;

    public cells_width: Float;
    public cells_height: Float;
    public cells_padding: Float;
    public cells_grid_gap: Float;

    public cell_width: Float;
    public cell_height: Float;

    constructor(
        {
            row_count,
            column_count,

            width,
        }: {
            row_count: Model.Board.Row.Count,
            column_count: Model.Board.Column.Count,

            width: Float,
        },
    )
    {
        this.row_count = row_count;
        this.column_count = column_count;

        this.width = width;

        this.bumper_width = Percent(8, this.width);

        this.cells_width = this.width - this.bumper_width;
        this.cells_padding = Percent(2, this.width);
        this.cells_grid_gap = Percent(0.5, this.width);

        this.cell_width =
            (
                this.cells_width -
                (this.cells_padding * 2) -
                (this.cells_grid_gap * (this.column_count - 1))
            ) /
            this.column_count;
        this.cell_height = this.cell_width * 100 / 80;

        this.height =
            (this.cells_padding * 2) +
            (this.cells_grid_gap * (this.row_count - 1)) +
            (this.cell_height * this.row_count);

        this.bumper_height = this.height;

        this.cells_height = this.height;

        Object.freeze(this);
    }
}

class Vertical_Player implements Oriented_Player
{
    public count: Model.Player.Count;

    public width: Float;
    public height: Float;

    public group_width: Float;
    public group_height: Float;
    public group_padding_left_right: Float;
    public group_padding_top_bottom: Float;

    public bumper_width: Float;
    public bumper_height: Float;

    public hand_width: Float;
    public hand_height: Float;

    public stake_width: Float;
    public stake_height: Float;

    constructor(
        {
            player_count,
            board,
        }: {
            player_count: Model.Player.Count,
            board: Vertical_Board,
        },
    )
    {
        this.count = player_count;

        this.width = board.width;
        this.height = board.cell_height * 1.07;

        this.bumper_width = board.bumper_width;
        this.bumper_height = board.cell_height;

        this.hand_width = this.width - this.bumper_width;
        this.hand_height = board.cell_height;

        this.stake_width = board.cell_width;
        this.stake_height = board.cell_height;

        this.group_padding_left_right = 0;
        this.group_padding_top_bottom = (this.height - this.hand_height) / 2;
        this.group_width = this.width;
        this.group_height =
            (this.height * Math.ceil(player_count / PLAYER_GROUP_COUNT)) +
            (this.group_padding_top_bottom * 2);

        Object.freeze(this);
    }
}

class Vertical_Content implements Oriented_Content
{
    public board: Vertical_Board;
    public player: Vertical_Player;

    public width: Float;
    public height: Float;

    public has_scrollbar: boolean;

    constructor(
        {
            row_count,
            column_count,
            player_count,

            width,
            has_scrollbar,
        }: {
            row_count: Model.Board.Row.Count,
            column_count: Model.Board.Column.Count,
            player_count: Model.Player.Count,

            width: Float,
            has_scrollbar: boolean,
        },
    )
    {
        this.board = new Vertical_Board({
            row_count: row_count,
            column_count: column_count,
            width: width,
        });

        this.player = new Vertical_Player({
            player_count: player_count,
            board: this.board,
        });

        this.width = width;
        this.height =
            (this.player.group_height * PLAYER_GROUP_COUNT) +
            this.board.height;

        this.has_scrollbar = has_scrollbar;

        Object.freeze(this);
    }
}

class Horizontal_Board implements Oriented_Board
{
    public row_count: Model.Board.Row.Count;
    public column_count: Model.Board.Column.Count;

    public width: Float;
    public height: Float;

    public bumper_width: Float;
    public bumper_height: Float;

    public cells_width: Float;
    public cells_height: Float;
    public cells_padding: Float;
    public cells_grid_gap: Float;

    public cell_width: Float;
    public cell_height: Float;

    constructor(
        {
            row_count,
            column_count,

            height,
        }: {
            row_count: Model.Board.Row.Count,
            column_count: Model.Board.Column.Count,

            height: Float,
        },
    )
    {
        this.row_count = row_count;
        this.column_count = column_count;

        this.height = height;

        this.bumper_height = Percent(8, this.height);

        this.cells_height = this.height - this.bumper_height;
        this.cells_padding = Percent(2, this.height);
        this.cells_grid_gap = Percent(0.5, this.height);

        this.cell_height =
            (
                this.cells_height -
                (this.cells_padding * 2) -
                (this.cells_grid_gap * (this.row_count - 1))
            ) /
            this.row_count;
        this.cell_width = this.cell_height * 80 / 100;

        this.width =
            (this.cells_padding * 2) +
            (this.cells_grid_gap * (this.column_count - 1)) +
            (this.cell_width * this.column_count);

        this.bumper_width = this.width;

        this.cells_width = this.width;

        Object.freeze(this);
    }
}

class Horizontal_Player implements Oriented_Player
{
    public count: Model.Player.Count;

    public width: Float;
    public height: Float;

    public group_width: Float;
    public group_height: Float;
    public group_padding_left_right: Float;
    public group_padding_top_bottom: Float;

    public bumper_width: Float;
    public bumper_height: Float;

    public hand_width: Float;
    public hand_height: Float;

    public stake_width: Float;
    public stake_height: Float;

    constructor(
        {
            player_count,
            board,
        }: {
            player_count: Model.Player.Count,
            board: Vertical_Board,
        },
    )
    {
        this.count = player_count;

        this.height = board.height;
        this.width = board.cell_width * 1.07;

        this.bumper_height = board.bumper_height;
        this.bumper_width = board.cell_width;

        this.hand_height = this.height - this.bumper_height;
        this.hand_width = board.cell_width;

        this.stake_height = board.cell_height;
        this.stake_width = board.cell_width;

        this.group_padding_top_bottom = 0;
        this.group_padding_left_right = (this.width - this.hand_width) / 2;
        this.group_height = this.height;
        this.group_width =
            (this.width * Math.ceil(player_count / PLAYER_GROUP_COUNT)) +
            (this.group_padding_left_right * 2);

        Object.freeze(this);
    }
}

class Horizontal_Content implements Oriented_Content
{
    public board: Horizontal_Board;
    public player: Horizontal_Player;

    public width: Float;
    public height: Float;

    public has_scrollbar: boolean;

    constructor(
        {
            row_count,
            column_count,
            player_count,

            height,
            has_scrollbar,
        }: {
            row_count: Model.Board.Row.Count,
            column_count: Model.Board.Column.Count,
            player_count: Model.Player.Count,

            height: Float,
            has_scrollbar: boolean,
        },
    )
    {
        this.board = new Horizontal_Board({
            row_count: row_count,
            column_count: column_count,
            height: height,
        });

        this.player = new Horizontal_Player({
            player_count: player_count,
            board: this.board,
        });

        this.height = height;
        this.width =
            (this.player.group_width * PLAYER_GROUP_COUNT) +
            this.board.width;

        this.has_scrollbar = has_scrollbar;

        Object.freeze(this);
    }
}

function Generate_Vertical_Content(
    {
        may_have_scrollbar,
        parent_width,
        parent_height,
        row_count,
        column_count,
        player_count,
    }: {
        may_have_scrollbar: boolean,
        parent_width: Float,
        parent_height: Float,
        row_count: Model.Board.Row.Count,
        column_count: Model.Board.Column.Count,
        player_count: Model.Player.Count,
    },
):
    Vertical_Content
{
    // The board starts with a width equal to the parent_width.
    // We can then get the max card width and height.
    // Then we can calculate what the max board height is.
    // If larger than 1/3 of the parent_height, we get the difference in scale.
    // Then we scale the card width and height down to match that proportion.
    // Next we get the height of the player_groups, based on the scaled card height.
    // If height is left, we distribute to all cards without exceeding max or causing overflow.
    // If overflow occurred instead, we recalculate to account for the width of the scrollbar.
    // We can then finalize the measurements such as padding for either side of the board.

    let current_content = new Vertical_Content({
        row_count: row_count,
        column_count: column_count,
        player_count: player_count,
        width: parent_width,
        has_scrollbar: false,
    });
    const max_board: Vertical_Board = current_content.board;

    const board_target_height: Float = parent_height / 3;
    if (max_board.height > board_target_height) {
        current_content = new Vertical_Content({
            row_count: row_count,
            column_count: column_count,
            player_count: player_count,
            width: max_board.width * board_target_height / max_board.height,
            has_scrollbar: false,
        });
    }

    if (may_have_scrollbar && current_content.height > parent_height) {
        current_content = new Vertical_Content({
            row_count: row_count,
            column_count: column_count,
            player_count: player_count,
            width: current_content.width - Y_Scrollbar_Width(),
            has_scrollbar: true,
        });
    } else if (current_content.height < parent_height) {
        const new_width: Float = Math.min(
            current_content.width *
            max_board.cell_height /
            current_content.board.cell_height,

            current_content.width *
            parent_height /
            current_content.height
        );
        if (new_width > current_content.width) {
            current_content = new Vertical_Content({
                row_count: row_count,
                column_count: column_count,
                player_count: player_count,
                width: new_width,
                has_scrollbar: false,
            });
        }
    }

    return current_content;
}

function Generate_Horizontal_Content(
    {
        may_have_scrollbar,
        parent_width,
        parent_height,
        row_count,
        column_count,
        player_count,
    }: {
        may_have_scrollbar: boolean,
        parent_width: Float,
        parent_height: Float,
        row_count: Model.Board.Row.Count,
        column_count: Model.Board.Column.Count,
        player_count: Model.Player.Count,
    },
):
    Horizontal_Content
{
    // We can do the the same thing that we do for vertical but in the other dimension.
    // Or we could use the old method:
    // The board has a height equal to the parent height.
    // Next we can get the card's height and width.
    // Then we can get the full content width.
    // If overflow occurred instead, we recalculate to account for the width of the scrollbar.
    // We can then finalize the measurements.

    let current_content = new Horizontal_Content({
        row_count: row_count,
        column_count: column_count,
        player_count: player_count,
        height: parent_height,
        has_scrollbar: false,
    });
    const max_board: Horizontal_Board = current_content.board;

    const board_target_width: Float = parent_width / 3;
    if (max_board.width > board_target_width) {
        current_content = new Horizontal_Content({
            row_count: row_count,
            column_count: column_count,
            player_count: player_count,
            height: max_board.height * board_target_width / max_board.width,
            has_scrollbar: false,
        });
    }

    if (may_have_scrollbar && current_content.width > parent_width) {
        current_content = new Horizontal_Content({
            row_count: row_count,
            column_count: column_count,
            player_count: player_count,
            height: current_content.height - X_Scrollbar_Height(),
            has_scrollbar: true,
        });
    } else if (current_content.width < parent_width) {
        const new_height: Float = Math.min(
            current_content.height *
            max_board.cell_width /
            current_content.board.cell_width,

            current_content.height *
            parent_width /
            current_content.width
        );
        if (new_height > current_content.height) {
            current_content = new Horizontal_Content({
                row_count: row_count,
                column_count: column_count,
                player_count: player_count,
                height: new_height,
                has_scrollbar: false,
            });
        }
    }

    return current_content;
}

export class Game_Measurements
{
    width: Float;
    height: Float;

    arena_width: Float;
    arena_height: Float;

    results_width: Float;
    results_height: Float;

    is_vertical: boolean;
    oriented_content: Oriented_Content;
    has_x_scrollbar: boolean;
    has_y_scrollbar: boolean;

    //board_padding_left: Float = 0;
    //board_padding_right: Float = 0;

    constructor(
        {
            may_have_scrollbar,
            parent_width,
            parent_height,
            row_count,
            column_count,
            player_count,
        }: {
            may_have_scrollbar: boolean,
            parent_width: Float,
            parent_height: Float,
            row_count: Model.Board.Row.Count,
            column_count: Model.Board.Column.Count,
            player_count: Model.Player.Count,
        },
    )
    {
        this.width = parent_width;
        this.height = parent_height;

        this.arena_width = parent_width;
        this.arena_height = parent_height;

        // I think what we'll try to do is actually calculate both the
        // vertical and horizontal versions of the layout. Then
        // we pick whichever one has the biggest cards and or least scroll.
        // What we can do is get the difference between total visible card width
        // and the total content width in both dimensions, divide by two, and
        // pick which ever has the smallest number. If equal, then pick vertical if
        // the height of the parent is larger than its width, else horizontal.
        const vertical_content: Vertical_Content = Generate_Vertical_Content({
            may_have_scrollbar: may_have_scrollbar,
            parent_width: parent_width,
            parent_height: parent_height,
            row_count: row_count,
            column_count: column_count,
            player_count: player_count,
        });
        const horizontal_content: Horizontal_Content = Generate_Horizontal_Content({
            may_have_scrollbar: may_have_scrollbar,
            parent_width: parent_width,
            parent_height: parent_height,
            row_count: row_count,
            column_count: column_count,
            player_count: player_count,
        });

        const vertical_card_board_area: Float =
            (vertical_content.board.column_count * vertical_content.board.cell_width) *
            (vertical_content.board.row_count * vertical_content.board.cell_height);
        const vertical_card_player_area: Float =
            (vertical_content.player.hand_width * vertical_content.player.stake_height) *
            vertical_content.player.count;
        const vertical_card_area =
            (vertical_card_board_area + vertical_card_player_area) *
            parent_height / vertical_content.height;

        const horizontal_card_board_area: Float =
            (horizontal_content.board.column_count * horizontal_content.board.cell_width) *
            (horizontal_content.board.row_count * horizontal_content.board.cell_height);
        const horizontal_card_player_area: Float =
            (horizontal_content.player.hand_height * horizontal_content.player.stake_width) *
            horizontal_content.player.count;
        const horizontal_card_area =
            (horizontal_card_board_area + horizontal_card_player_area) *
            parent_width / horizontal_content.width;

        if (vertical_card_area > horizontal_card_area) {
            this.is_vertical = true;
            this.oriented_content = vertical_content;
            this.has_x_scrollbar = false;
            this.has_y_scrollbar = this.oriented_content.has_scrollbar;
        } else if (horizontal_card_area > vertical_card_area) {
            this.is_vertical = false;
            this.oriented_content = horizontal_content;
            this.has_x_scrollbar = this.oriented_content.has_scrollbar;
            this.has_y_scrollbar = false;
        } else if (parent_height > parent_width) {
            this.is_vertical = true;
            this.oriented_content = vertical_content;
            this.has_x_scrollbar = false;
            this.has_y_scrollbar = this.oriented_content.has_scrollbar;
        } else {
            this.is_vertical = false;
            this.oriented_content = horizontal_content;
            this.has_x_scrollbar = this.oriented_content.has_scrollbar;
            this.has_y_scrollbar = false;
        }

        if (this.has_x_scrollbar) {
            this.results_width = parent_width;
            this.results_height = this.oriented_content.height;
        } else if (this.has_y_scrollbar) {
            this.results_width = this.oriented_content.width;
            this.results_height = parent_height;
        } else {
            this.results_width = parent_width;
            this.results_height = parent_height;
        }

        Object.freeze(this);
    }

    Is_Vertical():
        boolean
    {
        return this.is_vertical;
    }

    Is_Horizontal():
        boolean
    {
        return !this.is_vertical;
    }

    Has_X_Scrollbar():
        boolean
    {
        return this.has_x_scrollbar;
    }

    Has_Y_Scrollbar():
        boolean
    {
        return this.has_y_scrollbar;
    }

    Has_Scrollbar():
        boolean
    {
        return this.Has_X_Scrollbar() || this.Has_Y_Scrollbar();
    }

    Width():
        Float
    {
        return this.width;
    }

    Height():
        Float
    {
        return this.height;
    }

    Content_Width():
        Float
    {
        return this.oriented_content.width;
    }

    Content_Height():
        Float
    {
        return this.oriented_content.height;
    }

    Arena_Width():
        Float
    {
        return this.arena_width;
    }

    Arena_Height():
        Float
    {
        return this.arena_height;
    }

    Board_Width():
        Float
    {
        return this.oriented_content.board.width;
    }

    Board_Height():
        Float
    {
        return this.oriented_content.board.height;
    }

    Board_Bumper_Width():
        Float
    {
        return this.oriented_content.board.bumper_width;
    }

    Board_Bumper_Height():
        Float
    {
        return this.oriented_content.board.bumper_height;
    }

    Board_Bumper_Padding():
        Float
    {
        return this.oriented_content.board.cells_padding;
    }

    Board_Cells_Width():
        Float
    {
        return this.oriented_content.board.cells_width;
    }

    Board_Cells_Height():
        Float
    {
        return this.oriented_content.board.cells_height;
    }

    Board_Cells_Padding():
        Float
    {
        return this.oriented_content.board.cells_padding;
    }

    Board_Cells_Grid_Gap():
        Float
    {
        return this.oriented_content.board.cells_grid_gap;
    }

    Board_Cell_Width():
        Float
    {
        return this.oriented_content.board.cell_width;
    }

    Board_Cell_Height():
        Float
    {
        return this.oriented_content.board.cell_height;
    }

    Player_Group_Width():
        Float
    {
        return this.oriented_content.player.group_width;
    }

    Player_Group_Height():
        Float
    {
        return this.oriented_content.player.group_height;
    }

    Player_Group_Padding_Left_Right():
        Float
    {
        return this.oriented_content.player.group_padding_left_right;
    }

    Player_Group_Padding_Top_Bottom():
        Float
    {
        return this.oriented_content.player.group_padding_top_bottom;
    }

    Player_Width():
        Float
    {
        return this.oriented_content.player.width;
    }

    Player_Height():
        Float
    {
        return this.oriented_content.player.height;
    }

    Player_Bumper_Width():
        Float
    {
        return this.oriented_content.player.bumper_width;
    }

    Player_Bumper_Height():
        Float
    {
        return this.oriented_content.player.bumper_height;
    }

    Player_Hand_Width():
        Float
    {
        return this.oriented_content.player.hand_width;
    }

    Player_Hand_Height():
        Float
    {
        return this.oriented_content.player.hand_height;
    }

    Player_Stake_Width():
        Float
    {
        return this.oriented_content.player.stake_width;
    }

    Player_Stake_Height():
        Float
    {
        return this.oriented_content.player.stake_height;
    }

    Results_Width():
        Float
    {
        return this.results_width;
    }

    Results_Height():
        Float
    {
        return this.results_height;
    }
}

type Game_Props = {
    model: Model.Arena.Instance;
    parent: Main | Exhibition;
    event_grid: Event.Grid;
}

export class Game extends Component<Game_Props>
{
    private arena: Arena | null = null;
    private results: Results | null = null;

    private is_exhibition: boolean =
        this.Parent() instanceof Exhibition;

    private measurements: Game_Measurements =
        new Game_Measurements({
            may_have_scrollbar: !this.is_exhibition,
            parent_width: this.Parent().Width(),
            parent_height: this.Parent().Height(),
            row_count: this.Model().Rules().Row_Count(),
            column_count: this.Model().Rules().Column_Count(),
            player_count: this.Model().Rules().Player_Count(),
        });

    static Player_Group_Count():
        Model.Player.Group.Count
    {
        return PLAYER_GROUP_COUNT;
    }

    Arena():
        Arena
    {
        return this.Try_Object(this.arena);
    }

    Results():
        Results
    {
        return this.Try_Object(this.results);
    }

    Is_Exhibition():
        boolean
    {
        return this.is_exhibition;
    }

    Measurements():
        Game_Measurements
    {
        return this.measurements;
    }

    Player_Group_Direction():
        Model.Enum.Direction
    {
        if (this.Measurements().Is_Vertical()) {
            return Model.Enum.Direction.TOP;
        } else {
            return Model.Enum.Direction.LEFT;
        }
    }

    Width():
        Float
    {
        return this.measurements.Width();
    }

    Height():
        Float
    {
        return this.measurements.Height();
    }

    CSS_Width():
        string
    {
        return `${this.Width()}px`;
    }

    CSS_Height():
        string
    {
        return `${this.Height()}px`;
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Arena.Instance = this.Model();

        return (
            <div
                className={`Game`}
            >
                <Arena
                    ref={ref => this.arena = ref}

                    model={model}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Results
                    ref={ref => this.results = ref}

                    model={model}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const model: Model.Arena.Instance = this.Model();

        this.measurements = new Game_Measurements({
            may_have_scrollbar: !this.is_exhibition,
            parent_width: this.Parent().Width(),
            parent_height: this.Parent().Height(),
            row_count: model.Rules().Row_Count(),
            column_count: model.Rules().Column_Count(),
            player_count: model.Rules().Player_Count(),
        });

        return ({
            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `relative`,

            overflowX: `hidden`,
            overflowY: `hidden`,
        });
    }
}
