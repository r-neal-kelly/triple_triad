import "./view.css";

import React from "react";

import * as Messenger_m from "./messenger";
import * as Model from "./model";

const before_player_select_stake_msg: Messenger_m.Publisher_Name = `Before_Player_Select_Stake`;
const on_player_select_stake_msg: Messenger_m.Publisher_Name = `On_Player_Select_Stake`;
const after_player_select_stake_msg: Messenger_m.Publisher_Name = `After_Player_Select_Stake`;

const before_player_place_stake_msg: Messenger_m.Publisher_Name = `Before_Player_Place_Stake`;
const on_player_place_stake_msg: Messenger_m.Publisher_Name = `On_Player_Place_Stake`;
const after_player_place_stake_msg: Messenger_m.Publisher_Name = `After_Player_Place_Stake`;

class Subscriptions
{
    #owner: any;
    #messenger: Messenger_m.Messenger;
    #subscriptions: { [index: Messenger_m.Publisher_Name]: Messenger_m.Subscription };

    constructor(
        owner: any,
        messenger: Messenger_m.Messenger,
    )
    {
        this.#owner = owner;
        this.#messenger = messenger;
        this.#subscriptions = {};
    }

    async Subscribe(
        subscription_tuples: Array<[
            Messenger_m.Publisher_Name,
            Messenger_m.Subscriber_Handler,
        ]>,
    ):
        Promise<void[]>
    {
        return Promise.all(subscription_tuples.map(async function (
            this: Subscriptions,
            [
                publisher_name,
                subscription_handler,
            ],
        )
        {
            this.#subscriptions[publisher_name] = await this.#messenger.Subscribe(
                publisher_name,
                {
                    handler: subscription_handler.bind(this.#owner),
                }
            );
        }, this));
    }

    async Unsubscribe_All():
        Promise<void[]>
    {
        return Promise.all(Object.values(this.#subscriptions).map((subscription) =>
        {
            return this.#messenger.Unsubscribe(subscription);
        }));
    }
}

type Arena_Props = {
    messenger: Messenger_m.Messenger,
    model: Model.Arena,
}

export class Arena extends React.Component<Arena_Props>
{
    #subscriptions: Subscriptions;

    constructor(props: Arena_Props)
    {
        super(props);

        this.#subscriptions = new Subscriptions(this, this.props.messenger);
    }

    componentDidMount():
        void
    {
        this.#subscriptions.Subscribe([
        ]);
    }

    componentWillUnmount():
        void
    {
        this.#subscriptions.Unsubscribe_All();
    }

    render():
        JSX.Element
    {
        return (
            <div className="Arena">
                <Player
                    key={0}
                    messenger={this.props.messenger}
                    model={this.props.model.Player(0)}
                    index={0}
                />
                <Board
                    messenger={this.props.messenger}
                    model={this.props.model.Board()}
                />
                {Array(this.props.model.Player_Count() - 1).fill(null).map((_, index) =>
                {
                    const player_index: Model.Player_Index = index + 1;

                    return (
                        <Player
                            key={player_index}
                            messenger={this.props.messenger}
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
    messenger: Messenger_m.Messenger,
    model: Model.Board,
}

class Board extends React.Component<Board_Props>
{
    #subscriptions: Subscriptions;

    constructor(props: Board_Props)
    {
        super(props);

        this.#subscriptions = new Subscriptions(this, this.props.messenger);
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
        this.#subscriptions.Subscribe([
            [
                on_player_place_stake_msg,
                this.On_Player_Place_Stake,
            ],
        ]);
    }

    componentWillUnmount():
        void
    {
        this.#subscriptions.Unsubscribe_All();
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
                                    messenger={this.props.messenger}
                                    model={stake}
                                    index={index}
                                />
                            );
                        } else {
                            return (
                                <Board_Cell
                                    key={index}
                                    messenger={this.props.messenger}
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
    messenger: Messenger_m.Messenger,
    model: Model.Board,
    index: Model.Cell_Index,
}

class Board_Cell extends React.Component<Board_Cell_Props>
{
    #subscriptions: Subscriptions;

    constructor(props: Board_Cell_Props)
    {
        super(props);

        this.#subscriptions = new Subscriptions(this, this.props.messenger);
    }

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
                const publisher_info: Messenger_m.Publisher_Info = Object.freeze({
                    data: Object.freeze({
                        player_index,
                        cell_index,
                    }),
                    disable_until_complete: true,
                });

                await Promise.all([
                    this.props.messenger.Publish(before_player_place_stake_msg + `_` + player_index, publisher_info),
                    this.props.messenger.Publish(before_player_place_stake_msg, publisher_info),
                ]);

                await Promise.all([
                    this.props.messenger.Publish(on_player_place_stake_msg + `_` + player_index, publisher_info),
                    this.props.messenger.Publish(on_player_place_stake_msg, publisher_info),
                ]);

                await Promise.all([
                    this.props.messenger.Publish(after_player_place_stake_msg + `_` + player_index, publisher_info),
                    this.props.messenger.Publish(after_player_place_stake_msg, publisher_info),
                ]);
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
        this.#subscriptions.Subscribe([
            [
                after_player_select_stake_msg,
                this.After_Player_Select_Stake,
            ],
            [
                after_player_place_stake_msg,
                this.After_Player_Place_Stake,
            ],
        ]);
    }

    componentWillUnmount():
        void
    {
        this.#subscriptions.Unsubscribe_All();
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
    messenger: Messenger_m.Messenger,
    model: Model.Stake,
    index: Model.Stake_Index,
}

class Board_Stake extends React.Component<Board_Stake_Props>
{
    #subscriptions: Subscriptions;

    constructor(props: Board_Stake_Props)
    {
        super(props);

        this.#subscriptions = new Subscriptions(this, this.props.messenger);
    }

    componentDidMount():
        void
    {
        this.#subscriptions.Subscribe([
        ]);
    }

    componentWillUnmount():
        void
    {
        this.#subscriptions.Unsubscribe_All();
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
    messenger: Messenger_m.Messenger,
    model: Model.Player,
    index: Model.Player_Index,
}

class Player extends React.Component<Player_Props>
{
    #subscriptions: Subscriptions;

    constructor(props: Player_Props)
    {
        super(props);

        this.#subscriptions = new Subscriptions(this, this.props.messenger);
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

        this.#subscriptions.Subscribe([
            [
                after_player_place_stake_msg + `_` + player_index,
                this.After_This_Player_Place_Stake,
            ],
        ]);
    }

    componentWillUnmount():
        void
    {
        this.#subscriptions.Unsubscribe_All();
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
                    messenger={this.props.messenger}
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
                                    messenger={this.props.messenger}
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
    messenger: Messenger_m.Messenger,
    model: Model.Player,
    index: Model.Player_Index,
}

class Player_Turn_Icon extends React.Component<Player_Turn_Icon_Props>
{
    #subscriptions: Subscriptions;

    constructor(props: Player_Turn_Icon_Props)
    {
        super(props);

        this.#subscriptions = new Subscriptions(this, this.props.messenger);
    }

    componentDidMount():
        void
    {
        this.#subscriptions.Subscribe([
        ]);
    }

    componentWillUnmount():
        void
    {
        this.#subscriptions.Unsubscribe_All();
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
    messenger: Messenger_m.Messenger,
    model: Model.Stake,
    index: Model.Stake_Index,
}

class Player_Stake extends React.Component<Player_Stake_Props>
{
    #subscriptions: Subscriptions;

    constructor(props: Player_Stake_Props)
    {
        super(props);

        this.#subscriptions = new Subscriptions(this, this.props.messenger);
    }

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
                    const publisher_info: Messenger_m.Publisher_Info = Object.freeze({
                        data: Object.freeze({
                            player_index,
                            stake_index,
                        }),
                        disable_until_complete: true,
                    });

                    await Promise.all([
                        this.props.messenger.Publish(before_player_select_stake_msg + "_" + player_index, publisher_info),
                        this.props.messenger.Publish(before_player_select_stake_msg, publisher_info),
                    ]);

                    await Promise.all([
                        this.props.messenger.Publish(on_player_select_stake_msg + "_" + player_index, publisher_info),
                        this.props.messenger.Publish(on_player_select_stake_msg, publisher_info),
                    ]);

                    await Promise.all([
                        this.props.messenger.Publish(after_player_select_stake_msg + "_" + player_index, publisher_info),
                        this.props.messenger.Publish(after_player_select_stake_msg, publisher_info),
                    ]);
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

        this.#subscriptions.Subscribe([
            [
                on_player_select_stake_msg + "_" + player_index,
                this.On_This_Player_Select_Stake,
            ],
        ]);
    }

    componentWillUnmount():
        void
    {
        this.#subscriptions.Unsubscribe_All();
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
