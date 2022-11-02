import { Float } from "../../types";

import { Assert } from "../../utils";
import { Wait } from "../../utils";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Arena } from "../arena";
import { Board } from "../board";
import { Cells } from "./cells";

const TURN_RESULT_WAIT_MILLISECONDS: number = 667;
const TURN_RESULT_TRANSITION_RATIO: number = 1 / 2;

type Cell_Props = {
    model: () => Model.Cell;
    parent: Cells;
    event_grid: Event.Grid;
    index: Model.Cell_Index;
}

export class Cell extends Component<Cell_Props>
{
    private current_color: Model.Color | null = null;
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
        Model.Cell_Index
    {
        return this.props.index;
    }

    Width():
        Float
    {
        return this.Arena().Measurements().Board_Cell_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Board_Cell_Height();
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
            const color: Model.Color = this.current_color as Model.Color;
            Assert(color != null);

            background_color = `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha()}
            )`;

            cursor = `default`;
        }

        return ({
            display: `grid`,
            gridTemplateColumns: `4fr 3fr 4fr 3fr 4fr`,
            gridTemplateRows: `4fr 3fr 4fr 3fr 4fr`,
            columnGap: `5%`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            border: `0.3vmin solid #00000080`,

            backgroundColor: background_color,

            cursor: cursor,
        });
    }

    override On_Life():
        Event.Listener_Info[]
    {
        const cell_index: Model.Cell_Index = this.Index();

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

            const arena: Model.Arena = this.Board().Model().Arena();
            if (arena.Is_On_Human_Turn() && arena.Is_Input_Enabled()) {
                arena.Disable_Input();

                if (this.Board().Model().Is_Cell_Selectable(this.Index())) {
                    const player_index: Model.Player_Index =
                        this.Board().Model().Current_Player_Index();
                    const stake_index: Model.Stake_Index =
                        this.Arena().Model().Current_Player().Selected_Stake_Index() as Model.Stake_Index;
                    const cell_index: Model.Cell_Index =
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
            const model: Model.Cell = this.Model()();

            if (turn_result.old_claimant != null) {
                const old_color: Model.Color = turn_result.old_claimant.Color();
                const new_color: Model.Color = model.Color();
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
                if (turn_result.direction === Model.Direction_e.LEFT) {
                    background_size = `1000% 100%`;
                    from_position = `left`;
                    to_position = `right`;
                    animation_name = `Left_To_Right`;
                } else if (turn_result.direction === Model.Direction_e.TOP) {
                    background_size = `100% 1000%`;
                    from_position = `top`;
                    to_position = `bottom`;
                    animation_name = `Top_To_Bottom`;
                } else if (turn_result.direction === Model.Direction_e.RIGHT) {
                    background_size = `1000% 100%`;
                    from_position = `right`;
                    to_position = `left`;
                    animation_name = `Right_To_Left`;
                } else if (turn_result.direction === Model.Direction_e.BOTTOM) {
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

                    await Wait(200);
                    if (this.Is_Alive()) {
                        const old_claimant: Model.Player = turn_result.old_claimant;
                        const new_claimant: Model.Player = model.Claimant();
                        const old_claimant_index: Model.Player_Index = old_claimant.Index();
                        const new_claimant_index: Model.Player_Index = new_claimant.Index();
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
                    this.popups = [];

                    if (turn_result.combo) {
                        this.popups.push(
                            <div
                                key={`center`}
                                className={`Board_Cell_Center`}
                                style={{
                                    display: `flex`,
                                    flexDirection: `column`,
                                    justifyContent: `center`,

                                    width: `100%`,
                                    height: `100%`,

                                    gridColumn: `2 / span 3`,
                                    gridRow: `3 / span 1`,
                                    alignSelf: `center`,
                                    justifySelf: `center`,
                                    zIndex: `1`,

                                    backgroundColor: `rgba(0, 0, 0, 0.5)`,

                                    borderRadius: `30%`,

                                    color: `white`,
                                    textAlign: `center`,
                                }}
                            >
                                <div>COMBO</div>
                            </div>
                        );
                    }
                    for (const [class_name, key, has_same, has_plus, styles] of [
                        [
                            `Board_Cell_Left`,
                            `left`,
                            turn_result.same.left,
                            turn_result.plus.left,
                            {
                                display: `flex`,
                                flexDirection: `column`,
                                justifyContent: `center`,

                                width: `100%`,
                                height: `100%`,

                                gridColumn: `1 / span 1`,
                                gridRow: `3 / span 1`,
                                alignSelf: `center`,
                                justifySelf: `start`,
                                zIndex: `1`,

                                backgroundColor: `rgba(0, 0, 0, 0.5)`,

                                borderRadius: `50%`,

                                color: `white`,
                                textAlign: `center`,
                            },
                        ],
                        [
                            `Board_Cell_Top`,
                            `top`,
                            turn_result.same.top,
                            turn_result.plus.top,
                            {
                                display: `flex`,
                                flexDirection: `column`,
                                justifyContent: `center`,

                                width: `100%`,
                                height: `100%`,

                                gridColumn: `3 / span 1`,
                                gridRow: `1 / span 1`,
                                alignSelf: `start`,
                                justifySelf: `center`,
                                zIndex: `1`,

                                backgroundColor: `rgba(0, 0, 0, 0.5)`,

                                borderRadius: `50%`,

                                color: `white`,
                                textAlign: `center`,
                            },
                        ],
                        [
                            `Board_Cell_Right`,
                            `right`,
                            turn_result.same.right,
                            turn_result.plus.right,
                            {
                                display: `flex`,
                                flexDirection: `column`,
                                justifyContent: `center`,

                                width: `100%`,
                                height: `100%`,

                                gridColumn: `5 / span 1`,
                                gridRow: `3 / span 1`,
                                alignSelf: `center`,
                                justifySelf: `end`,
                                zIndex: `1`,

                                backgroundColor: `rgba(0, 0, 0, 0.5)`,

                                borderRadius: `50%`,

                                color: `white`,
                                textAlign: `center`,
                            },
                        ],
                        [
                            `Board_Cell_Bottom`,
                            `bottom`,
                            turn_result.same.bottom,
                            turn_result.plus.bottom,
                            {
                                display: `flex`,
                                flexDirection: `column`,
                                justifyContent: `center`,

                                width: `100%`,
                                height: `100%`,

                                gridColumn: `3 / span 1`,
                                gridRow: `5 / span 1`,
                                alignSelf: `end`,
                                justifySelf: `center`,
                                zIndex: `1`,

                                backgroundColor: `rgba(0, 0, 0, 0.5)`,

                                borderRadius: `50%`,

                                color: `white`,
                                textAlign: `center`,
                            },
                        ],
                    ] as Array<
                        [
                            string,
                            string,
                            boolean,
                            boolean,
                            any,
                        ]
                    >) {
                        if (has_same) {
                            if (has_plus) {
                                this.popups.push(
                                    <div
                                        key={key}
                                        className={class_name}
                                        style={styles}
                                    >
                                        <div>=</div>
                                        <div>+</div>
                                    </div>
                                );
                            } else {
                                this.popups.push(
                                    <div
                                        key={key}
                                        className={class_name}
                                        style={styles}
                                    >
                                        <div>=</div>
                                    </div>
                                );
                            }
                        } else if (has_plus) {
                            this.popups.push(
                                <div
                                    key={key}
                                    className={class_name}
                                    style={styles}
                                >
                                    <div>+</div>
                                </div>
                            );
                        }
                    }

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
}
