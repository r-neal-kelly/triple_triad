import "./view.css";

import React from "react";

import { Index } from "./types";
import { Float } from "./types";

import { Assert } from "./utils";
import { Wait } from "./utils";
import { Random_Integer_Exclusive } from "./utils";

import * as Model from "./model";

import * as Event from "./view/event";
import { Component } from "./view/component";
import { Component_Styles } from "./view/component";
import { Main } from "./view/main";
import { Game } from "./view/game";
import { Arena } from "./view/arena";
import { Player_Group } from "./view/player_group";

const PLAYER_STAKE_HEIGHT_MULTIPLIER: number = 0.48;
const PLAYER_ALPHA_HIGHLIGHT_MULTIPLIER: number = 0.7;
const AI_SELECTION_WAIT_MILLISECONDS: number = 667;
const TURN_RESULT_WAIT_MILLISECONDS: number = 667;
const TURN_RESULT_TRANSITION_RATIO: number = 1 / 2;

type Exhibitions_Props = {
    model: Model.Main;
    parent: Main;
    event_grid: Event.Grid;
}

export class Exhibitions extends Component<Exhibitions_Props>
{
    private exhibitions: Array<Exhibition | null> =
        new Array(this.Model().Exhibition_Count()).fill(null);
    private exhibition_event_grids: Array<Event.Grid> =
        Array.from(new Array(this.Model().Exhibition_Count()).fill(null).map(() => new Event.Grid()));

    private is_switching: boolean = false;
    private last_switch_method_index: Index = Number.MAX_SAFE_INTEGER;

    Main():
        Main
    {
        return this.Parent();
    }

    Exhibition(exhibition_index: Model.Exhibition_Index):
        Exhibition
    {
        return this.Try_Array_Index(this.exhibitions, exhibition_index);
    }

    Exhibitions():
        Array<Exhibition>
    {
        return this.Try_Array(this.exhibitions);
    }

    Exhibition_Event_Grid(exhibition_index: Model.Exhibition_Index):
        Event.Grid
    {
        return this.Try_Array_Index(this.exhibition_event_grids, exhibition_index);
    }

    Exhibition_Event_Grids():
        Array<Event.Grid>
    {
        return this.Try_Array(this.exhibition_event_grids);
    }

    Is_Switching():
        boolean
    {
        return this.is_switching;
    }

    Width():
        Float
    {
        return this.Parent().Width();
    }

    Height():
        Float
    {
        return this.Parent().Height();
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

    Refresh_Animations():
        void
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

        this.Change_Animation({
            animation_name: `Fade_Out`,
            animation_body: `
                0% {
                    opacity: 100%;
                }
            
                100% {
                    opacity: 0%;
                }
            `,
        });
    }

    Refresh_Styles():
        void
    {
        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());
    }

    Before_Life():
        Component_Styles
    {
        this.Refresh_Animations();

        return ({
            display: `none`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            overflowX: `hidden`,
            overflowY: `hidden`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Main = this.Model();
        const exhibition_count: Model.Exhibition_Count = model.Exhibition_Count();

        this.Refresh_Styles();

        return (
            <div
                className={`Exhibitions`}
                style={this.Styles()}
            >
                {
                    Array(exhibition_count).fill(null).map((
                        _: null,
                        exhibition_index: Model.Exhibition_Index,
                    ):
                        JSX.Element =>
                    {
                        return (
                            <Exhibition
                                key={`exhibition_${exhibition_index}`}
                                ref={ref => this.exhibitions[exhibition_index] = ref}

                                model={model.Exhibition(exhibition_index)}
                                parent={this}
                                event_grid={this.Exhibition_Event_Grid(exhibition_index)}
                            />
                        );
                    })
                }
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        return [
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
            {
                event_name: new Event.Name(Event.ON, Event.START_EXHIBITIONS),
                event_handler: this.On_Start_Exhibitions,
            },
            {
                event_name: new Event.Name(Event.ON, Event.STOP_EXHIBITIONS),
                event_handler: this.On_Stop_Exhibitions,
            },
            {
                event_name: new Event.Name(Event.ON, Event.SWITCH_EXHIBITIONS),
                event_handler: this.On_Switch_Exhibitions,
            },
        ];
    }

    On_Resize(
        {
            width,
            height,
        }: Event.Resize_Data,
    ):
        void
    {
        if (this.Is_Alive()) {
            this.Refresh_Styles();

            this.Send({
                name_affix: `${Event.RESIZE}_${this.ID()}`,
                data: {
                    width,
                    height,
                } as Event.Resize_Data,
                is_atomic: false,
            });
        }
    }

    async On_Start_Exhibitions(
        {
            exhibition,
        }: Event.Start_Exhibitions_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Change_Style(`display`, ``);
            await this.Animate({
                animation_name: `Fade_In`,
                duration_in_milliseconds: 2000,
                css_iteration_count: `1`,
                css_timing_function: `ease-in-out`,
                css_fill_mode: `forward`,
            });
            this.Deanimate();
        }
    }

    async On_Stop_Exhibitions(
        {
        }: Event.Stop_Exhibitions_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Animate({
                animation_name: `Fade_Out`,
                duration_in_milliseconds: 2000,
                css_iteration_count: `1`,
                css_timing_function: `ease-in-out`,
                css_fill_mode: `forward`,
            });
            this.Deanimate();
            this.Change_Style(`display`, `none`);
        }
    }

    async On_Switch_Exhibitions(
        {
            previous_exhibition,
            next_exhibition,
        }: Event.Switch_Exhibitions_Data,
    ):
        Promise<void>
    {
        this.is_switching = true;

        if (this.Is_Alive()) {
            const previous: Exhibition = this.Exhibition(previous_exhibition.Index());
            const next: Exhibition = this.Exhibition(next_exhibition.Index());

            // we do several cool different transitions,
            // including fade-outs and swipes in various directions
            const methods: Array<() => Promise<[void, void]>> = [
                () => Promise.all([
                    previous.Animate({
                        animation_name: `Exit_Right`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                    next.Animate({
                        animation_name: `Enter_Left`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                ]),
                () => Promise.all([
                    previous.Animate({
                        animation_name: `Exit_Bottom`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                    next.Animate({
                        animation_name: `Enter_Top`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                ]),
                () => Promise.all([
                    previous.Animate({
                        animation_name: `Exit_Left`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                    next.Animate({
                        animation_name: `Enter_Right`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                ]),
                () => Promise.all([
                    previous.Animate({
                        animation_name: `Exit_Top`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                    next.Animate({
                        animation_name: `Enter_Bottom`,
                        duration_in_milliseconds: 2000,
                        css_iteration_count: `1`,
                        css_timing_function: `ease-in-out`,
                        css_fill_mode: `forwards`,
                    }),
                ]),
            ];

            let method_index: Index = this.last_switch_method_index;
            while (method_index === this.last_switch_method_index) {
                method_index = Random_Integer_Exclusive(0, methods.length);
            }
            this.last_switch_method_index = method_index;

            next.Change_Style(`display`, ``);
            await methods[method_index]();
            if (this.Is_Alive()) {
                previous.Change_Style(`display`, `none`);

                previous.Deanimate();
                next.Deanimate();

                await Promise.all([
                    previous.Refresh(),
                    next.Refresh(),
                ]);
            }
        }

        this.is_switching = false;
    }
}

type Exhibition_Props = {
    model: Model.Exhibition;
    parent: Exhibitions;
    event_grid: Event.Grid;
}

export class Exhibition extends Component<Exhibition_Props>
{
    private game: Game | null = null;

    Exhibitions():
        Exhibitions
    {
        return this.Parent();
    }

    Game():
        Game
    {
        return this.Try_Object(this.game);
    }

    Width():
        Float
    {
        return this.Parent().Width();
    }

    Height():
        Float
    {
        return this.Parent().Height();
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

        this.Change_Animation({
            animation_name: `Fade_Out`,
            animation_body: `
                0% {
                    opacity: 100%;
                }
            
                100% {
                    opacity: 0%;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Enter_Left`,
            animation_body: `
                0% {
                    left: -100%;
                    opacity: 0%;
                }
            
                100% {
                    left: 0;
                    opacity: 100%;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Enter_Top`,
            animation_body: `
                0% {
                    top: -100%;
                    opacity: 0%;
                }
            
                100% {
                    top: 0;
                    opacity: 100%;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Enter_Right`,
            animation_body: `
                0% {
                    left: 100%;
                    opacity: 0%;
                }
            
                100% {
                    left: 0;
                    opacity: 100%;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Enter_Bottom`,
            animation_body: `
                0% {
                    top: 100%;
                    opacity: 0%;
                }
            
                100% {
                    top: 0;
                    opacity: 100%;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Exit_Left`,
            animation_body: `
                0% {
                    left: 0;
                    opacity: 100%;
                }
            
                100% {
                    left: -100%;
                    opacity: 0%;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Exit_Top`,
            animation_body: `
                0% {
                    top: 0;
                    opacity: 100%;
                }
            
                100% {
                    top: -100%;
                    opacity: 0%;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Exit_Right`,
            animation_body: `
                0% {
                    left: 0;
                    opacity: 100%;
                }
            
                100% {
                    left: 100%;
                    opacity: 0%;
                }
            `,
        });

        this.Change_Animation({
            animation_name: `Exit_Bottom`,
            animation_body: `
                0% {
                    top: 0;
                    opacity: 100%;
                }
            
                100% {
                    top: 100%;
                    opacity: 0%;
                }
            `,
        });

        return ({
            display: `none`,

            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,
            opacity: `100%`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Exhibition = this.Model();
        const arena: Model.Arena = model.Arena();

        this.Change_Style(`display`, this.Model().Is_Visible() ? `` : `none`);

        return (
            <div
                className={`Exhibition`}
                style={this.Styles()}
            >
                <Game
                    key={`game_${arena.ID()}`}
                    ref={ref => this.game = ref}

                    model={arena}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(Event.AFTER, Event.GAME_STOP),
                event_handler: this.After_Game_Stop,
            },
        ]);
    }

    async After_Game_Stop():
        Promise<void>
    {
        if (this.Is_Alive()) {
            while (
                // this makes me think we may want an Is_Animating() on component
                this.Exhibitions().Is_Switching() ||
                this.Model().Is_Visible()
            ) {
                await Wait(100);
                if (this.Is_Dead()) {
                    break;
                }
            }
            if (this.Is_Alive()) {
                this.Model().Regenerate();
                await this.Refresh();
            }
        }
    }
}

type Player_Props = {
    model: Model.Player;
    parent: Player_Group;
    event_grid: Event.Grid;
}

export class Player extends Component<Player_Props>
{
    private bumper: Player_Bumper | null = null;
    private hand: Player_Hand | null = null;

    Arena():
        Arena
    {
        return this.Group().Arena();
    }

    Group():
        Player_Group
    {
        return this.Parent();
    }

    Bumper():
        Player_Bumper
    {
        return this.Try_Object(this.bumper);
    }

    Hand():
        Player_Hand
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

    Refresh_Styles():
        void
    {
        const model: Model.Player = this.Model();
        const color: Model.Color = this.Model().Color();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        // Highlight the player to indicate it's their turn.
        if (model.Is_On_Turn()) {
            this.Change_Style(
                `backgroundColor`,
                `rgba(
            ${color.Red()},
            ${color.Green()},
            ${color.Blue()},
            ${color.Alpha() * PLAYER_ALPHA_HIGHLIGHT_MULTIPLIER}
        )`,
            );
        } else {
            this.Change_Style(
                `backgroundColor`,
                `transparent`,
            );
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,

            position: `relative`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();
        const index: Model.Player_Index = this.Index();

        this.Refresh_Styles();

        return (
            <div
                className={`Player`}
                style={this.Styles()}
            >
                <Player_Bumper
                    key={`player_bumper_${index}`}
                    ref={ref => this.bumper = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Player_Hand
                    key={`player_hand_${index}`}
                    ref={ref => this.hand = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        const player_index: Model.Player_Index = this.Index();

        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
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
                                await Wait(AI_SELECTION_WAIT_MILLISECONDS);

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

type Player_Bumper_Props = {
    model: Model.Player;
    parent: Player;
    event_grid: Event.Grid;
}

class Player_Bumper extends Component<Player_Bumper_Props>
{
    private name: Player_Name | null = null;
    private score: Player_Score | null = null;

    Arena():
        Arena
    {
        return this.Player().Arena();
    }

    Player():
        Player
    {
        return this.Parent();
    }

    Name():
        Player_Name
    {
        return this.Try_Object(this.name);
    }

    Score():
        Player_Score
    {
        return this.Try_Object(this.score);
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Width():
        Float
    {
        return this.Arena().Measurements().Player_Bumper_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Player_Bumper_Height();
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
        const model: Model.Player = this.Model();
        const color: Model.Color = this.Model().Color();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        if (model.Arena().Is_Game_Over()) {
            this.Change_Style(
                `backgroundColor`,
                `rgba(
                    ${color.Red()},
                    ${color.Green()},
                    ${color.Blue()},
                    ${color.Alpha() * PLAYER_ALPHA_HIGHLIGHT_MULTIPLIER}
                )`
            );
        } else {
            this.Change_Style(
                `backgroundColor`,
                `transparent`,
            );
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `1fr 1fr`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();
        const index: Model.Player_Index = this.Index();

        this.Refresh_Styles();

        return (
            <div
                className={`Player_Bumper`}
                style={this.Styles()}
            >
                <Player_Name
                    key={`player_name_${index}`}
                    ref={ref => this.name = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
                <Player_Score
                    key={`player_score_${index}`}
                    ref={ref => this.score = ref}

                    model={model}
                    parent={this}
                    event_grid={event_grid}
                />
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
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
}

type Player_Name_Props = {
    model: Model.Player;
    parent: Player_Bumper;
    event_grid: Event.Grid;
}

class Player_Name extends Component<Player_Name_Props>
{
    Player_Bumper():
        Player_Bumper
    {
        return this.Parent();
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            color: `white`,
            textAlign: `center`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Player_Name`}
                style={this.Styles()}
            >
                {
                    this.Model().Name()
                }
            </div>
        );
    }
}

type Player_Score_Props = {
    model: Model.Player;
    parent: Player_Bumper;
    event_grid: Event.Grid;
}

class Player_Score extends Component<Player_Score_Props>
{
    Player_Bumper():
        Player_Bumper
    {
        return this.Parent();
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            color: `white`,
            textAlign: `center`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Player_Score`}
                style={this.Styles()}
            >
                {
                    this.Model().Score()
                }
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        const player_index: Model.Player_Index = this.Index();

        return ([
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_CHANGE_SCORE, player_index.toString()),
                event_handler: this.On_This_Player_Change_Score,
            },
        ]);
    }

    async On_This_Player_Change_Score(
        {
            score_delta,
        }: Event.Player_Change_Score_Data
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const element: HTMLElement =
                this.Some_Element();
            element.textContent =
                (parseInt(element.textContent as string) + score_delta).toString();
        }
    }
}

type Player_Hand_Props = {
    model: Model.Player;
    parent: Player;
    event_grid: Event.Grid;
}

class Player_Hand extends Component<Player_Hand_Props>
{
    private stakes: Array<Player_Stake | null> =
        new Array(this.Model().Stake_Count()).fill(null);

    Arena():
        Arena
    {
        return this.Player().Arena();
    }

    Player():
        Player
    {
        return this.Parent();
    }

    Stake(stake_index: Model.Stake_Index):
        Player_Stake
    {
        return this.Try_Array_Index(this.stakes, stake_index);
    }

    Stakes():
        Array<Player_Stake>
    {
        return this.Try_Array(this.stakes);
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Width():
        Float
    {
        return this.Arena().Measurements().Player_Hand_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Player_Hand_Height();
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
        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());
    }

    Before_Life():
        Component_Styles
    {
        return ({
            position: `relative`,

            overflowX: `hidden`,
            overflowY: `auto`,

            scrollbarWidth: `none`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const stake_count: Model.Stake_Count = this.Model().Stake_Count();

        this.Refresh_Styles();

        return (
            <div
                className={`Player_Hand`}
                style={this.Styles()}
            >
                {
                    Array(stake_count).fill(null).map((_, stake_index: Model.Stake_Index) =>
                    {
                        return (
                            <Player_Stake
                                key={`player_stake_${stake_index}`}
                                ref={ref => this.stakes[stake_index] = ref}

                                model={this.Model().Stake(stake_index)}
                                parent={this}
                                event_grid={this.Event_Grid()}
                                index={stake_index}
                            />
                        );
                    })
                }
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        const player_index: Model.Player_Index = this.Model().Index();

        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Place_Stake,
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

    async On_This_Player_Place_Stake(
        {
        }: Event.Player_Place_Stake_Data
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }
}

type Player_Stake_Props = {
    model: Model.Stake;
    parent: Player_Hand;
    event_grid: Event.Grid;
    index: Model.Stake_Index;
}

class Player_Stake extends Component<Player_Stake_Props>
{
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
        Player_Hand
    {
        return this.Parent();
    }

    Index():
        Model.Stake_Index
    {
        return this.props.index;
    }

    Width():
        Float
    {
        return this.Arena().Measurements().Player_Stake_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Player_Stake_Height();
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
        const model: Model.Stake = this.Model();
        const color: Model.Color = model.Color();
        const is_of_human: boolean = this.Model().Is_Of_Human();
        const is_selectable: boolean = this.Model().Is_Selectable();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        if (model.Is_Selected()) {
            this.Change_Style(`border`, `0.15vmin solid white`);
        } else {
            this.Change_Style(`border`, `0.15vmin solid black`);
        }

        this.Change_Style(
            `backgroundColor`,
            `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha()}
            )`,
        );

        this.Change_Style(
            `top`,
            `calc(
                ${this.CSS_Height()} *
                ${PLAYER_STAKE_HEIGHT_MULTIPLIER} *
                ${this.Index()}
            )`,
        );
        this.Change_Style(`zIndex`, `${this.Index()}`);

        if (is_of_human && is_selectable) {
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`cursor`, `default`);
        }
    }

    Before_Life():
        Component_Styles
    {
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

        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            position: `absolute`,
            left: `0`,
            top: `0`,

            cursor: `default`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Stake = this.Model();
        const is_of_human: boolean = this.Model().Is_Of_Human();
        const is_selectable: boolean = this.Model().Is_Selectable();

        this.Refresh_Styles();

        return (
            <div
                className={`Player_Stake`}
                style={this.Styles()}
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

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            event.stopPropagation();

            const arena: Model.Arena = this.Model().Arena();
            if (arena.Is_Input_Enabled()) {
                arena.Disable_Input();

                if (this.Model().Is_On_Player()) {
                    const player: Model.Player = this.Model().Origin();
                    if (player.Is_On_Turn()) {
                        const player_index: Model.Player_Index = player.Index();
                        const stake_index: Model.Stake_Index = this.Index();

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

    On_Life():
        Event.Listener_Info[]
    {
        const player_index: Model.Player_Index = this.Player().Index();

        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
            {
                event_name: new Event.Name(Event.BEFORE, Event.PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.Before_This_Player_Place_Stake,
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

type Board_Props = {
    model: Model.Board;
    parent: Arena;
    event_grid: Event.Grid;
}

export class Board extends Component<Board_Props>
{
    private bumper: Board_Bumper | null = null;
    private cells: Board_Cells | null = null;

    Arena():
        Arena
    {
        return this.Parent();
    }

    Bumper():
        Board_Bumper
    {
        return this.Try_Object(this.bumper);
    }

    Cells():
        Board_Cells
    {
        return this.Try_Object(this.cells);
    }

    Width():
        Float
    {
        return this.Arena().Measurements().Board_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Board_Height();
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
        const arena: Arena = this.Arena();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        this.Change_Style(
            `gridTemplateRows`,
            `
                ${arena.Measurements().Board_Bumper_Height()}px 
                ${arena.Measurements().Board_Cells_Height()}px
            `,
        );

        this.Change_Style(
            `backgroundImage`,
            `url("img/boards/pexels-fwstudio-172296.jpg")`,
        );
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `auto`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        this.Refresh_Styles();

        return (
            <div
                className={`Board`}
                style={this.Styles()}
            >
                <Board_Bumper
                    key={`board_bumper`}
                    ref={ref => this.bumper = ref}

                    parent={this}
                    event_grid={this.Event_Grid()}
                    model={this.Model()}
                />
                <Board_Cells
                    key={`board_cells`}
                    ref={ref => this.cells = ref}

                    parent={this}
                    event_grid={this.Event_Grid()}
                    model={this.Model()}
                />
            </div >
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_PLACE_STAKE),
                event_handler: this.On_Player_Place_Stake,
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

    async On_Player_Place_Stake(
        {
            player_index,
            cell_index,
        }: Event.Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const turn_result_steps: Model.Turn_Result_Steps =
                await this.Model().Place_Current_Player_Selected_Stake(cell_index);
            if (this.Is_Alive()) {
                for (const turn_result_step of turn_result_steps) {
                    await Promise.all(turn_result_step.map(async function (
                        this: Board,
                        turn_result: Model.Turn_Result,
                    ):
                        Promise<void>
                    {
                        await this.Send({
                            name_affix: Event.BOARD_CHANGE_CELL,
                            name_suffixes: [
                                turn_result.cell_index.toString(),
                            ],
                            data: {
                                cell_index: turn_result.cell_index,
                                turn_result: turn_result,
                            } as Event.Board_Change_Cell_Data,
                            is_atomic: true,
                        });
                    }, this));

                    if (this.Is_Dead()) {
                        return;
                    }
                }

                this.Send({
                    name_affix: Event.PLAYER_STOP_TURN,
                    name_suffixes: [
                        player_index.toString(),
                    ],
                    data: {
                        player_index,
                    } as Event.Player_Stop_Turn_Data,
                    is_atomic: true,
                });
            }
        }
    }
}

type Board_Bumper_Props = {
    model: Model.Board;
    parent: Board;
    event_grid: Event.Grid;
}

class Board_Bumper extends Component<Board_Bumper_Props>
{
    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Board_Bumper`}
                style={this.Styles()}
            >
            </div >
        );
    }
}

type Board_Cells_Props = {
    model: Model.Board;
    parent: Board;
    event_grid: Event.Grid;
}

class Board_Cells extends Component<Board_Cells_Props>
{
    private cells: Array<Board_Cell | null> = new Array(this.Model().Cell_Count()).fill(null);

    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Parent();
    }

    Cell(cell_index: Model.Cell_Index):
        Board_Cell
    {
        return this.Try_Array_Index(this.cells, cell_index);
    }

    Cells():
        Array<Board_Cell>
    {
        return this.Try_Array(this.cells);
    }

    Width():
        Float
    {
        return this.Arena().Measurements().Board_Cells_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Board_Cells_Height();
    }

    Padding():
        Float
    {
        return this.Arena().Measurements().Board_Cells_Padding();
    }

    Grid_Gap():
        Float
    {
        return this.Arena().Measurements().Board_Cells_Grid_Gap();
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

    CSS_Padding():
        string
    {
        return `${this.Padding()}px`;
    }

    CSS_Grid_Gap():
        string
    {
        return `${this.Grid_Gap()}px`;
    }

    Refresh_Styles():
        void
    {
        const rules: Model.Rules = this.Model().Rules();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        this.Change_Style(`gridTemplateColumns`, `repeat(${rules.Column_Count()}, 1fr)`);
        this.Change_Style(`gridTemplateRows`, `repeat(${rules.Row_Count()}, 1fr)`);

        this.Change_Style(`padding`, this.CSS_Padding());
        this.Change_Style(`gridGap`, this.CSS_Grid_Gap());
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        this.Refresh_Styles();

        return (
            <div
                className={`Board_Cells`}
                style={this.Styles()}
            >
                {
                    Array(this.Model().Cell_Count()).fill(null).map((_, cell_index: Model.Cell_Index) =>
                    {
                        return (
                            <Board_Cell
                                key={cell_index}
                                ref={ref => this.cells[cell_index] = ref}

                                parent={this}
                                event_grid={this.Event_Grid()}
                                model={() => this.Model().Cell(cell_index)}
                                index={cell_index}
                            />
                        );
                    })
                }
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
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
}

type Board_Cell_Props = {
    model: () => Model.Cell;
    parent: Board_Cells;
    event_grid: Event.Grid;
    index: Model.Cell_Index;
}

class Board_Cell extends Component<Board_Cell_Props>
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
        Board_Cells
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

    Refresh_Styles():
        void
    {
        const model = this.Model()();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        if (model.Is_Empty()) {
            const is_on_human_turn: boolean =
                this.Board().Model().Is_On_Human_Turn();
            const is_selectable: boolean =
                this.Board().Model().Is_Cell_Selectable(this.Index());

            if (is_on_human_turn && is_selectable) {
                this.Change_Style('cursor', `pointer`);
            } else {
                this.Change_Style('cursor', `default`);
            }
        } else {
            const color: Model.Color = this.current_color as Model.Color;
            Assert(color != null);

            this.Change_Style(
                `backgroundColor`,
                `rgba(
                    ${color.Red()},
                    ${color.Green()},
                    ${color.Blue()},
                    ${color.Alpha()}
                )`,
            );
        }
    }

    Before_Life():
        Component_Styles
    {
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

        return ({
            display: `grid`,
            gridTemplateColumns: `4fr 3fr 4fr 3fr 4fr`,
            gridTemplateRows: `4fr 3fr 4fr 3fr 4fr`,
            columnGap: `5%`,

            border: `0.3vmin solid #00000080`,

            cursor: `default`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model = this.Model()();

        this.Refresh_Styles();

        if (model.Is_Empty()) {
            return (
                <div
                    className={`Board_Cell`}
                    style={this.Styles()}
                    onClick={event => this.On_Click(event)}
                >
                </div>
            );
        } else {
            return (
                <div
                    className={`Board_Cell`}
                    style={this.Styles()}
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

    On_Life():
        Event.Listener_Info[]
    {
        const cell_index: Model.Cell_Index = this.Index();

        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
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
