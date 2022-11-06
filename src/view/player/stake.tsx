
import { Float } from "../../types";

import { Wait } from "../../utils";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
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
    static Width_Multiplier():
        Float
    {
        return 0.78;
    }

    static Height_Multiplier():
        Float
    {
        return 0.48;
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
        const color: Model.Color.Instance = model.Color();
        const is_of_human: boolean = this.Model().Is_Of_Human();
        const is_selectable: boolean = this.Model().Is_Selectable();

        let flex_direction: string;
        let left: string;
        let top: string;
        if (measurements.Is_Vertical()) {
            flex_direction = `row`;
            left = `calc(
                ${this.CSS_Width()} *
                ${Stake.Width_Multiplier()} *
                ${this.Index()}
            )`;
            top = `0`;
        } else {
            flex_direction = `column`;
            left = `0`;
            top = `calc(
                ${this.CSS_Height()} *
                ${Stake.Height_Multiplier()} *
                ${this.Index()}
            )`;
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

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `absolute`,
            left: left,
            top: top,
            zIndex: `${this.Index()}`,

            backgroundColor: `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
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

        this.Change_Animation({
            animation_name: `Twinkle`,
            animation_body: `
                0% {
                    border-color: white;
                }
            
                25% {
                    border-color: black;
                }
            
                50% {
                    border-color: white;
                }
            
                75% {
                    border-color: black;
                }
            
                100% {
                    border-color: white;
                }
            `,
        });

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
        }: Event.Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (stake_index === this.Index()) {
                await this.Animate({
                    animation_name: `Twinkle`,
                    duration_in_milliseconds: 500,
                    css_iteration_count: `1`,
                    css_timing_function: `ease-in-out`,
                });

                if (this.Is_Alive()) {
                    this.Deanimate();
                    await Wait(100);
                }
            }
        }
    }
}
