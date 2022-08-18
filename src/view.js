import "./view.css";

import React from "react";

export class Arena extends React.Component
{
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
                                <Stake
                                    key={index}
                                    id={index}
                                    messenger={this.props.messenger}
                                    model={stake}
                                />
                            );
                        } else {
                            return (
                                <Cell
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

class Player extends React.Component
{
    #subscriptions;

    constructor(props)
    {
        super(props);

        this.#subscriptions = {};
    }

    async On_Player_Stake_Select({ index })
    {
        this.props.model.Select_Stake(index);

        await new Promise((resolve, reject) =>
        {
            setTimeout(() =>
            {
                resolve();
            }, 1000);
        });

        console.log(`Player ${this.props.model.ID()} selected ${this.props.model.Selected_Stake().Card().Name()}`);

        this.forceUpdate(); // maybe temp
    }

    async Subscribe(publisher_name, handler)
    {
        publisher_name += "_" + this.props.model.ID();
        this.#subscriptions[publisher_name] = await this.props.messenger.Subscribe(publisher_name, { handler: handler.bind(this) });
    }

    async Unsubscribe(publisher_name)
    {
        publisher_name += "_" + this.props.model.ID();
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
        this.Subscribe("Player_Stake_Select", this.On_Player_Stake_Select);
    }

    componentWillUnmount()
    {
        this.Unsubscribe_All();
    }

    render()
    {
        return (
            <div className="Player">
                <Hand
                    messenger={this.props.messenger}
                    model={this.props.model}
                />
            </div>
        );
    }
}

class Hand extends React.Component
{
    render()
    {
        return (
            <div className="Hand">
                {
                    Array(this.props.model.Stake_Count()).fill(null).map((_, index) =>
                    {
                        const stake = this.props.model.Stake(index);
                        if (stake != null) {
                            return (
                                <Stake
                                    key={index}
                                    id={index}
                                    messenger={this.props.messenger}
                                    model={stake}
                                />
                            );
                        } else {
                            return (
                                <Cell
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

class Cell extends React.Component
{
    render()
    {
        return (
            <div
                className="Cell"
            >
                <div>
                    {this.props.id}
                </div>
            </div>
        );
    }
}

class Stake extends React.Component
{
    async On_Click(event)
    {
        event.stopPropagation();

        if (this.props.model.Is_On_Player()) {
            await this.props.messenger.Publish("Player_Stake_Select_" + this.props.model.Claimant().ID(), {
                data: {
                    event,
                    index: this.props.id,
                },
                disable_until_complete: true,
            });
        }
    }

    render()
    {
        const color = this.props.model.Color();
        const is_on_player = this.props.model.Is_On_Player();

        return (
            <div
                className="Stake"
                style={{
                    backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                    cursor: `${is_on_player ? "pointer" : "default"}`,
                }}
                onClick={event => this.On_Click.bind(this)(event)}
            >
                {this.props.model.Card().Name()}
            </div>
        );
    }
}
