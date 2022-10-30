import { Float } from "../types";
import { URL_Path } from "../types";

import { Assert } from "../utils";
import { Percent } from "../utils";
import { X_Scrollbar_Height } from "../utils";

import * as Model from "../model"

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Main } from "./main";
import { Exhibition } from "../view";
import { Player_Group } from "./player_group";
import { Board } from "../view";

const PLAYER_GROUP_COUNT: Model.Player_Group_Count = 2;
const PLAYER_GROUP_DIRECTION: Model.Direction_e = Model.Direction_e.RIGHT;

class Arena_Card_Images
{
    private images: Array<URL_Path>;
    private elements: Array<HTMLImageElement>;

    constructor(
        model: Model.Arena,
    )
    {
        this.images = model.Card_Images();
        this.elements = [];

        Object.freeze(this.images);
        Object.freeze(this);
    }

    async Load():
        Promise<void>
    {
        Assert(
            this.elements.length === 0,
            `The images have already been loaded.`,
        );

        await Promise.all(this.images.map(async function (
            this: Arena_Card_Images,
            image: URL_Path,
        ):
            Promise<void>
        {
            const element = new Image();
            this.elements.push(element);

            await new Promise<void>(function (
                resolve: () => void,
                reject: () => void,
            ):
                void
            {
                element.onload = resolve;
                element.onerror = reject;
                element.src = image;
            });
        }, this));

        Object.freeze(this.elements);
    }
}

export class Arena_Measurements
{
    has_x_scrollbar: boolean = false;

    width: Float = 0;
    height: Float = 0;

    content_width: Float = 0;
    content_height: Float = 0;

    card_width: Float = 0;
    card_height: Float = 0;

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
    player_group_padding: Float = 0;

    player_width: Float = 0;
    player_height: Float = 0;

    player_bumper_width: Float = 0;
    player_bumper_height: Float = 0;

    player_hand_width: Float = 0;
    player_hand_height: Float = 0;

    player_stake_width: Float = 0;
    player_stake_height: Float = 0;

    constructor(
        {
            may_have_x_scrollbar,
            parent_width,
            parent_height,
            row_count,
            column_count,
            player_count,
        }: {
            may_have_x_scrollbar: boolean,
            parent_width: Float,
            parent_height: Float,
            row_count: Model.Row_Count,
            column_count: Model.Column_Count,
            player_count: Model.Player_Count,
        },
    )
    {
        this.Calculate(
            parent_width,
            parent_height,
            row_count,
            column_count,
            player_count,
        );

        if (may_have_x_scrollbar && this.content_width > this.width) {
            this.Calculate(
                parent_width,
                parent_height - X_Scrollbar_Height(),
                row_count,
                column_count,
                player_count,
            );
            this.height = parent_height;

            this.has_x_scrollbar = true;
        } else {
            this.has_x_scrollbar = false;
        }

        Object.freeze(this);
    }

    private Calculate(
        parent_width: Float,
        parent_height: Float,
        row_count: Model.Row_Count,
        column_count: Model.Column_Count,
        player_count: Model.Player_Count,
    ):
        void
    {
        this.width = parent_width;
        this.height = parent_height;

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
        this.card_width = Percent(80, this.card_height);

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
        this.player_hand_height = this.board_cells_height;

        this.player_stake_width = this.card_width;
        this.player_stake_height = this.card_height;

        this.player_group_padding =
            (this.player_width - this.player_hand_width) / 2;
        this.player_group_width =
            (this.player_width * Math.ceil(player_count / PLAYER_GROUP_COUNT)) +
            (this.player_group_padding * 2);

        this.content_height = this.height;
        this.content_width =
            (this.player_group_width * PLAYER_GROUP_COUNT) +
            this.board_width;
    }

    Has_X_Scrollbar():
        boolean
    {
        return this.has_x_scrollbar;
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

    Player_Group_Padding():
        Float
    {
        return this.player_group_padding;
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
}

type Arena_Props = {
    model: Model.Arena;
    parent: Main | Exhibition;
    event_grid: Event.Grid;
}

export class Arena extends Component<Arena_Props>
{
    private player_groups: Array<Player_Group | null> =
        new Array(PLAYER_GROUP_COUNT).fill(null);
    private board: Board | null = null;

    private is_exhibition: boolean =
        this.Parent() instanceof Exhibition;

    private card_images: Arena_Card_Images =
        new Arena_Card_Images(this.Model());

    private measurements: Arena_Measurements =
        new Arena_Measurements({
            may_have_x_scrollbar: !this.is_exhibition,
            parent_width: this.Parent().Width(),
            parent_height: this.Parent().Height(),
            row_count: this.Model().Rules().Row_Count(),
            column_count: this.Model().Rules().Column_Count(),
            player_count: this.Model().Rules().Player_Count(),
        });

    Player_Group(player_group_index: Model.Player_Group_Index):
        Player_Group
    {
        return this.Try_Array_Index(this.player_groups, player_group_index);
    }

    Player_Groups():
        Array<Player_Group>
    {
        return this.Try_Array(this.player_groups);
    }

    Board():
        Board
    {
        return this.Try_Object(this.board);
    }

    Is_Exhibition():
        boolean
    {
        return this.is_exhibition;
    }

    Card_Images():
        Arena_Card_Images
    {
        return this.card_images;
    }

    Measurements():
        Arena_Measurements
    {
        return this.measurements;
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

    Refresh_Styles():
        void
    {
        const model: Model.Arena = this.Model();

        this.measurements = new Arena_Measurements({
            may_have_x_scrollbar: !this.is_exhibition,
            parent_width: this.Parent().Width(),
            parent_height: this.Parent().Height(),
            row_count: model.Rules().Row_Count(),
            column_count: model.Rules().Column_Count(),
            player_count: model.Rules().Player_Count(),
        });

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        if (this.measurements.Has_X_Scrollbar()) {
            this.Change_Style(`overflowX`, `scroll`);
            this.Change_Style(`justifyContent`, `start`);
        } else {
            this.Change_Style(`overflowX`, `hidden`);
            this.Change_Style(`justifyContent`, `center`);
        }
    }

    Before_Life():
        Component_Styles
    {
        this.Change_Animation({
            animation_name: `Fade_In`,
            animation_body: `
                0% {
                    opacity: 0%;
                }

                100% {
                    opacity: 100%;
                }
            `,
        });

        return ({
            display: `flex`,
            flexDirection: `row`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            overflowY: `hidden`,

            visibility: `hidden`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Arena = this.Model();
        const player_groups: Array<Model.Player_Group> =
            model.Player_Groups(PLAYER_GROUP_COUNT, PLAYER_GROUP_DIRECTION);
        Assert(PLAYER_GROUP_COUNT === 2);

        this.Refresh_Styles();

        return (
            <div
                className={`Arena`}
                style={this.Styles()}
            >
                <Player_Group
                    ref={ref => this.player_groups[0] = ref}

                    model={player_groups[0]}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Board
                    ref={ref => this.board = ref}

                    model={model.Board()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Player_Group
                    ref={ref => this.player_groups[1] = ref}

                    model={player_groups[1]}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        (async function (
            this: Arena,
        ):
            Promise<void>
        {
            await this.card_images.Load();
            if (this.Is_Alive()) {
                this.Send({
                    name_affix: Event.GAME_START,
                    name_suffixes: [
                    ],
                    data: {
                    } as Event.Game_Start_Data,
                    is_atomic: true,
                });
            }
        }).bind(this)();

        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
            {
                event_name: new Event.Name(Event.ON, Event.GAME_START),
                event_handler: this.On_Game_Start,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_STOP_TURN),
                event_handler: this.On_Player_Stop_Turn,
            },
        ]);
    }

    On_Resize(
        {
        }: Event.Resize_Data,
    ):
        void
    {
        if (this.Is_Alive()) {
            this.Refresh_Styles();

            this.Send({
                name_affix: `${Event.RESIZE}_${this.ID()}`,
                data: {
                    width: this.Width(),
                    height: this.Height(),
                } as Event.Resize_Data,
                is_atomic: false,
            });
        }
    }

    async On_Game_Start(
        {
        }: Event.Game_Start_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();

            this.Change_Style(`visibility`, `visible`);
            await this.Animate({
                animation_name: `Fade_In`,
                duration_in_milliseconds: 1000,
                css_iteration_count: `1`,
                css_timing_function: `ease-in-out`,
                css_fill_mode: `forward`,
            });

            if (this.Is_Alive()) {
                this.Send({
                    name_affix: Event.PLAYER_START_TURN,
                    name_suffixes: [
                        current_player_index.toString(),
                    ],
                    data: {
                        player_index: current_player_index,
                    } as Event.Player_Start_Turn_Data,
                    is_atomic: true,
                });
            }
        }
    }

    async On_Player_Stop_Turn(
        {
        }: Event.Player_Stop_Turn_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Next_Turn();

            if (this.Model().Is_Game_Over()) {
                const scores: Model.Scores = this.Model().Final_Scores();

                this.Send({
                    name_affix: Event.GAME_STOP,
                    name_suffixes: [
                    ],
                    data: {
                        scores,
                    } as Event.Game_Stop_Data,
                    is_atomic: true,
                });
            } else {
                const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();

                this.Send({
                    name_affix: Event.PLAYER_START_TURN,
                    name_suffixes: [
                        current_player_index.toString(),
                    ],
                    data: {
                        player_index: current_player_index,
                    } as Event.Player_Start_Turn_Data,
                    is_atomic: true,
                });
            }
        }
    }
}
