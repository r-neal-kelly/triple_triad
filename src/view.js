import "./view.css";

import React from "react";

export class Arena extends React.Component
{
    // temp
    #test_handle;

    async Subscribe()
    {
        this.#test_handle = await this.props.messenger.Subscribe("Test", this.Test.bind(this));
    }

    async Unsubscribe()
    {
        await this.props.messenger.Unsubscribe("Test", this.#test_handle);
    }

    async Test(data)
    {
        await this.Unsubscribe();

        console.log("Test worked.");

        await new Promise((resolve, reject) =>
        {
            setTimeout(() =>
            {
                resolve();
            }, 1000);
        });

        console.log("Waited a second.");

        await this.Subscribe();
    }
    //

    render()
    {
        this.Subscribe(); // temp

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
                        return (
                            <Cell
                                key={index}
                                id={index}
                                messenger={this.props.messenger}
                                model={this.props.model}
                            />
                        );
                    })
                }
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
                {Array(this.props.model.Stake_Count()).fill(null).map((_, index) =>
                {
                    return (
                        <Cell
                            key={index}
                            id={index}
                            messenger={this.props.messenger}
                            model={this.props.model}
                        />
                    );
                })}
            </div>
        );
    }
}

class Cell extends React.Component
{
    render()
    {
        const stake = this.props.model.Stake(this.props.id);

        return (
            <div className="Cell">
                {stake ?
                    <Stake
                        key={this.props.id}
                        id={this.props.id}
                        messenger={this.props.messenger}
                        model={stake}
                    /> :
                    <div>
                        {this.props.id}
                    </div>
                }
            </div>
        );
    }
}

class Stake extends React.Component
{
    // temp
    async Test()
    {
        await this.props.messenger.Publish("Test", {});

        console.log("Finished waiting for all subscriptions.");
    }

    render()
    {
        const color = this.props.model.Color();

        return (
            <div
                className="Stake"
                style={{
                    backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                }}
                onClick={() => this.Test.bind(this)()} // temp
            >
            </div>
        );
    }
}
