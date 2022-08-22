import "./view.css";

import React from "react";

const before_player_select_stake_msg = "Before_Player_Select_Stake";
const on_player_select_stake_msg = "On_Player_Select_Stake";
const after_player_select_stake_msg = "After_Player_Select_Stake";

export class Arena extends React.Component
{
    // temp
    componentDidMount()
    {
        this.props.messenger.Subscribe(before_player_select_stake_msg, {
            handler: ({ player_index, stake_index }) =>
            {
                console.log(`Before Player Select Stake: player_index == ${player_index}, stake_index == ${stake_index}`);
            }
        });

        this.props.messenger.Subscribe(on_player_select_stake_msg, {
            handler: ({ player_index, stake_index }) =>
            {
                console.log(`On Player Select Stake: player_index == ${player_index}, stake_index == ${stake_index}`);
            }
        });

        this.props.messenger.Subscribe(after_player_select_stake_msg, {
            handler: ({ player_index, stake_index }) =>
            {
                console.log(`After Player Select Stake: player_index == ${player_index}, stake_index == ${stake_index}`);
            }
        });
    }
    // temp

    render()
    {
        return (
            <div className="Arena">
                <Player
                    key={0}
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
                            messenger={this.props.messenger}
                            model={this.props.model.Player(player_index)}
                        />
                    );
                })}
            </div>
        );
    }
}

class Board extends React.Component
{
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

class Board_Cell extends React.Component
{
    async On_Click(event)
    {
        event.stopPropagation();

        console.log("w");
    }

    render()
    {
        return (
            <div
                className="Board_Cell"
                onClick={event => this.On_Click.bind(this)(event)}
            >
                <div>
                    {this.props.id}
                </div>
            </div>
        );
    }
}

class Board_Stake extends React.Component
{
    async On_Click(event)
    {
        event.stopPropagation();
    }

    render()
    {
        return (
            <div
                className="Board_Stake"
                onClick={event => this.On_Click.bind(this)(event)}
            >
                <div>
                    {this.props.model.Card().Name()}
                </div>
            </div>
        );
    }
}

class Player extends React.Component
{
    render()
    {
        return (
            <div className="Player">
                <Player_Turn_Icon
                    key={this.props.id}
                    id={this.props.id}
                    messenger={this.props.messenger}
                    model={this.props.model}
                />
                <div className="Hand">
                    {
                        Array(this.props.model.Stake_Count()).fill(null).map((_, index) =>
                        {
                            const stake = this.props.model.Stake(index);
                            return (
                                <Player_Stake
                                    key={index}
                                    id={index}
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

class Player_Turn_Icon extends React.Component
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

    async On_Player_Select_Stake({ stake_index })
    {
        if (this.props.id === stake_index) {
            this.props.model.Claimant().Select_Stake(stake_index);
            this.setState({ is_selected: true });
        } else {
            this.setState({ is_selected: false });
        }
    }

    componentDidMount()
    {
        const player = this.props.model.Claimant();
        const player_index = player.ID();

        [
            [
                on_player_select_stake_msg + "_" + player_index,
                this.On_Player_Select_Stake,
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
