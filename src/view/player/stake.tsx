import { Integer } from "../../types";
import { Index } from "../../types";
import { Float } from "../../types";

import { Assert } from "../../utils";
import { Wait } from "../../utils";
import { Plot_Bezier_Curve_4 } from "../../utils";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Component_Animation_Frame } from "../component";

import { Main } from "../main";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Player } from "../player";
import { Hand } from "./hand";

type Stake_Props = {
    model: Model.Stake.Instance;
    parent: Hand;
    event_grid: Event.Grid;
    index: Model.Stake.Index;
}

export class Stake extends Component<Stake_Props>
{
    static X_Offset_Multiplier():
        Float
    {
        return 0.78;
    }

    static Y_Offset_Multiplier():
        Float
    {
        return 0.48;
    }

    Main():
        Main
    {
        return this.Arena().Main();
    }

    Arena():
        Arena
    {
        return this.Player().Arena();
    }

    Player():
        Player
    {
        return this.Player_Hand().Player();
    }

    Player_Hand():
        Hand
    {
        return this.Parent();
    }

    Index():
        Model.Stake.Index
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
        return this.Measurements().Player_Stake_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Player_Stake_Height();
    }

    X_Offset():
        Float
    {
        return this.Width() * Stake.X_Offset_Multiplier() * this.Index();
    }

    Y_Offset():
        Float
    {
        return this.Height() * Stake.Y_Offset_Multiplier() * this.Index();
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Stake.Instance = this.Model();
        const is_of_human: boolean = this.Model().Is_Of_Human();
        const is_selectable: boolean = this.Model().Is_Selectable();

        return (
            <div
                className={`Stake`}
                onClick={
                    is_of_human && is_selectable ?
                        event => this.On_Click(event) :
                        () => { }
                }
            >
                <img
                    style={{
                        width: `90%`,
                        height: `90%`,

                        cursor: is_of_human && is_selectable ?
                            `pointer` :
                            `default`,
                    }}
                    src={model.Card().Image()}
                    alt={``}
                />
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const measurements: Game_Measurements = this.Measurements();
        const model: Model.Stake.Instance = this.Model();
        const color: Model.Color.HSLA = model.Color();
        const is_of_human: boolean = this.Model().Is_Of_Human();
        const is_selectable: boolean = this.Model().Is_Selectable();

        let flex_direction: string;
        let left: string;
        let top: string;
        if (measurements.Is_Vertical()) {
            flex_direction = `row`;
            left = `${this.X_Offset()}px`;
            top = `0`;
        } else {
            flex_direction = `column`;
            left = `0`;
            top = `${this.Y_Offset()}px`;
        }

        let border: string;
        if (model.Is_Selected()) {
            border = `0.15vmin solid white`;
        } else {
            border = `0.15vmin solid black`;
        }

        let cursor: string;
        if (is_of_human && is_selectable) {
            cursor = `pointer`;
        } else {
            cursor = `default`;
        }

        return ({
            display: `flex`,
            flexDirection: flex_direction,
            justifyContent: `center`,
            alignItems: `center`,

            width: `${this.Width()}px`,
            height: `${this.Height()}px`,

            position: `absolute`,
            left: left,
            top: top,
            zIndex: `${this.Index()}`,

            backgroundColor: `hsl(
                ${color.Hue()},
                ${color.Saturation()}%,
                ${color.Lightness()}%,
                ${color.Alpha()}
            )`,

            border: border,

            cursor: cursor,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        const player_index: Model.Player.Index = this.Player().Index();

        return ([
            {
                event_name: new Event.Name(Event.BEFORE, Event.PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.Before_This_Player_Place_Stake,
            },
        ]);
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            event.stopPropagation();

            const arena: Model.Arena.Instance = this.Model().Arena();
            if (arena.Is_Input_Enabled()) {
                arena.Disable_Input();

                if (this.Model().Is_On_Player()) {
                    const player: Model.Player.Instance = this.Model().Origin();
                    if (player.Is_On_Turn()) {
                        const player_index: Model.Player.Index = player.Index();
                        const stake_index: Model.Stake.Index = this.Index();

                        await this.Send({
                            name_affix: Event.PLAYER_SELECT_STAKE,
                            name_suffixes: [
                                player_index.toString(),
                            ],
                            data: {
                                player_index,
                                stake_index,
                            } as Event.Player_Select_Stake_Data,
                            is_atomic: true,
                        });
                    }
                }

                arena.Enable_Input();
            }
        }
    }

    async Before_This_Player_Place_Stake(
        {
            stake_index,
            cell_index,
        }: Event.Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (stake_index === this.Index()) {
                await this.Animate({
                    animation_name: `Twinkle_Border`,
                    animation_owner_id: this.Main().ID(),
                    duration_in_milliseconds: 500,
                    css_timing_function: `ease-in-out`,
                });
                if (this.Is_Alive()) {
                    await Wait(100);
                    if (this.Is_Alive()) {
                        await this.Move_To_Cell({
                            cell_index: cell_index,
                            duration: 500,
                        });
                    }
                }
            }
        }
    }

    private async Move_To_Cell(
        {
            cell_index,
            duration,
        }: {
            cell_index: Model.Board.Cell.Index,
            duration: Integer,
        },
    ):
        Promise<void>
    {
        Assert(duration > 0);

        if (this.Is_Alive()) {
            const hand_element: HTMLElement =
                this.Player_Hand().Some_Element();
            const stake_element: HTMLElement =
                this.Some_Element();
            const cell_element: HTMLElement =
                this.Arena().Board().Cells().Cell(cell_index).Some_Element();

            const stake_rect: DOMRect =
                stake_element.getBoundingClientRect();
            const stake_old_left: Float =
                stake_rect.left;
            const stake_old_top: Float =
                stake_rect.top;

            stake_element.style.position = `fixed`;
            stake_element.style.left = `${stake_old_left}px`;
            stake_element.style.top = `${stake_old_top}px`;

            hand_element.style.zIndex = `1`;
            await this.Animate_By_Frame(
                On_Frame,
                {
                    stake_element: stake_element,
                    stake_old_left: stake_old_left,
                    stake_old_top: stake_old_top,
                    cell_element: cell_element,
                    duration: duration,
                    plot: Plot_Bezier_Curve_4(
                        1.0 / (duration / 15),
                        1.0,
                        0.0, 0.0,
                        0.42, 0.0,
                        0.58, 1.0,
                        1.0, 1.0,
                    ),
                },
            );
            hand_element.style.zIndex = `0`;

            function On_Frame(
                {
                    elapsed,
                }: Component_Animation_Frame,
                state: {
                    stake_element: HTMLElement,
                    stake_old_left: Float,
                    stake_old_top: Float,
                    cell_element: HTMLElement,
                    duration: Integer,
                    plot: Array<{
                        x: Float,
                        y: Float,
                    }>,
                },
            ):
                boolean
            {
                const cell_rect: DOMRect =
                    cell_element.getBoundingClientRect();
                const stake_new_left: Float =
                    cell_rect.left;
                const stake_new_top: Float =
                    cell_rect.top;

                if (elapsed >= state.duration) {
                    state.stake_element.style.left = `${stake_new_left}px`;
                    state.stake_element.style.top = `${stake_new_top}px`;

                    return false;
                } else {
                    const index: Index =
                        Math.floor(elapsed * state.plot.length / state.duration);
                    const left_distance: Float =
                        stake_new_left - stake_old_left;
                    const top_distance: Float =
                        stake_new_top - stake_old_top;

                    state.stake_element.style.left =
                        `${stake_old_left + (left_distance * state.plot[index].y)}px`;
                    state.stake_element.style.top =
                        `${stake_old_top + (top_distance * state.plot[index].y)}px`;

                    return true;
                }
            }
        }
    }
}
