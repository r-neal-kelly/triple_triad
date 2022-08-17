import "./view.css";

import React from "react";

export class Arena extends React.Component
{
    // temp
    async Test(data)
    {
        console.log("Test worked.");
    }

    render()
    {
        this.props.messanger.Subscribe("Test", this.Test); // temp

        return (
            <div className="Arena">
                <Player
                    key={0}
                    messanger={this.props.messanger}
                    model={this.props.model.Player(0)}
                />
                <Board
                    messanger={this.props.messanger}
                    model={this.props.model.Board()}
                />
                {Array(this.props.model.Player_Count() - 1).fill(null).map((_, index) =>
                {
                    const player_index = index + 1;

                    return (
                        <Player
                            key={player_index}
                            messanger={this.props.messanger}
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
                                messanger={this.props.messanger}
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
                    messanger={this.props.messanger}
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
                            messanger={this.props.messanger}
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
                        messanger={this.props.messanger}
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
        await this.props.messanger.Publish("Test");
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
                onClick={() => this.Test(this)} // temp
            >
            </div>
        );
    }
}
