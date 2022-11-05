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

export class Game_Measurements
{
    has_x_scrollbar: boolean = false;
    has_y_scrollbar: boolean = false;

    width: Float = 0;
    height: Float = 0;

    content_width: Float = 0;
    content_height: Float = 0;

    card_width: Float = 0;
    card_height: Float = 0;

    arena_width: Float = 0;
    arena_height: Float = 0;

    board_width: Float = 0;
    board_height: Float = 0;

    board_bumper_width: Float = 0;
    board_bumper_height: Float = 0;

    board_cells_width: Float = 0;
    board_cells_height: Float = 0;
    board_cells_padding: Float = 0;
    board_cells_grid_gap: Float = 0;

    board_cell_width: Float = 0;
    board_cell_height: Float = 0;

    player_group_width: Float = 0;
    player_group_height: Float = 0;
    player_group_padding_left_right: Float = 0;
    player_group_padding_top_bottom: Float = 0;

    player_width: Float = 0;
    player_height: Float = 0;

    player_bumper_width: Float = 0;
    player_bumper_height: Float = 0;

    player_hand_width: Float = 0;
    player_hand_height: Float = 0;

    player_stake_width: Float = 0;
    player_stake_height: Float = 0;

    results_width: Float = 0;
    results_height: Float = 0;

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
        if (parent_height > parent_width) {
            this.Calculate_By_Width(
                parent_width,
                parent_height,
                row_count,
                column_count,
                player_count,
            );

            if (may_have_scrollbar && this.content_height > this.height) {
                this.Calculate_By_Width(
                    parent_width - Y_Scrollbar_Width(),
                    parent_height,
                    row_count,
                    column_count,
                    player_count,
                );
                this.width = parent_width;
                this.arena_width = parent_width;

                this.has_y_scrollbar = true;
            } else {
                this.has_y_scrollbar = false;
            }
        } else {
            this.Calculate_By_Height(
                parent_width,
                parent_height,
                row_count,
                column_count,
                player_count,
            );

            if (may_have_scrollbar && this.content_width > this.width) {
                this.Calculate_By_Height(
                    parent_width,
                    parent_height - X_Scrollbar_Height(),
                    row_count,
                    column_count,
                    player_count,
                );
                this.height = parent_height;
                this.arena_height = parent_height;

                this.has_x_scrollbar = true;
            } else {
                this.has_x_scrollbar = false;
            }
        }

        Object.freeze(this);
    }

    private Calculate_By_Width(
        parent_width: Float,
        parent_height: Float,
        row_count: Model.Board.Row.Count,
        column_count: Model.Board.Column.Count,
        player_count: Model.Player.Count,
    ):
        void
    {
        this.width = parent_width;
        this.height = parent_height;

        this.arena_width = this.width;
        this.arena_height = this.height;

        this.results_width = this.width;
        this.results_height = this.height;

        this.board_width = Percent(55, this.width); // this.board_width = this.width;
        this.board_bumper_width = Percent(8, this.board_width);
        this.board_cells_width = this.board_width - this.board_bumper_width;

        this.board_cells_padding = Percent(2, this.board_width);
        this.board_cells_grid_gap = Percent(0.5, this.board_width);

        this.card_width =
            (
                this.board_cells_width -
                (this.board_cells_padding * 2) -
                (this.board_cells_grid_gap * (column_count - 1))
            ) /
            column_count;
        this.card_height = this.card_width * 100 / 80;

        this.board_height =
            (this.board_cells_padding * 2) +
            (this.board_cells_grid_gap * (row_count - 1)) +
            (this.card_height * row_count);
        this.board_bumper_height = this.board_height;
        this.board_cells_height = this.board_height;

        this.board_cell_width = this.card_width;
        this.board_cell_height = this.card_height;

        this.player_group_width = this.width;

        this.player_height = this.card_height * 1.07;
        this.player_width = this.player_group_width;

        this.player_bumper_height = this.card_height;
        this.player_bumper_width = this.board_bumper_width;

        this.player_hand_height = this.card_height;
        this.player_hand_width = this.player_width - this.player_bumper_width;

        this.player_stake_width = this.card_width;
        this.player_stake_height = this.card_height;

        this.player_group_padding_left_right = 0;
        this.player_group_padding_top_bottom =
            (this.player_height - this.player_hand_height) / 2;
        this.player_group_height =
            (this.player_height * Math.ceil(player_count / PLAYER_GROUP_COUNT)) +
            (this.player_group_padding_top_bottom * 2);

        this.content_width = this.width;
        this.content_height =
            (this.player_group_height * PLAYER_GROUP_COUNT) +
            this.board_height;
    }

    private Calculate_By_Height(
        parent_width: Float,
        parent_height: Float,
        row_count: Model.Board.Row.Count,
        column_count: Model.Board.Column.Count,
        player_count: Model.Player.Count,
    ):
        void
    {
        this.width = parent_width;
        this.height = parent_height;

        this.arena_width = this.width;
        this.arena_height = this.height;

        this.results_width = this.width;
        this.results_height = this.height;

        this.board_height = this.height;
        this.board_bumper_height = Percent(8, this.board_height);
        this.board_cells_height = this.board_height - this.board_bumper_height;

        this.board_cells_padding = Percent(2, this.board_height);
        this.board_cells_grid_gap = Percent(0.5, this.board_height);

        this.card_height =
            (
                this.board_cells_height -
                (this.board_cells_padding * 2) -
                (this.board_cells_grid_gap * (row_count - 1))
            ) /
            row_count;
        this.card_width = this.card_height * 80 / 100;

        this.board_width =
            (this.board_cells_padding * 2) +
            (this.board_cells_grid_gap * (column_count - 1)) +
            (this.card_width * column_count);
        this.board_bumper_width = this.board_width;
        this.board_cells_width = this.board_width;

        this.board_cell_width = this.card_width;
        this.board_cell_height = this.card_height;

        this.player_group_height = this.height;

        this.player_width = this.card_width * 1.07;
        this.player_height = this.player_group_height;

        this.player_bumper_width = this.card_width;
        this.player_bumper_height = this.board_bumper_height;

        this.player_hand_width = this.card_width;
        this.player_hand_height = this.player_height - this.player_bumper_height;

        this.player_stake_width = this.card_width;
        this.player_stake_height = this.card_height;

        this.player_group_padding_left_right =
            (this.player_width - this.player_hand_width) / 2;
        this.player_group_padding_top_bottom = 0;
        this.player_group_width =
            (this.player_width * Math.ceil(player_count / PLAYER_GROUP_COUNT)) +
            (this.player_group_padding_left_right * 2);

        this.content_height = this.height;
        this.content_width =
            (this.player_group_width * PLAYER_GROUP_COUNT) +
            this.board_width;
    }

    Is_Vertical():
        boolean
    {
        return this.height > this.width;
    }

    Is_Horizontal():
        boolean
    {
        return !this.Is_Vertical();
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
        return this.content_width;
    }

    Content_Height():
        Float
    {
        return this.content_height;
    }

    Card_Width():
        Float
    {
        return this.card_width;
    }

    Card_Height():
        Float
    {
        return this.card_height;
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
        return this.board_width;
    }

    Board_Height():
        Float
    {
        return this.board_height;
    }

    Board_Bumper_Width():
        Float
    {
        return this.board_bumper_width;
    }

    Board_Bumper_Height():
        Float
    {
        return this.board_bumper_height;
    }

    Board_Cells_Width():
        Float
    {
        return this.board_cells_width;
    }

    Board_Cells_Height():
        Float
    {
        return this.board_cells_height;
    }

    Board_Cells_Padding():
        Float
    {
        return this.board_cells_padding;
    }

    Board_Cells_Grid_Gap():
        Float
    {
        return this.board_cells_grid_gap;
    }

    Board_Cell_Width():
        Float
    {
        return this.board_cell_width;
    }

    Board_Cell_Height():
        Float
    {
        return this.board_cell_height;
    }

    Player_Group_Width():
        Float
    {
        return this.player_group_width;
    }

    Player_Group_Height():
        Float
    {
        return this.player_group_height;
    }

    Player_Group_Padding_Left_Right():
        Float
    {
        return this.player_group_padding_left_right;
    }

    Player_Group_Padding_Top_Bottom():
        Float
    {
        return this.player_group_padding_top_bottom;
    }

    Player_Width():
        Float
    {
        return this.player_width;
    }

    Player_Height():
        Float
    {
        return this.player_height;
    }

    Player_Bumper_Width():
        Float
    {
        return this.player_bumper_width;
    }

    Player_Bumper_Height():
        Float
    {
        return this.player_bumper_height;
    }

    Player_Hand_Width():
        Float
    {
        return this.player_hand_width;
    }

    Player_Hand_Height():
        Float
    {
        return this.player_hand_height;
    }

    Player_Stake_Width():
        Float
    {
        return this.player_stake_width;
    }

    Player_Stake_Height():
        Float
    {
        return this.player_stake_height;
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
            return Model.Enum.Direction.BOTTOM;
        } else {
            return Model.Enum.Direction.RIGHT;
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
