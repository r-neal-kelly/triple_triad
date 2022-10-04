import "./view.css";

import React from "react";

import * as Event from "./event";
import * as Model from "./model";

const AI_SELECTION_WAIT_MILLISECONDS: number = 667;

const BEFORE: Event.Name_Prefix = Event.BEFORE;
const ON: Event.Name_Prefix = Event.ON;
const AFTER: Event.Name_Prefix = Event.AFTER;

const GAME_START: Event.Name_Affix = `Game_Start`;
const GAME_STOP: Event.Name_Affix = `Game_Stop`;
const PLAYER_START_TURN: Event.Name_Affix = `Player_Start_Turn`;
const PLAYER_STOP_TURN: Event.Name_Affix = `Player_Stop_Turn`;
const PLAYER_SELECT_STAKE: Event.Name_Affix = `Player_Select_Stake`;
const PLAYER_PLACE_STAKE: Event.Name_Affix = `Player_Place_Stake`;

// might want to turn these into full classes so that the sender has to fill out the info properly.
// that would mean changing how the event types add the event instance to the data
interface Game_Start_Data
{
}

interface Game_Stop_Data
{
}

interface Player_Start_Turn_Data
{
    player_index: Model.Player_Index,
}

interface Player_Stop_Turn_Data
{
    player_index: Model.Player_Index,
}

interface Player_Select_Stake_Data
{
    player_index: Model.Player_Index,
    stake_index: Model.Stake_Index,
}

interface Player_Place_Stake_Data
{
    player_index: Model.Player_Index,
    cell_index: Model.Cell_Index,
}

type Arena_Props = {
    event_grid: Event.Grid,
    model: Model.Arena,
}

async function Wait(milliseconds: number):
    Promise<void>
{
    return new Promise(function (resolve, reject):
        void
    {
        setTimeout(resolve, milliseconds);
    });
}

export class Arena extends React.Component<Arena_Props>
{
    #players: Array<Player | null>;
    #board: Board | null;

    constructor(props: Arena_Props)
    {
        super(props);

        this.#players = new Array(this.Model().Player_Count()).fill(null);
        this.#board = null;
    }

    Model():
        Model.Arena
    {
        return this.props.model;
    }

    Player(player_index: Model.Player_Index):
        Player
    {
        if (player_index < 0 || player_index >= this.#players.length) {
            throw new Error(`'player_index' of '${player_index}' is invalid.`);
        } else if (!this.#players[player_index]) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#players[player_index] as Player;
        }
    }

    Players():
        Array<Player>
    {
        const players: Array<Player> = [];
        for (const player of this.#players) {
            if (!player) {
                throw new Error(`Component has not yet been rendered.`);
            } else {
                players.push(player);
            }
        }

        return players;
    }

    Board():
        Board
    {
        if (!this.#board) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#board as Board;
        }
    }

    async On_Game_Start(
        {
        }: Game_Start_Data,
    ):
        Promise<void>
    {
        const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();
        this.props.event_grid.Send_Event({
            name_affix: PLAYER_START_TURN,
            name_suffixes: [
                current_player_index.toString(),
            ],
            data: {
                player_index: current_player_index,
            } as Player_Start_Turn_Data,
            is_atomic: true,
        });
    }

    async On_Game_Stop(
        {
        }: Game_Start_Data,
    ):
        Promise<void>
    {
        console.log("game over");

        // we would display the winner at this point.
    }

    async On_Player_Stop_Turn(
        {
        }: Player_Stop_Turn_Data,
    ):
        Promise<void>
    {
        this.Model().Next_Turn();

        if (this.Model().Is_Game_Over()) {
            this.props.event_grid.Send_Event({
                name_affix: GAME_STOP,
                name_suffixes: [
                ],
                data: {
                } as Game_Stop_Data,
                is_atomic: true,
            });
        } else {
            const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();
            this.props.event_grid.Send_Event({
                name_affix: PLAYER_START_TURN,
                name_suffixes: [
                    current_player_index.toString(),
                ],
                data: {
                    player_index: current_player_index,
                } as Player_Start_Turn_Data,
                is_atomic: true,
            });
        }
    }

    componentDidMount():
        void
    {
        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(ON, GAME_START),
                    event_handler: this.On_Game_Start,
                },
                {
                    event_name: new Event.Name(ON, GAME_STOP),
                    event_handler: this.On_Game_Stop,
                },
                {
                    event_name: new Event.Name(ON, PLAYER_STOP_TURN),
                    event_handler: this.On_Player_Stop_Turn,
                },
            ],
        );

        this.props.event_grid.Send_Event({
            name_affix: GAME_START,
            name_suffixes: [
            ],
            data: {
            } as Game_Start_Data,
            is_atomic: true,
        });
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        return (
            <div className="Arena">
                <Player
                    key={`player_${0}`}
                    parent={this}
                    ref={ref => this.#players[0] = ref}
                    event_grid={this.props.event_grid}
                    model={this.Model().Player(0)}
                    index={0}
                />
                <Board
                    key={`board`}
                    parent={this}
                    ref={ref => this.#board = ref}
                    event_grid={this.props.event_grid}
                    model={this.Model().Board()}
                />
                {
                    Array(this.Model().Player_Count() - 1).fill(null).map((_, index: Model.Player_Index) =>
                    {
                        const player_index: Model.Player_Index = index + 1;

                        return (
                            <Player
                                key={`player_${player_index}`}
                                parent={this}
                                ref={ref => this.#players[player_index] = ref}
                                event_grid={this.props.event_grid}
                                model={this.Model().Player(player_index)}
                                index={player_index}
                            />
                        );
                    })
                }
            </div>
        );
    }
}

type Player_Props = {
    parent: Arena,
    event_grid: Event.Grid,
    model: Model.Player,
    index: Model.Player_Index,
}

class Player extends React.Component<Player_Props>
{
    #turn_icon: Player_Turn_Icon | null;
    #stakes: Array<Player_Stake | null>;

    constructor(props: Player_Props)
    {
        super(props);

        this.#turn_icon = null;
        this.#stakes = new Array(this.Model().Stake_Count()).fill(null);
    }

    Model():
        Model.Player
    {
        return this.props.model;
    }

    Index():
        Model.Player_Index
    {
        return this.props.index;
    }

    Arena():
        Arena
    {
        return this.props.parent;
    }

    Turn_Icon():
        Player_Turn_Icon
    {
        if (!this.#turn_icon) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#turn_icon as Player_Turn_Icon;
        }
    }

    Stake(stake_index: Model.Stake_Index):
        Player_Stake
    {
        if (stake_index < 0 || stake_index >= this.#stakes.length) {
            throw new Error(`'stake_index' of '${stake_index}' is invalid.`);
        } else if (!this.#stakes[stake_index]) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#stakes[stake_index] as Player_Stake;
        }
    }

    Stakes():
        Array<Player_Stake>
    {
        const stakes: Array<Player_Stake> = [];
        for (const stake of this.#stakes) {
            if (!stake) {
                throw new Error(`Component has not yet been rendered.`);
            } else {
                stakes.push(stake);
            }
        }

        return stakes;
    }

    async On_This_Player_Start_Turn(
        {
            player_index,
        }: Player_Start_Turn_Data,
    ):
        Promise<void>
    {
        this.forceUpdate();

        if (this.Model().Is_Computer()) {
            const computer_player: Model.Computer_Player = this.Model() as Model.Computer_Player;
            const {
                selection_indices,
                cell_index,
            } = await computer_player.Choose_Stake_And_Cell();

            // we may need to while away at this until the computer chooses its stake and cell,
            // that way there is no visual hiccup if the computer takes a bit of time
            for (const selection_index of selection_indices) {
                this.props.event_grid.Send_Event({
                    name_affix: PLAYER_SELECT_STAKE,
                    name_suffixes: [
                        player_index.toString(),
                    ],
                    data: {
                        player_index,
                        stake_index: selection_index,
                    } as Player_Select_Stake_Data,
                    is_atomic: true,
                });

                await Wait(AI_SELECTION_WAIT_MILLISECONDS);
            }

            this.props.event_grid.Send_Event({
                name_affix: PLAYER_PLACE_STAKE,
                name_suffixes: [
                    player_index.toString(),
                ],
                data: {
                    player_index,
                    cell_index,
                } as Player_Place_Stake_Data,
                is_atomic: true,
            });
        }
    }

    async On_This_Player_Select_Stake(
        {
            stake_index,
        }: Player_Select_Stake_Data,
    ):
        Promise<void>
    {
        const previous_selected_stake_index: Model.Stake_Index | null = this.Model().Selected_Stake_Index();
        if (previous_selected_stake_index !== stake_index) {
            this.Model().Select_Stake(stake_index);
            this.Stake(stake_index).forceUpdate();

            if (previous_selected_stake_index != null) {
                this.Stake(previous_selected_stake_index).forceUpdate();
            }
        }
    }

    async After_This_Player_Place_Stake(
        {
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        this.forceUpdate();
    }

    componentDidMount():
        void
    {
        const player_index: Model.Player_Index = this.props.index;

        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(ON, PLAYER_START_TURN, player_index.toString()),
                    event_handler: this.On_This_Player_Start_Turn,
                },
                {
                    event_name: new Event.Name(ON, PLAYER_SELECT_STAKE, player_index.toString()),
                    event_handler: this.On_This_Player_Select_Stake,
                },
                {
                    event_name: new Event.Name(AFTER, PLAYER_PLACE_STAKE, player_index.toString()),
                    event_handler: this.After_This_Player_Place_Stake,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        const stake_count: Model.Stake_Count = this.Model().Stake_Count();

        return (
            <div
                className="Player"
            >
                <Player_Turn_Icon
                    key={this.props.index}
                    parent={this}
                    ref={ref => this.#turn_icon = ref}
                    event_grid={this.props.event_grid}
                    model={this.Model()}
                    index={this.props.index}
                />
                <div
                    className="Hand"
                    style={{
                        height: `calc(var(--card_height) / 3 * 2 * ${stake_count})`,
                    }}
                >
                    {
                        Array(stake_count).fill(null).map((_, stake_index: Model.Stake_Index) =>
                        {
                            return (
                                <Player_Stake
                                    key={stake_index}
                                    parent={this}
                                    ref={ref => this.#stakes[stake_index] = ref}
                                    event_grid={this.props.event_grid}
                                    model={this.Model().Stake(stake_index)}
                                    index={stake_index}
                                />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

type Player_Turn_Icon_Props = {
    parent: Player,
    event_grid: Event.Grid,
    model: Model.Player,
    index: Model.Player_Index,
}

class Player_Turn_Icon extends React.Component<Player_Turn_Icon_Props>
{
    Model():
        Model.Player
    {
        return this.props.model;
    }

    Index():
        Model.Player_Index
    {
        return this.props.index;
    }

    Player():
        Player
    {
        return this.props.parent;
    }

    componentDidMount():
        void
    {
        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        return (
            <div
                className="Player_Turn_Icon"
            >
                {
                    this.Model().Is_On_Turn() ?
                        `˅` :
                        ``
                }
            </div>
        );
    }
}

type Player_Stake_Props = {
    parent: Player,
    event_grid: Event.Grid,
    model: Model.Stake,
    index: Model.Stake_Index,
}

class Player_Stake extends React.Component<Player_Stake_Props>
{
    Model():
        Model.Stake
    {
        return this.props.model;
    }

    Index():
        Model.Stake_Index
    {
        return this.props.index;
    }

    Player():
        Player
    {
        return this.props.parent;
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        event.stopPropagation();

        const arena: Model.Arena = this.Model().Arena();
        if (arena.Is_Input_Enabled()) {
            arena.Disable_Input();

            if (this.Model().Is_On_Player()) {
                const player: Model.Player = this.Model().Origin();
                if (player.Is_On_Turn()) {
                    const player_index: Model.Player_Index = player.Index();
                    const stake_index: Model.Stake_Index = this.props.index;

                    this.props.event_grid.Send_Event({
                        name_affix: PLAYER_SELECT_STAKE,
                        name_suffixes: [
                            player_index.toString(),
                        ],
                        data: {
                            player_index,
                            stake_index,
                        } as Player_Select_Stake_Data,
                        is_atomic: true,
                    });
                }
            }

            arena.Enable_Input();
        }
    }

    componentDidMount():
        void
    {
        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        const color: Model.Color = this.Model().Color();
        const is_of_human: boolean = this.Model().Is_Of_Human();
        const is_selectable: boolean = this.Model().Is_Selectable();

        return (
            <div
                className={
                    this.Model().Is_Selected() ?
                        `Player_Selected_Stake` :
                        `Player_Stake`
                }
                style={{
                    backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                    cursor: `${is_of_human && is_selectable ? `pointer` : `default`}`,
                    zIndex: `${this.props.index}`,
                    top: `calc((0px - var(--card_height)) / 3 * ${this.props.index})`,
                }}
                onClick={
                    is_of_human && is_selectable ?
                        event => this.On_Click.bind(this)(event) :
                        () => { }
                }
            >
                {this.Model().Card().Name()}
            </div>
        );
    }
}

type Board_Props = {
    parent: Arena,
    event_grid: Event.Grid,
    model: Model.Board,
}

class Board extends React.Component<Board_Props>
{
    #cells: Array<Board_Cell | null>;

    constructor(props: Board_Props)
    {
        super(props);

        this.#cells = new Array(this.Model().Cell_Count()).fill(null);
    }

    Model():
        Model.Board
    {
        return this.props.model;
    }

    Arena():
        Arena
    {
        return this.props.parent;
    }

    Cell(cell_index: Model.Cell_Index):
        Board_Cell
    {
        if (cell_index < 0 || cell_index >= this.#cells.length) {
            throw new Error(`'cell_index' of '${cell_index}' is invalid.`);
        } else if (!this.#cells[cell_index]) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#cells[cell_index] as Board_Cell;
        }
    }

    async On_Player_Place_Stake(
        {
            player_index,
            cell_index,
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        await this.Model().Place_Current_Player_Selected_Stake(cell_index);
        this.forceUpdate();

        this.props.event_grid.Send_Event({
            name_affix: PLAYER_STOP_TURN,
            name_suffixes: [
                player_index.toString(),
            ],
            data: {
                player_index,
            } as Player_Stop_Turn_Data,
            is_atomic: true,
        });
    }

    componentDidMount():
        void
    {
        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(ON, PLAYER_PLACE_STAKE),
                    event_handler: this.On_Player_Place_Stake,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        return (
            <div
                className="Board"
                style={{
                    grid: "auto /" + Array(this.Model().Column_Count()).fill(" auto").join(""),
                }}
            >
                {
                    Array(this.Model().Cell_Count()).fill(null).map((_, cell_index: Model.Cell_Index) =>
                    {
                        return (
                            <Board_Cell
                                key={cell_index}
                                parent={this}
                                ref={ref => this.#cells[cell_index] = ref}
                                event_grid={this.props.event_grid}
                                model={this.Model().Cell(cell_index)}
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
    parent: Board,
    event_grid: Event.Grid,
    model: Model.Cell,
    index: Model.Cell_Index,
}

class Board_Cell extends React.Component<Board_Cell_Props>
{
    Model():
        Model.Cell
    {
        return this.props.model;
    }

    Index():
        Model.Cell_Index
    {
        return this.props.index;
    }

    Board():
        Board
    {
        return this.props.parent;
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        event.stopPropagation();

        const arena: Model.Arena = this.Board().Model().Arena();
        if (arena.Is_Input_Enabled()) {
            arena.Disable_Input();

            if (this.Board().Model().Is_Cell_Selectable(this.props.index)) {
                const player_index: Model.Player_Index = this.Board().Model().Current_Player_Index();
                const cell_index: Model.Cell_Index = this.props.index;

                this.props.event_grid.Send_Event({
                    name_affix: PLAYER_PLACE_STAKE,
                    name_suffixes: [
                        player_index.toString(),
                    ],
                    data: {
                        player_index,
                        cell_index,
                    } as Player_Place_Stake_Data,
                    is_atomic: true,
                });
            }

            arena.Enable_Input();
        }
    }

    async After_Player_Select_Stake(
        {
        }: Player_Select_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Board().Model().Is_Cell_Selectable(this.props.index)) {
            // we only need to update the cursor for empty cells
            this.forceUpdate();
        }
    }

    async After_Player_Place_Stake(
        {
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        // we update all cells because they could all potentially change after one stake being placed
        this.forceUpdate();
    }

    componentDidMount():
        void
    {
        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(AFTER, PLAYER_SELECT_STAKE),
                    event_handler: this.After_Player_Select_Stake,
                },
                {
                    event_name: new Event.Name(AFTER, PLAYER_PLACE_STAKE),
                    event_handler: this.After_Player_Place_Stake,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        if (this.Model().Is_Empty()) {
            const is_on_human_turn: boolean = this.Board().Model().Is_On_Human_Turn();
            const is_selectable: boolean = this.Board().Model().Is_Cell_Selectable(this.props.index);

            return (
                <div
                    className="Board_Empty_Cell"
                    style={{
                        cursor: `${is_on_human_turn && is_selectable ? `pointer` : `default`}`,
                    }}
                    onClick={event => this.On_Click.bind(this)(event)}
                >
                    <div>
                        {this.props.index}
                    </div>
                </div>
            );
        } else {
            const color: Model.Color = this.Model().Color();

            return (
                <div
                    className="Board_Occupied_Cell"
                    style={{
                        backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                    }}
                >
                    <div>
                        {this.Model().Stake().Card().Name()}
                    </div>
                </div>
            );
        }
    }
}
