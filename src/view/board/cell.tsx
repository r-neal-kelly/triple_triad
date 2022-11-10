import { Float } from "../../types";

import { Assert } from "../../utils";
import { Wait } from "../../utils";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Board } from "../board";
import { Cells } from "./cells";
import * as Popup from "./popup";

const TURN_RESULT_WAIT_MILLISECONDS: number = 667;
const TURN_RESULT_TRANSITION_RATIO: number = 1 / 2;

type Cell_Props = {
    model: () => Model.Board.Cell.Instance;
    parent: Cells;
    event_grid: Event.Grid;
    index: Model.Board.Cell.Index;
}

export class Cell extends Component<Cell_Props>
{
    private current_color: Model.Color.Instance | null = null;
    private popups: Array<JSX.Element> | null = null;

    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Cells().Board();
    }

    Cells():
        Cells
    {
        return this.Parent();
    }

    Index():
        Model.Board.Cell.Index
    {
        return this.props.index;
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Board_Cell_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Board_Cell_Height();
    }

    Border():
        Float
    {
        return this.Measurements().Board_Cell_Border();
    }

    Row_Small_Width():
        Float
    {
        return this.Measurements().Board_Cell_Row_Small_Width();
    }

    Row_Large_Width():
        Float
    {
        return this.Measurements().Board_Cell_Row_Large_Width();
    }

    Column_Small_Height():
        Float
    {
        return this.Measurements().Board_Cell_Column_Small_Height();
    }

    Column_Large_Height():
        Float
    {
        return this.Measurements().Board_Cell_Column_Large_Height();
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model = this.Model()();

        if (model.Is_Empty()) {
            return (
                <div
                    className={`Board_Cell`}
                    onClick={event => this.On_Click(event)}
                >
                </div>
            );
        } else {
            return (
                <div
                    className={`Board_Cell`}
                >
                    <img
                        className={`Board_Cell_Card`}
                        style={{
                            width: `90%`,
                            height: `90%`,

                            gridColumn: `1 / span 5`,
                            gridRow: `1 / span 5`,
                            alignSelf: `center`,
                            justifySelf: `center`,
                            zIndex: `0`,
                        }}
                        src={model.Stake().Card().Image()}
                        alt={``}
                    />
                    {
                        this.popups ?
                            this.popups :
                            []
                    }
                </div>
            );
        }
    }

    override On_Restyle():
        Component_Styles
    {
        const model = this.Model()();
        const board_model = this.Board().Model();

        let background_color: string;
        let cursor: string;
        if (model.Is_Empty()) {
            background_color = `transparent`;

            if (
                board_model.Is_On_Human_Turn() &&
                board_model.Is_Cell_Selectable(this.Index())
            ) {
                cursor = `pointer`;
            } else {
                cursor = `default`;
            }
        } else {
            const color: Model.Color.Instance = this.current_color as Model.Color.Instance;
            Assert(color != null);

            background_color = `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha()}
            )`;

            cursor = `default`;
        }

        const row_small_width: Float = this.Row_Small_Width();
        const row_large_width: Float = this.Row_Large_Width();
        const column_small_height: Float = this.Column_Small_Height();
        const column_large_height: Float = this.Column_Large_Height();

        return ({
            display: `grid`,
            gridTemplateColumns: `
                ${row_large_width}px
                ${row_small_width}px
                ${row_large_width}px
                ${row_small_width}px
                ${row_large_width}px
            `,
            gridTemplateRows: `
                ${column_large_height}px
                ${column_small_height}px
                ${column_large_height}px
                ${column_small_height}px
                ${column_large_height}px
            `,

            width: `${this.Width()}px`,
            height: `${this.Height()}px`,

            border: `${this.Border()}px solid #00000080`,

            backgroundColor: background_color,

            cursor: cursor,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        const cell_index: Model.Board.Cell.Index = this.Index();

        this.Change_Animation({
            animation_name: `Left_To_Right`,
            animation_body: `
                0% {
                    background-position: left;
                }
            
                100% {
                    background-position: right;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Top_To_Bottom`,
            animation_body: `
                0% {
                    background-position: top;
                }
            
                100% {
                    background-position: bottom;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Right_To_Left`,
            animation_body: `
                0% {
                    background-position: right;
                }
            
                100% {
                    background-position: left;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Bottom_To_Top`,
            animation_body: `
                0% {
                    background-position: bottom;
                }
            
                100% {
                    background-position: top;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Flash`,
            animation_body: `
                0% {
                    border-color: black;
                }
            
                50% {
                    border-color: white;
                }
            
                100% {
                    border-color: black;
                }
            `,
        });

        return ([
            {
                event_name: new Event.Name(Event.AFTER, Event.PLAYER_SELECT_STAKE),
                event_handler: this.After_Player_Select_Stake,
            },
            {
                event_name: new Event.Name(Event.BEFORE, Event.PLAYER_PLACE_STAKE),
                event_handler: this.Before_Player_Place_Stake,
            },
            {
                event_name: new Event.Name(Event.ON, Event.BOARD_CHANGE_CELL, cell_index.toString()),
                event_handler: this.On_Board_Change_This_Cell,
            },
        ]);
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            event.stopPropagation();

            const arena: Model.Arena.Instance = this.Board().Model().Arena();
            if (arena.Is_On_Human_Turn() && arena.Is_Input_Enabled()) {
                arena.Disable_Input();

                if (this.Board().Model().Is_Cell_Selectable(this.Index())) {
                    const player_index: Model.Player.Index =
                        this.Board().Model().Current_Player_Index();
                    const stake_index: Model.Stake.Index =
                        this.Arena().Model().Current_Player().Selected_Stake_Index() as Model.Stake.Index;
                    const cell_index: Model.Board.Cell.Index =
                        this.Index();

                    await this.Send({
                        name_affix: Event.PLAYER_PLACE_STAKE,
                        name_suffixes: [
                            player_index.toString(),
                        ],
                        data: {
                            player_index,
                            stake_index,
                            cell_index,
                        } as Event.Player_Place_Stake_Data,
                        is_atomic: true,
                    });
                }

                arena.Enable_Input();
            }
        }
    }

    async After_Player_Select_Stake(
        {
        }: Event.Player_Select_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (
                this.Board().Model().Is_Cell_Selectable(this.Index()) &&
                this.Arena().Model().Current_Player().Is_Human()
            ) {
                // we only need to update the cursor for empty cells
                this.Change_Style(`cursor`, `pointer`);
            }
        }
    }

    async Before_Player_Place_Stake(
        {
            player_index,
            cell_index,
        }: Event.Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Model()().Is_Empty()) {
                // we only need to update the cursor for empty cells
                this.Change_Style(`cursor`, `default`);
            }
            if (this.Index() === cell_index) {
                this.current_color = this.Arena().Model().Player(player_index).Color();
            }
        }
    }

    async On_Board_Change_This_Cell(
        {
            turn_result,
        }: Event.Board_Change_Cell_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Board.Cell.Instance = this.Model()();

            if (turn_result.old_claimant != null) {
                await this.Change_Card_Color(
                    turn_result.old_claimant.Color(),
                    model.Color(),
                    turn_result.direction,
                );
                if (this.Is_Alive()) {
                    if (this.Is_Alive()) {
                        const old_claimant: Model.Player.Instance = turn_result.old_claimant;
                        const new_claimant: Model.Player.Instance = model.Claimant();
                        const old_claimant_index: Model.Player.Index = old_claimant.Index();
                        const new_claimant_index: Model.Player.Index = new_claimant.Index();
                        await Promise.all([
                            this.Send({
                                name_affix: Event.PLAYER_CHANGE_SCORE,
                                name_suffixes: [
                                    old_claimant_index.toString(),
                                ],
                                data: {
                                    player_index: old_claimant_index,
                                    score_delta: -1,
                                } as Event.Player_Change_Score_Data,
                                is_atomic: false,
                            }),
                            this.Send({
                                name_affix: Event.PLAYER_CHANGE_SCORE,
                                name_suffixes: [
                                    new_claimant_index.toString(),
                                ],
                                data: {
                                    player_index: new_claimant_index,
                                    score_delta: 1,
                                } as Event.Player_Change_Score_Data,
                                is_atomic: false,
                            }),
                            this.Send({
                                name_affix: Event.BOARD_CHANGE_SCORE,
                                name_suffixes: [
                                ],
                                data: {
                                    player_index_to_decrement: old_claimant_index,
                                    player_index_to_increment: new_claimant_index,
                                } as Event.Board_Change_Score_Data,
                                is_atomic: false,
                            }),
                            this.Animate({
                                animation_name: `Flash`,
                                duration_in_milliseconds: 300,
                                css_iteration_count: `1`,
                                css_timing_function: `ease-in`,
                            })
                        ]);
                        if (this.Is_Alive()) {
                            this.Deanimate();

                            await Wait(TURN_RESULT_WAIT_MILLISECONDS);
                        }
                    }
                }
            } else {
                await this.Refresh();
                if (this.Is_Alive()) {
                    await Wait(TURN_RESULT_WAIT_MILLISECONDS);
                }
            }

            if (this.Is_Alive()) {
                if (
                    turn_result.combo ||
                    turn_result.same.left ||
                    turn_result.same.top ||
                    turn_result.same.right ||
                    turn_result.same.bottom ||
                    turn_result.plus.left ||
                    turn_result.plus.top ||
                    turn_result.plus.right ||
                    turn_result.plus.bottom
                ) {
                    this.popups = [
                        <Popup.Center
                            key={`center`}

                            model={turn_result}
                            parent={this}
                            event_grid={this.Event_Grid()}
                            index={this.Index()}
                        />,
                        <Popup.Left
                            key={`left`}

                            model={turn_result}
                            parent={this}
                            event_grid={this.Event_Grid()}
                            index={this.Index()}
                        />,
                        <Popup.Top
                            key={`top`}

                            model={turn_result}
                            parent={this}
                            event_grid={this.Event_Grid()}
                            index={this.Index()}
                        />,
                        <Popup.Right
                            key={`right`}

                            model={turn_result}
                            parent={this}
                            event_grid={this.Event_Grid()}
                            index={this.Index()}
                        />,
                        <Popup.Bottom
                            key={`bottom`}

                            model={turn_result}
                            parent={this}
                            event_grid={this.Event_Grid()}
                            index={this.Index()}
                        />,
                    ];

                    await this.Refresh();
                    if (this.Is_Alive()) {
                        await Wait(TURN_RESULT_WAIT_MILLISECONDS);
                        if (this.Is_Alive()) {
                            this.popups = null;
                            await this.Refresh();
                        }
                    }
                }
            }
        }
    }

    private async Change_Card_Color(
        old_color: Model.Color.Instance,
        new_color: Model.Color.Instance,
        direction: Model.Enum.Direction,
    ):
        Promise<void>
    {
        const old_background_color: string =
            `rgba(
                ${old_color.Red()},
                ${old_color.Green()},
                ${old_color.Blue()},
                ${old_color.Alpha()}
            )`;
        const new_background_color: string =
            `rgba(
                ${new_color.Red()},
                ${new_color.Green()},
                ${new_color.Blue()},
                ${new_color.Alpha()}
            )`;
        const animation_duration: number =
            Math.ceil(TURN_RESULT_WAIT_MILLISECONDS * TURN_RESULT_TRANSITION_RATIO);

        this.current_color = old_color;

        let background_size: string = ``;
        let from_position: string = ``;
        let to_position: string = ``;
        let animation_name: string = ``;
        if (direction === Model.Enum.Direction.LEFT) {
            background_size = `1000% 100%`;
            from_position = `left`;
            to_position = `right`;
            animation_name = `Left_To_Right`;
        } else if (direction === Model.Enum.Direction.TOP) {
            background_size = `100% 1000%`;
            from_position = `top`;
            to_position = `bottom`;
            animation_name = `Top_To_Bottom`;
        } else if (direction === Model.Enum.Direction.RIGHT) {
            background_size = `1000% 100%`;
            from_position = `right`;
            to_position = `left`;
            animation_name = `Right_To_Left`;
        } else if (direction === Model.Enum.Direction.BOTTOM) {
            background_size = `100% 1000%`;
            from_position = `bottom`;
            to_position = `top`;
            animation_name = `Bottom_To_Top`;
        }

        this.Change_Style(
            `backgroundColor`,
            old_background_color,
        );
        this.Change_Style(
            `backgroundImage`,
            `linear-gradient(
                to ${to_position},
                ${old_background_color},
                ${new_background_color}
            )`,
        );
        this.Change_Style(
            `backgroundSize`,
            background_size,
        );
        this.Change_Style(
            `backgroundPosition`,
            from_position,
        )

        await this.Animate({
            animation_name: animation_name,
            duration_in_milliseconds: animation_duration,
            css_iteration_count: `1`,
            css_timing_function: `ease-in-out`,
        });
        if (this.Is_Alive()) {
            this.current_color = new_color;

            this.Change_Style(`backgroundColor`, new_background_color);
            this.Change_Style(`backgroundImage`, ``);
            this.Change_Style(`backgroundSize`, `100% 100%`);

            this.Deanimate();
        }
    }
}
