import "./view.css";

import React from "react";

import * as Event from "./event";
import * as Model from "./model";

const BEFORE: Event.Name_Part = Event.BEFORE;
const ON: Event.Name_Part = Event.ON;
const AFTER: Event.Name_Part = Event.AFTER;

const PLAYER_SELECT_STAKE: Event.Name_Part = `Player_Select_Stake`;
const PLAYER_PLACE_STAKE: Event.Name_Part = `Player_Place_Stake`;

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
        this.#players = new Array(this.props.model.Player_Count()).fill(null);
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
        if (player_index >= 0 && player_index < this.#players.length) {
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
                    model={this.props.model.Player(0)}
                    index={0}
                />
                <Board
                    key={`board`}
                    parent={this}
                    ref={ref => this.#board = ref}
                    event_grid={this.props.event_grid}
                    model={this.props.model.Board()}
                />
                {Array(this.props.model.Player_Count() - 1).fill(null).map((_, index) =>
                {
                    const player_index: Model.Player_Index = index + 1;

                    return (
                        <Player
                            key={`player_${player_index}`}
                            parent={this}
                            ref={ref => this.#players[player_index] = ref}
                            event_grid={this.props.event_grid}
                            model={this.props.model.Player(player_index)}
                            index={player_index}
                        />
                    );
                })}
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
    Arena():
        Arena
    {
        return this.props.parent;
    }

    async On_Player_Place_Stake({
        cell_index,
    }: {
        cell_index: Model.Cell_Index,
    }):
        Promise<void>
    {
        this.props.model.Place_Current_Player_Selected_Stake(cell_index);
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
                    grid: "auto /" + Array(this.props.model.Column_Count()).fill(" auto").join(""),
                }}
            >
                {
                    Array(this.props.model.Cell_Count()).fill(null).map((_, index) =>
                    {
                        const stake: Model.Stake | null = this.props.model.Stake(index);
                        if (stake != null) {
                            return (
                                <Board_Stake
                                    key={index}
                                    event_grid={this.props.event_grid}
                                    model={stake}
                                    index={index}
                                />
                            );
                        } else {
                            return (
                                <Board_Cell
                                    key={index}
                                    event_grid={this.props.event_grid}
                                    model={this.props.model}
                                    index={index}
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
    event_grid: Event.Grid,
    model: Model.Board,
    index: Model.Cell_Index,
}

class Board_Cell extends React.Component<Board_Cell_Props>
{
    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        event.stopPropagation();

        const arena: Model.Arena = this.props.model.Arena();
        if (arena.Is_Input_Enabled()) {
            arena.Disable_Input();

            if (this.props.model.Is_Cell_Selectable(this.props.index)) {
                const player_index: Model.Player_Index = this.props.model.Current_Player_Index();
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
        if (this.props.model.Is_Cell_Selectable(this.props.index)) {
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
        const is_on_human_turn: boolean = this.props.model.Is_On_Human_Turn();
        const is_selectable: boolean = this.props.model.Is_Cell_Selectable(this.props.index);

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
    event_grid: Event.Grid,
    model: Model.Stake,
    index: Model.Stake_Index,
}

class Board_Stake extends React.Component<Board_Stake_Props>
{
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
        const color: Model.Color = this.props.model.Color();

        return (
            <div
                className="Board_Stake"
                style={{
                    backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                }}
            >
                <div>
                    {this.props.model.Card().Name()}
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
    Arena():
        Arena
    {
        return this.props.parent;
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
        const stake_count: Model.Stake_Count = this.props.model.Stake_Count();

        return (
            <div
                className="Player"
            >
                <Player_Turn_Icon
                    key={this.props.index}
                    event_grid={this.props.event_grid}
                    model={this.props.model}
                    index={this.props.index}
                />
                <div
                    className="Hand"
                    style={{
                        height: `calc(var(--card_height) / 3 * 2 * ${stake_count})`,
                    }}
                >
                    {
                        Array(stake_count).fill(null).map((_, index) =>
                        {
                            const stake: Model.Stake = this.props.model.Stake(index);
                            return (
                                <Player_Stake
                                    key={index}
                                    event_grid={this.props.event_grid}
                                    model={stake}
                                    index={index}
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
    event_grid: Event.Grid,
    model: Model.Player,
    index: Model.Player_Index,
}

class Player_Turn_Icon extends React.Component<Player_Turn_Icon_Props>
{
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
                    this.props.model.Is_On_Turn() ?
                        `˅` :
                        ``
                }
            </div>
        );
    }
}

type Player_Stake_Props = {
    event_grid: Event.Grid,
    model: Model.Stake,
    index: Model.Stake_Index,
}

class Player_Stake extends React.Component<Player_Stake_Props>
{
    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        event.stopPropagation();

        const arena: Model.Arena = this.props.model.Arena();
        if (arena.Is_Input_Enabled()) {
            arena.Disable_Input();

            if (this.props.model.Is_On_Player()) {
                const player: Model.Player = this.props.model.Claimant();
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
            this.props.model.Claimant().Select_Stake(stake_index);
        }

        this.forceUpdate();
    }

    componentDidMount():
        void
    {
        const player_index: Model.Player_Index = this.props.model.Claimant().Index();

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
        const color: Model.Color = this.props.model.Color();
        const is_of_human: boolean = this.props.model.Is_Of_Human();
        const is_selectable: boolean = this.props.model.Is_Selectable();

        return (
            <div
                className={
                    this.props.model.Is_Selected() ?
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
                {this.props.model.Card().Name()}
            </div>
        );
    }
}
