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
    #subscriptions;

    constructor(props)
    {
        super(props);

        this.#subscriptions = {};
    }

    async On_Player_Select_Stake({ stake_index })
    {
        this.props.model.Select_Stake(stake_index);

        await new Promise((resolve, reject) =>
        {
            setTimeout(() =>
            {
                resolve();
            }, 1000);
        });

        console.log(`Player ${this.props.model.ID()} selected ${this.props.model.Selected_Stake().Card().Name()}`);

        // need to make sure this and setState can be called on multiple components without too much loss in efficiency
        this.forceUpdate();
    }

    async Subscribe(publisher_name, handler)
    {
        this.#subscriptions[publisher_name] = await this.props.messenger.Subscribe(publisher_name, { handler: handler.bind(this) });
    }

    async Unsubscribe(publisher_name)
    {
        await this.props.messenger.Unsubscribe(this.#subscriptions[publisher_name]);
    }

    async Unsubscribe_All()
    {
        await Promise.all(Object.values(this.#subscriptions).map(subscription =>
        {
            return this.props.messenger.Unsubscribe(subscription);
        }));
    }

    componentDidMount()
    {
        this.Subscribe(on_player_select_stake_msg + "_" + this.props.model.ID(), this.On_Player_Select_Stake);
    }

    componentWillUnmount()
    {
        this.Unsubscribe_All();
    }

    render()
    {
        return (
            <div className="Player">
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

class Player_Stake extends React.Component
{
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

    render()
    {
        const color = this.props.model.Color();
        const is_of_human = this.props.model.Is_Of_Human();
        const is_selectable = this.props.model.Is_Selectable();

        return (
            <div
                className="Player_Stake"
                style={{
                    backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                    cursor: `${is_of_human && is_selectable ? `pointer` : `default`}`
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
