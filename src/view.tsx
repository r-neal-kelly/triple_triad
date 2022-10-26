import "./view.css";

import React from "react";

import { Assert } from "./utils";
import { Wait } from "./utils";

import * as Model from "./model";

import * as Event from "./view/event";
import { Component, Component_Styles } from "./view/component";
import { Button } from "./view/common/button";
import { Main } from "./view/main";
import { Arena } from "./view/arena";

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

    Main():
        Main
    {
        return this.Parent();
    }

    Exhibition(exhibition_index: Model.Exhibition_Index):
        Exhibition
    {
        if (exhibition_index == null || exhibition_index < 0 || exhibition_index >= this.exhibitions.length) {
            throw new Error(`'exhibition_index' ${exhibition_index} is invalid.`);
        } else if (this.exhibitions[exhibition_index] == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.exhibitions[exhibition_index] as Exhibition;
        }
    }

    Exhibitions():
        Array<Exhibition>
    {
        const exhibitions: Array<Exhibition> = [];
        for (const exhibition of this.exhibitions) {
            if (exhibition == null) {
                throw this.Error_Not_Rendered();
            } else {
                exhibitions.push(exhibition);
            }
        }

        return exhibitions;
    }

    Exhibition_Event_Grid(exhibition_index: Model.Exhibition_Index):
        Event.Grid
    {
        if (exhibition_index == null || exhibition_index < 0 || exhibition_index >= this.exhibitions.length) {
            throw new Error(`'exhibition_index' ${exhibition_index} is invalid.`);
        } else {
            return this.exhibition_event_grids[exhibition_index] as Event.Grid;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            filter: `blur(0.1vmin)`, // I'm not sure, maybe doing pixels would be best?
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Main = this.Model();
        const exhibition_count: Model.Exhibition_Count = model.Exhibition_Count();

        return (
            <div
                className={`Exhibitions`}
                style={this.Styles()}
            >
                {
                    Array(exhibition_count).fill(null).map((_, exhibition_index: Model.Exhibition_Index) =>
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
}

type Exhibition_Props = {
    model: Model.Exhibition;
    parent: Exhibitions;
    event_grid: Event.Grid;
}

export class Exhibition extends Component<Exhibition_Props>
{
    private arena: Arena | null = null;

    Exhibitions():
        Exhibitions
    {
        return this.Parent();
    }

    Arena():
        Arena
    {
        if (this.arena == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.arena;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `none`,

            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,
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
                <Arena
                    key={`arena_${arena.ID()}`}
                    ref={ref => this.arena = ref}

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
            await Wait(5000);
            if (this.Is_Alive()) {
                this.Model().Regenerate();
                await this.Refresh();
            }
        }
    }
}

type Player_Props = {
    model: Model.Player;
    parent: Arena;
    event_grid: Event.Grid;
}

export class Player extends Component<Player_Props>
{
    private bumper: Player_Bumper | null = null;
    private hand: Player_Hand | null = null;

    Arena():
        Arena
    {
        return this.Parent();
    }

    Bumper():
        Player_Bumper
    {
        if (this.bumper == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.bumper;
        }
    }

    Hand():
        Player_Hand
    {
        if (this.hand == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.hand;
        }
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    CSS_Width():
        string
    {
        return this.Arena().CSS_Player_Width();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: `100%`,

            position: `relative`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();
        const index: Model.Player_Index = this.Index();
        const color: Model.Color = this.Model().Color();

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
                event_name: new Event.Name(Event.ON, Event.PLAYER_START_TURN, player_index.toString()),
                event_handler: this.On_This_Player_Start_Turn,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_SELECT_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Select_Stake,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Place_Stake,
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

    async On_This_Player_Place_Stake(
        {
        }: Event.Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
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
        if (this.name == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.name;
        }
    }

    Score():
        Player_Score
    {
        if (this.score == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.score;
        }
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Before_Life():
        Component_Styles
    {
        const arena: Arena = this.Arena();

        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `1fr 1fr`,

            width: arena.CSS_Card_Width(),
            height: arena.CSS_Bumper_Height(),
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player = this.Model();
        const event_grid: Event.Grid = this.Event_Grid();
        const index: Model.Player_Index = this.Index();
        const color: Model.Color = this.Model().Color();

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
}

type Player_Hand_Props = {
    model: Model.Player;
    parent: Player;
    event_grid: Event.Grid;
}

class Player_Hand extends Component<Player_Hand_Props>
{
    private stakes: Array<Player_Stake | null> = new Array(this.Model().Stake_Count()).fill(null);

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
        if (stake_index < 0 || stake_index >= this.stakes.length) {
            throw new Error(`'stake_index' of ${stake_index} is invalid.`);
        } else if (this.stakes[stake_index] == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.stakes[stake_index] as Player_Stake;
        }
    }

    Stakes():
        Array<Player_Stake>
    {
        const stakes: Array<Player_Stake> = [];
        for (const stake of this.stakes) {
            if (stake == null) {
                throw this.Error_Not_Rendered();
            } else {
                stakes.push(stake);
            }
        }

        return stakes;
    }

    Index():
        Model.Player_Index
    {
        return this.Model().Index();
    }

    Before_Life():
        Component_Styles
    {
        const arena: Arena = this.Arena();

        return ({
            position: `relative`,

            width: arena.CSS_Card_Width(),
            height: arena.CSS_Board_Cells_Height(),
            overflowX: `hidden`,
            overflowY: `auto`,

            scrollbarWidth: `none`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const stake_count: Model.Stake_Count = this.Model().Stake_Count();

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

    Before_Life():
        Component_Styles
    {
        const arena: Arena = this.Arena();

        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: arena.CSS_Card_Width(),
            height: arena.CSS_Card_Height(),

            position: `absolute`,
            left: `0`,
            top: `0`,

            cursor: `default`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const arena: Arena = this.Arena();
        const model: Model.Stake = this.Model();
        const color: Model.Color = model.Color();
        const is_of_human: boolean = this.Model().Is_Of_Human();
        const is_selectable: boolean = this.Model().Is_Selectable();

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
                ${arena.CSS_Card_Height()} *
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
                event_name: new Event.Name(Event.BEFORE, Event.PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.Before_This_Player_Place_Stake,
            },
        ]);
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
                this.Change_Style(`animationName`, `Player_Stake_Twinkle`);
                this.Change_Style(`animationDuration`, `${500}ms`);
                this.Change_Style(`animationTimingFunction`, `ease-in-out`);
                this.Change_Style(`animationIterationCount`, `1`);
                this.Change_Style(`animationDirection`, `normal`);

                await Wait(500);
                if (this.Is_Alive()) {
                    this.Change_Style(`animationName`, ``);
                    this.Change_Style(`animationDuration`, ``);
                    this.Change_Style(`animationTimingFunction`, ``);
                    this.Change_Style(`animationIterationCount`, ``);
                    this.Change_Style(`animationDirection`, ``);

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
        if (this.bumper == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.bumper;
        }
    }

    Cells():
        Board_Cells
    {
        if (this.cells == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cells;
        }
    }

    Before_Life():
        Component_Styles
    {
        const arena: Arena = this.Arena();

        return ({
            display: `grid`,
            gridTemplateColumns: `auto`,
            gridTemplateRows: `${arena.CSS_Bumper_Height()} ${arena.CSS_Board_Cells_Height()}`,

            height: `100%`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        this.Change_Style(`backgroundImage`, `url("img/boards/pexels-fwstudio-172296.jpg")`);

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
                event_name: new Event.Name(Event.ON, Event.PLAYER_PLACE_STAKE),
                event_handler: this.On_Player_Place_Stake,
            },
        ]);
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

    CSS_Height():
        string
    {
        return this.Arena().CSS_Bumper_Height();
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
        if (cell_index < 0 || cell_index >= this.cells.length) {
            throw new Error(`'cell_index' of ${cell_index} is invalid.`);
        } else if (this.cells[cell_index] == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cells[cell_index] as Board_Cell;
        }
    }

    Cells():
        Array<Board_Cell>
    {
        const cells: Array<Board_Cell> = [];
        for (const cell of this.cells) {
            if (cell == null) {
                throw this.Error_Not_Rendered();
            } else {
                cells.push(cell);
            }
        }

        return cells;
    }

    CSS_Height():
        string
    {
        return this.Arena().CSS_Board_Cells_Height();
    }

    CSS_Padding():
        string
    {
        return this.Arena().CSS_Board_Cells_Padding();
    }

    CSS_Grid_Gap():
        string
    {
        return this.Arena().CSS_Board_Cells_Grid_Gap();
    }

    Before_Life():
        Component_Styles
    {
        const rules: Model.Rules = this.Model().Rules();
        const grid_gap: string = this.CSS_Grid_Gap();

        return ({
            display: `grid`,
            gridTemplateColumns: `repeat(${rules.Column_Count()}, 1fr)`,
            gridTemplateRows: `repeat(${rules.Row_Count()}, 1fr)`,
            gridGap: `${grid_gap} ${grid_gap}`,

            width: `100%`,
            height: `100%`,
            padding: this.CSS_Padding(),
        });
    }

    On_Refresh():
        JSX.Element | null
    {
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

    Before_Life():
        Component_Styles
    {
        const arena: Arena = this.Arena();

        return ({
            display: `grid`,
            gridTemplateColumns: `4fr 3fr 4fr 3fr 4fr`,
            gridTemplateRows: `4fr 3fr 4fr 3fr 4fr`,
            columnGap: `5%`,

            width: arena.CSS_Card_Width(),
            height: arena.CSS_Card_Height(),

            border: `0.3vmin solid #00000080`,

            cursor: `default`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model = this.Model()();

        if (model.Is_Empty()) {
            const is_on_human_turn: boolean = this.Board().Model().Is_On_Human_Turn();
            const is_selectable: boolean = this.Board().Model().Is_Cell_Selectable(this.Index());

            if (is_on_human_turn && is_selectable) {
                this.Change_Style('cursor', `pointer`);
            } else {
                this.Change_Style('cursor', `default`);
            }

            return (
                <div
                    className={`Board_Cell`}
                    style={this.Styles()}
                    onClick={event => this.On_Click(event)}
                >
                </div>
            );
        } else {
            Assert(this.current_color != null);

            const color: Model.Color = this.current_color as Model.Color;

            this.Change_Style(
                `backgroundColor`,
                `rgba(
                    ${color.Red()},
                    ${color.Green()},
                    ${color.Blue()},
                    ${color.Alpha()}
                )`,
            );

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
                this.current_color = this.Arena().Player(player_index).Model().Color();
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

            if (turn_result.old_color != null) {
                const old_color: Model.Color = turn_result.old_color;
                const new_color: Model.Color = model.Color();
                const old_background_color: string =
                    `rgba(${old_color.Red()}, ${old_color.Green()}, ${old_color.Blue()}, ${old_color.Alpha()})`;
                const new_background_color: string =
                    `rgba(${new_color.Red()}, ${new_color.Green()}, ${new_color.Blue()}, ${new_color.Alpha()})`;

                let background_size: string = ``;
                let from_position: string = ``;
                let to_position: string = ``;
                let animation_name: string = ``;
                if (turn_result.direction === Model.Direction_e.LEFT) {
                    background_size = `1000% 100%`;
                    from_position = `left`;
                    to_position = `right`;
                    animation_name = `Board_Cell_Left_To_Right`;
                } else if (turn_result.direction === Model.Direction_e.TOP) {
                    background_size = `100% 1000%`;
                    from_position = `top`;
                    to_position = `bottom`;
                    animation_name = `Board_Cell_Top_To_Bottom`;
                } else if (turn_result.direction === Model.Direction_e.RIGHT) {
                    background_size = `1000% 100%`;
                    from_position = `right`;
                    to_position = `left`;
                    animation_name = `Board_Cell_Right_To_Left`;
                } else if (turn_result.direction === Model.Direction_e.BOTTOM) {
                    background_size = `100% 1000%`;
                    from_position = `bottom`;
                    to_position = `top`;
                    animation_name = `Board_Cell_Bottom_To_Top`;
                }

                const animation_duration: number =
                    Math.ceil(TURN_RESULT_WAIT_MILLISECONDS * TURN_RESULT_TRANSITION_RATIO);

                this.current_color = old_color;

                this.Change_Style(
                    `backgroundColor`,
                    old_background_color,
                );
                this.Change_Style(
                    `backgroundImage`,
                    `linear-gradient(to ${to_position}, ${old_background_color}, ${new_background_color})`,
                );
                this.Change_Style(
                    `backgroundSize`,
                    background_size,
                );
                this.Change_Style(
                    `backgroundPosition`,
                    from_position,
                )
                this.Change_Style(`animationName`, animation_name);
                this.Change_Style(`animationDuration`, `${animation_duration}ms`);
                this.Change_Style(`animationTimingFunction`, `ease-in-out`);
                this.Change_Style(`animationIterationCount`, `1`);
                this.Change_Style(`animationDirection`, `normal`);

                await Wait(animation_duration);
                if (this.Is_Alive()) {
                    this.current_color = new_color;

                    this.Change_Style(`backgroundColor`, new_background_color);
                    this.Change_Style(`backgroundImage`, ``);
                    this.Change_Style(`backgroundSize`, `100% 100%`);
                    this.Change_Style(`animationName`, ``);
                    this.Change_Style(`animationDuration`, ``);
                    this.Change_Style(`animationTimingFunction`, ``);
                    this.Change_Style(`animationIterationCount`, ``);
                    this.Change_Style(`animationDirection`, ``);

                    await Wait(200);
                    if (this.Is_Alive()) {
                        this.Change_Style(`animationName`, `Board_Cell_Flash`);
                        this.Change_Style(`animationDuration`, `${300}ms`);
                        this.Change_Style(`animationTimingFunction`, `ease-in`);
                        this.Change_Style(`animationIterationCount`, `1`);
                        this.Change_Style(`animationDirection`, `normal`);

                        await Wait(300);
                        if (this.Is_Alive()) {
                            this.Change_Style(`animationName`, ``);
                            this.Change_Style(`animationDuration`, ``);
                            this.Change_Style(`animationTimingFunction`, ``);
                            this.Change_Style(`animationIterationCount`, ``);
                            this.Change_Style(`animationDirection`, ``);

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

type Results_Props = {
    model: Model.Arena;
    parent: Main;
    event_grid: Event.Grid;
}

export class Results extends Component<Results_Props>
{
    private banner: Results_Banner | null = null;
    private buttons: Results_Buttons | null = null;

    Main():
        Main
    {
        return this.Parent();
    }

    Arena():
        Arena
    {
        return this.Main().Arena();
    }

    Banner():
        Results_Banner
    {
        if (this.banner == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.banner;
        }
    }

    Buttons():
        Results_Buttons
    {
        if (this.buttons == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.buttons;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `25% 75%`,

            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            backgroundColor: `rgba(0, 0, 0, 0.5)`,

            animationName: `Results_Fade_In`,
            animationDuration: `2000ms`,
            animationTimingFunction: `ease-in-out`,
            animationIterationCount: `1`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Arena = this.Model();

        if (model.Is_Game_Over()) {
            const scores: Model.Scores = model.Final_Scores();

            return (
                <div
                    className={`Results`}
                    style={this.Styles()}
                >
                    <Results_Banner
                        ref={ref => this.banner = ref}

                        model={scores}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                    <Results_Buttons
                        ref={ref => this.buttons = ref}

                        model={scores}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, Event.GAME_START),
                event_handler: this.On_Game_Start,
            },
            {
                event_name: new Event.Name(Event.ON, Event.GAME_STOP),
                event_handler: this.On_Game_Stop,
            },
        ]);
    }

    async On_Game_Start(
        {
        }: Event.Game_Start_Data,
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

type Results_Banner_Props = {
    model: Model.Scores;
    parent: Results;
    event_grid: Event.Grid;
}

class Results_Banner extends Component<Results_Banner_Props>
{
    private winner: Results_Winner | null = null;
    private draws: Results_Draws | null = null;

    Arena():
        Arena
    {
        return this.Results().Arena();
    }

    Results():
        Results
    {
        return this.Parent();
    }

    Winner():
        Results_Winner
    {
        if (this.winner == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.winner;
        }
    }

    Draws():
        Results_Draws
    {
        if (this.draws == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.draws;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `40vmin`,

            position: `absolute`,
            left: `0`,
            top: `calc(
                50% -
                (40vmin / 2) +
                (${this.Arena().CSS_Bumper_Height()} / 2)
            )`,

            borderWidth: `0.6vmin 0`,
            borderStyle: `solid`,
            borderColor: `#00000080`,

            animationName: `Results_Banner_Move_In`,
            animationDuration: `2000ms`,
            animationTimingFunction: `ease-in-out`,
            animationIterationCount: `1`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Scores = this.Model();

        if (model.Has_Winner()) {
            return (
                <div
                    className={`Results_Banner`}
                    style={this.Styles()}
                >
                    <Results_Winner
                        key={`results_winner`}
                        ref={ref => this.winner = ref}

                        model={model.Winner()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            return (
                <div
                    className={`Results_Banner`}
                    style={this.Styles()}
                >
                    <Results_Draws
                        key={`results_draws`}
                        ref={ref => this.draws = ref}

                        model={model.Draws()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        }
    }
}

type Results_Winner_Props = {
    model: Model.Player_And_Score;
    parent: Results_Banner;
    event_grid: Event.Grid;
}

class Results_Winner extends Component<Results_Winner_Props>
{
    Arena():
        Arena
    {
        return this.Banner().Results().Arena();
    }

    Banner():
        Results_Banner
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        const model: Model.Player_And_Score = this.Model();
        const color: Model.Color = model.player.Color();

        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            backgroundColor: `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha()}
            )`,

            fontSize: `6vmin`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player_And_Score = this.Model();

        return (
            <div
                className={`Results_Winner`}
                style={this.Styles()}
            >
                <div>
                    {`${model.player.Name()} Wins!`}
                </div>
            </div>
        );
    }
}

type Results_Draws_Props = {
    model: Array<Model.Player_And_Score>;
    parent: Results_Banner;
    event_grid: Event.Grid;
}

class Results_Draws extends Component<Results_Draws_Props>
{
    Arena():
        Arena
    {
        return this.Banner().Results().Arena();
    }

    Banner():
        Results_Banner
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            backgroundImage: ``,

            fontSize: `6vmin`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Array<Model.Player_And_Score> = this.Model();
        const color_stop_percent: number = 100 / model.length;
        const linear_gradient_colors: string = model.map(function (
            draw: Model.Player_And_Score,
            index: Model.Player_Index,
        ):
            string
        {
            const color: Model.Color = draw.player.Color();
            const color_stop: string = `${index * color_stop_percent}% ${(index + 1) * color_stop_percent}%`;

            return `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()}) ${color_stop}`;
        }).join(`, `);

        this.Change_Style(
            `backgroundImage`,
            `linear-gradient(to right, ${linear_gradient_colors})`,
        );

        return (
            <div
                className={`Results_Draws`}
                style={this.Styles()}
            >
                <div>
                    {`Draw`}
                </div>
            </div>
        );
    }
}

type Results_Buttons_Props = {
    model: Model.Scores;
    parent: Results;
    event_grid: Event.Grid;
}

class Results_Buttons extends Component<Results_Buttons_Props>
{
    private rematch_button: Results_Rematch_Button | null = null;
    private exit_button: Results_Exit_Button | null = null;

    Arena():
        Arena
    {
        return this.Results().Arena();
    }

    Results():
        Results
    {
        return this.Parent();
    }

    Rematch_Button():
        Results_Rematch_Button
    {
        if (this.rematch_button == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.rematch_button;
        }
    }

    Exit_Button():
        Results_Exit_Button
    {
        if (this.exit_button == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.exit_button;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `1fr 1fr`,
            rowGap: `5%`,

            width: `100%`,
            height: `100%`,

            alignSelf: `center`,
            justifySelf: `center`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Scores = this.Model();

        if (this.Arena().Model().Has_Human_Players()) {
            return (
                <div
                    style={this.Styles()}
                >
                    <Results_Rematch_Button
                        ref={ref => this.rematch_button = ref}

                        model={model}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                    <Results_Exit_Button
                        ref={ref => this.exit_button = ref}

                        model={model}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            return null;
        }
    }
}

class Results_Rematch_Button extends Button
{
    override Text():
        string
    {
        return `Play Rematch`;
    }

    override CSS_Width():
        string
    {
        return `40%`;
    }

    override CSS_Height():
        string
    {
        return `100%`;
    }

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Send({
                name_affix: Event.REMATCH_GAME,
                name_suffixes: [
                ],
                data: {
                } as Event.Rematch_Game_Data,
                is_atomic: true,
            });
        }
    }
}

class Results_Exit_Button extends Button
{
    override Text():
        string
    {
        return `Exit Game`;
    }

    override CSS_Width():
        string
    {
        return `40%`;
    }

    override CSS_Height():
        string
    {
        return `100%`;
    }

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Send({
                name_affix: Event.EXIT_GAME,
                name_suffixes: [
                ],
                data: {
                } as Event.Exit_Game_Data,
                is_atomic: true,
            });
        }
    }
}
