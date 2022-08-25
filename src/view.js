import "./view.css";

import React from "react";

const before_player_select_stake_msg = `Before_Player_Select_Stake`;
const on_player_select_stake_msg = `On_Player_Select_Stake`;
const after_player_select_stake_msg = `After_Player_Select_Stake`;

const before_player_place_stake_msg = `Before_Player_Place_Stake`;
const on_player_place_stake_msg = `On_Player_Place_Stake`;
const after_player_place_stake_msg = `After_Player_Place_Stake`;

export class Arena extends React.PureComponent
{
    render()
    {
        return (
            <div className="Arena">
                <Player
                    key={0}
                    id={0}
                    messenger={this.props.messenger}
                    model={this.props.model.Player(0)}
                />
                <Board
                    messenger={this.props.messenger}
                    model={this.props.model.Board()}
                />
                {Array(this.props.model.Player_Count() - 1).fill(null).map((_, index) =>
                {
                    const player_index = index + 1;

                    return (
                        <Player
                            key={player_index}
                            id={player_index}
                            messenger={this.props.messenger}
                            model={this.props.model.Player(player_index)}
                        />
                    );
                })}
            </div>
        );
    }
}

class Board extends React.PureComponent
{
    #subscriptions;
    state;

    constructor(props)
    {
        super(props);

        this.#subscriptions = {};

        this.state = {};
    }

    async On_Player_Place_Stake({ cell_index })
    {
        this.props.model.Place_Player_Selected_Stake(cell_index);
        this.forceUpdate();
    }

    componentDidMount()
    {
        [
            [
                on_player_place_stake_msg,
                this.On_Player_Place_Stake,
            ],
        ].forEach(async function ([publisher_name, handler])
        {
            this.#subscriptions[publisher_name] = await this.props.messenger.Subscribe(publisher_name, { handler: handler.bind(this) });
        }, this);
    }

    componentWillUnmount()
    {
        Promise.all(Object.values(this.#subscriptions).map(subscription =>
        {
            return this.props.messenger.Unsubscribe(subscription);
        }));
    }

    render()
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
                        const stake = this.props.model.Stake(index);
                        if (stake != null) {
                            return (
                                <Board_Stake
                                    key={index}
                                    id={index}
                                    messenger={this.props.messenger}
                                    model={stake}
                                />
                            );
                        } else {
                            return (
                                <Board_Cell
                                    key={index}
                                    id={index}
                                    messenger={this.props.messenger}
                                    model={this.props.model}
                                />
                            );
                        }
                    })
                }
            </div>
        );
    }
}

class Board_Cell extends React.PureComponent
{
    #subscriptions;
    state;

    constructor(props)
    {
        super(props);

        this.#subscriptions = {};

        this.state = {};
        this.state.is_on_human_turn = this.props.model.Is_On_Human_Turn();
        this.state.is_selectable = this.props.model.Is_Cell_Selectable(this.props.id);
    }

    async On_Click(event)
    {
        event.stopPropagation();

        if (this.state.is_selectable) {
            const player_index = this.props.model.Current_Player_Index();
            const cell_index = this.props.id;
            const publisher_info = Object.freeze({
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
    }

    async After_Player_Select_Stake()
    {
        this.setState({ is_selectable: this.props.model.Is_Cell_Selectable(this.props.id) });
    }

    async After_Player_Place_Stake()
    {
        this.setState({ is_selectable: false });
    }

    componentDidMount()
    {
        [
            [
                after_player_select_stake_msg,
                this.After_Player_Select_Stake,
            ],
            [
                after_player_place_stake_msg,
                this.After_Player_Place_Stake,
            ],
        ].forEach(async function ([publisher_name, handler])
        {
            this.#subscriptions[publisher_name] = await this.props.messenger.Subscribe(publisher_name, { handler: handler.bind(this) });
        }, this);
    }

    componentWillUnmount()
    {
        Promise.all(Object.values(this.#subscriptions).map(subscription =>
        {
            return this.props.messenger.Unsubscribe(subscription);
        }));
    }

    render()
    {
        return (
            <div
                className="Board_Cell"
                style={{
                    cursor: `${this.state.is_on_human_turn && this.state.is_selectable ? `pointer` : `default`}`,
                }}
                onClick={event => this.On_Click.bind(this)(event)}
            >
                <div>
                    {this.props.id}
                </div>
            </div>
        );
    }
}

class Board_Stake extends React.PureComponent
{
    render()
    {
        const color = this.props.model.Color();

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

class Player extends React.PureComponent
{
    #subscriptions;
    state;

    constructor(props)
    {
        super(props);

        this.#subscriptions = {};

        this.state = {};
    }

    async After_This_Player_Place_Stake()
    {
        this.forceUpdate();
    }

    componentDidMount()
    {
        const player_index = this.props.id;

        [
            [
                after_player_place_stake_msg + `_` + player_index,
                this.After_This_Player_Place_Stake,
            ],
        ].forEach(async function ([publisher_name, handler])
        {
            this.#subscriptions[publisher_name] = await this.props.messenger.Subscribe(publisher_name, { handler: handler.bind(this) });
        }, this);
    }

    componentWillUnmount()
    {
        Promise.all(Object.values(this.#subscriptions).map(subscription =>
        {
            return this.props.messenger.Unsubscribe(subscription);
        }));
    }

    render()
    {
        const stake_count = this.props.model.Stake_Count();

        return (
            <div
                className="Player"
            >
                <Player_Turn_Icon
                    key={this.props.id}
                    id={this.props.id}
                    messenger={this.props.messenger}
                    model={this.props.model}
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
                            const stake = this.props.model.Stake(index);
                            return (
                                <Player_Stake
                                    key={index}
                                    id={index}
                                    count={stake_count}
                                    messenger={this.props.messenger}
                                    model={stake}
                                />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

class Player_Turn_Icon extends React.PureComponent
{
    render()
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

class Player_Stake extends React.PureComponent
{
    #subscriptions;
    state;

    constructor(props)
    {
        super(props);

        this.#subscriptions = {};

        this.state = {};
        this.state.is_selected = this.props.model.Is_Selected();
    }

    async On_Click(event)
    {
        event.stopPropagation();

        const arena = this.props.model.Arena();
        if (arena.Is_Input_Enabled()) {
            arena.Disable_Input();

            if (this.props.model.Is_On_Player()) {
                const player = this.props.model.Claimant();
                if (player.Is_On_Turn()) {
                    const player_index = player.ID();
                    const stake_index = this.props.id;
                    const publisher_info = Object.freeze({
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

    async On_This_Player_Select_Stake({ stake_index })
    {
        if (this.props.id === stake_index) {
            this.props.model.Claimant().Select_Stake(stake_index);
            this.setState({ is_selected: true });
        } else {
            this.setState({ is_selected: false });
        }
    }

    async After_This_Player_Place_Stake()
    {
        this.setState({ is_selected: false });
    }

    componentDidMount()
    {
        const player = this.props.model.Claimant();
        const player_index = player.ID();

        [
            [
                on_player_select_stake_msg + "_" + player_index,
                this.On_This_Player_Select_Stake,
            ],
            [
                after_player_place_stake_msg + `_` + player_index,
                this.After_This_Player_Place_Stake,
            ],
        ].forEach(async function ([publisher_name, handler])
        {
            this.#subscriptions[publisher_name] = await this.props.messenger.Subscribe(publisher_name, { handler: handler.bind(this) });
        }, this);
    }

    componentWillUnmount()
    {
        Promise.all(Object.values(this.#subscriptions).map(subscription =>
        {
            return this.props.messenger.Unsubscribe(subscription);
        }));
    }

    render()
    {
        const color = this.props.model.Color();
        const is_of_human = this.props.model.Is_Of_Human();
        const is_selectable = this.props.model.Is_Selectable();

        return (
            <div
                className={
                    this.state.is_selected ?
                        `Player_Selected_Stake` :
                        `Player_Stake`
                }
                style={{
                    backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                    cursor: `${is_of_human && is_selectable ? `pointer` : `default`}`,
                    zIndex: `${this.props.id}`,
                    top: `calc((0px - var(--card_height)) / 3 * ${this.props.id})`,
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
