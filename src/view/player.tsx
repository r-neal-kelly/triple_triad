import { Integer } from "../types";
import { Float } from "../types";

import { Wait } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Arena } from "./arena";
import { Group } from "./player/group";
import { Bumper } from "./player/bumper";
import { Hand } from "./player/hand";

type Player_Props = {
    model: Model.Player;
    parent: Group;
    event_grid: Event.Grid;
}

export class Player extends Component<Player_Props>
{
    static Alpha_Highlight_Multiplier():
        Float
    {
        return 0.7;
    }

    static AI_Selection_Wait_Milliseconds():
        Integer
    {
        return 667;
    }

    private bumper: Bumper | null = null;
    private hand: Hand | null = null;

    Arena():
        Arena
    {
        return this.Group().Arena();
    }

    Group():
        Group
    {
        return this.Parent();
    }

    Bumper():
        Bumper
    {
        return this.Try_Object(this.bumper);
    }

    Hand():
        Hand
    {
        return this.Try_Object(this.hand);
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Width():
        Float
    {
        return this.Arena().Measurements().Player_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Player_Height();
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
        const model: Model.Player = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();
        const index: Model.Player_Index = this.Index();

        return (
            <div
                className={`Player`}
            >
                <Bumper
                    key={`bumper_${index}`}
                    ref={ref => this.bumper = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Hand
                    key={`hand_${index}`}
                    ref={ref => this.hand = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const model: Model.Player = this.Model();
        const color: Model.Color = this.Model().Color();

        let background_color: string;
        if (model.Is_On_Turn()) {
            background_color = `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha() * Player.Alpha_Highlight_Multiplier()}
            )`;
        } else {
            background_color = `transparent`;
        }

        return ({
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `relative`,

            backgroundColor: background_color,
        });
    }

    override On_Life():
        Event.Listener_Info[]
    {
        const player_index: Model.Player_Index = this.Index();

        return ([
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_START_TURN, player_index.toString()),
                event_handler: this.On_This_Player_Start_Turn,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_SELECT_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Select_Stake,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_STOP_TURN, player_index.toString()),
                event_handler: this.On_This_Player_Stop_Turn,
            },
            {
                event_name: new Event.Name(Event.ON, Event.GAME_STOP),
                event_handler: this.On_Game_Stop,
            },
        ]);
    }

    async On_This_Player_Start_Turn(
        {
            player_index,
        }: Event.Player_Start_Turn_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();

            if (this.Is_Alive()) {
                // We need to simulate the computer_player choosing a card
                if (this.Model().Is_Computer()) {
                    const computer_player: Model.Computer_Player =
                        this.Model() as Model.Computer_Player;
                    const {
                        selection_indices,
                        cell_index,
                    } = await computer_player.Choose_Stake_And_Cell();

                    if (this.Is_Alive()) {
                        for (const selection_index of selection_indices) {
                            await this.Send({
                                name_affix: Event.PLAYER_SELECT_STAKE,
                                name_suffixes: [
                                    player_index.toString(),
                                ],
                                data: {
                                    player_index,
                                    stake_index: selection_index,
                                } as Event.Player_Select_Stake_Data,
                                is_atomic: true,
                            });

                            if (this.Is_Alive()) {
                                // might be fun to randomize this
                                await Wait(Player.AI_Selection_Wait_Milliseconds());

                                if (this.Is_Dead()) {
                                    return;
                                }
                            } else {
                                return;
                            }
                        }

                        this.Send({
                            name_affix: Event.PLAYER_PLACE_STAKE,
                            name_suffixes: [
                                player_index.toString(),
                            ],
                            data: {
                                player_index,
                                stake_index: selection_indices[selection_indices.length - 1],
                                cell_index,
                            } as Event.Player_Place_Stake_Data,
                            is_atomic: true,
                        });
                    }
                }
            }
        }
    }

    async On_This_Player_Select_Stake(
        {
            stake_index,
        }: Event.Player_Select_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Select_Stake(stake_index);
            await this.Refresh();
        }
    }

    async On_This_Player_Stop_Turn(
        {
        }: Event.Player_Stop_Turn_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }

    async On_Game_Stop(
        {
        }: Event.Game_Stop_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }
}
