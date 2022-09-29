import "./view.css";

import React from "react";

import * as Event from "./event";
import * as Model from "./model";

const BEFORE: Event.Name_Prefix = Event.BEFORE;
const ON: Event.Name_Prefix = Event.ON;
const AFTER: Event.Name_Prefix = Event.AFTER;

const PLAYER_SELECT_STAKE: Event.Name_Affix = `Player_Select_Stake`;
const PLAYER_PLACE_STAKE: Event.Name_Affix = `Player_Place_Stake`;

type Arena_Props = {
    event_grid: Event.Grid,
    model: Model.Arena,
}

export class Arena extends React.Component<Arena_Props>
{
    #board: Board | null;
    #players: Array<Player | null>;

    constructor(props: Arena_Props)
    {
        super(props);

        this.#board = null;
        this.#players = new Array(this.Model().Player_Count()).fill(null);
    }

    Model():
        Model.Arena
    {
        return this.props.model;
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

type Board_Props = {
    parent: Arena,
    event_grid: Event.Grid,
    model: Model.Board,
}

class Board extends React.Component<Board_Props>
{
    #cells: Array<Board_Cell | Board_Stake | null>;

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

    Cell_Or_Stake(cell_index: Model.Cell_Index):
        Board_Cell | Board_Stake
    {
        if (cell_index < 0 || cell_index >= this.#cells.length) {
            throw new Error(`'cell_index' of '${cell_index}' is invalid.`);
        } else if (!this.#cells[cell_index]) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            if (this.#cells[cell_index] instanceof Board_Cell) {
                return this.#cells[cell_index] as Board_Cell;
            } else {
                return this.#cells[cell_index] as Board_Stake;
            }
        }
    }

    async On_Player_Place_Stake({
        cell_index,
    }: {
        cell_index: Model.Cell_Index,
    }):
        Promise<void>
    {
        this.Model().Place_Current_Player_Selected_Stake(cell_index);
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
                        const stake: Model.Stake | null = this.Model().Stake(cell_index);
                        if (stake == null) {
                            return (
                                <Board_Cell
                                    key={cell_index}
                                    parent={this}
                                    ref={ref => this.#cells[cell_index] = ref}
                                    event_grid={this.props.event_grid}
                                    model={this.Model()}
                                    index={cell_index}
                                />
                            );
                        } else {
                            return (
                                <Board_Stake
                                    key={cell_index}
                                    parent={this}
                                    ref={ref => this.#cells[cell_index] = ref}
                                    event_grid={this.props.event_grid}
                                    model={stake}
                                    index={cell_index}
                                />
                            );
                        }
                    })
                }
            </div>
        );
    }
}

type Board_Cell_Props = {
    parent: Board,
    event_grid: Event.Grid,
    model: Model.Board,
    index: Model.Cell_Index,
}

class Board_Cell extends React.Component<Board_Cell_Props>
{
    Model():
        Model.Board
    {
        return this.props.model;
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

        const arena: Model.Arena = this.Model().Arena();
        if (arena.Is_Input_Enabled()) {
            arena.Disable_Input();

            if (this.Model().Is_Cell_Selectable(this.props.index)) {
                const player_index: Model.Player_Index = this.Model().Current_Player_Index();
                const cell_index: Model.Cell_Index = this.props.index;

                this.props.event_grid.Send_Event({
                    name_affix: PLAYER_PLACE_STAKE,
                    name_suffixes: [
                        player_index.toString(),
                    ],
                    data: {
                        player_index,
                        cell_index,
                    },
                    is_atomic: true,
                });
            }

            arena.Enable_Input();
        }
    }

    async After_Player_Select_Stake():
        Promise<void>
    {
        if (this.Model().Is_Cell_Selectable(this.props.index)) {
            // we only need to update the cursor for empty cells
            this.forceUpdate();
        }
    }

    async After_Player_Place_Stake():
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
        const is_on_human_turn: boolean = this.Model().Is_On_Human_Turn();
        const is_selectable: boolean = this.Model().Is_Cell_Selectable(this.props.index);

        return (
            <div
                className="Board_Cell"
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
    }
}

type Board_Stake_Props = {
    parent: Board,
    event_grid: Event.Grid,
    model: Model.Stake,
    index: Model.Stake_Index,
}

class Board_Stake extends React.Component<Board_Stake_Props>
{
    Model():
        Model.Stake
    {
        return this.props.model;
    }

    Board():
        Board
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
        const color: Model.Color = this.Model().Color();

        return (
            <div
                className="Board_Stake"
                style={{
                    backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                }}
            >
                <div>
                    {this.Model().Card().Name()}
                </div>
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

    async After_This_Player_Place_Stake():
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
                const player: Model.Player = this.Model().Claimant();
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
                        },
                        is_atomic: true,
                    });
                }
            }

            arena.Enable_Input();
        }
    }

    async On_This_Player_Select_Stake({
        stake_index,
    }: {
        stake_index: Model.Stake_Index,
    }):
        Promise<void>
    {
        if (this.props.index === stake_index) {
            this.Model().Claimant().Select_Stake(stake_index);
        }

        this.forceUpdate();
    }

    componentDidMount():
        void
    {
        const player_index: Model.Player_Index = this.Model().Claimant().Index();

        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(ON, PLAYER_SELECT_STAKE, player_index.toString()),
                    event_handler: this.On_This_Player_Select_Stake,
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
