import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import Model from "./model.js";

class View extends React.Component
{
    #state;

    constructor(props)
    {
        super(props);

        this.#state = {
            model: new Model(2, 3, 3),
        };
    }

    render()
    {
        return (
            <div className="View">
                <h1 className="Title">
                    Triple Triad
                </h1>
                <Arena
                    model={this.#state.model}
                />
            </div>
        );
    }
}

class Arena extends React.PureComponent
{
    render()
    {
        return (
            <div className="Arena">
                <Player
                    key={0}
                    model={this.props.model.Player(0)}
                />
                <Board
                    model={this.props.model.Board()}
                />
                {Array(this.props.model.Player_Count() - 1).fill(null).map((_, index) =>
                {
                    const player_index = index + 1;

                    return (
                        <Player
                            key={player_index}
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
                    Array(this.props.model.Tile_Count()).fill(null).map((_, index) =>
                    {
                        return (
                            <Tile
                                key={index}
                                id={index}
                            />
                        );
                    })
                }
            </div>
        );
    }
}

class Player extends React.PureComponent
{
    render()
    {
        return (
            <div className="Player">
                <Hand
                    model={this.props.model.Hand()}
                />
            </div>
        );
    }
}

class Hand extends React.PureComponent
{
    render()
    {
        return (
            <div className="Hand">
                {Array(this.props.model.Card_Count()).fill(null).map((_, index) =>
                {
                    return (
                        <Tile
                            key={index}
                            id={index}
                        />
                    );
                })}
            </div>
        );
    }
}

class Tile extends React.PureComponent
{
    render()
    {
        return (
            <div className="Tile">
                <div>
                    {this.props.id}
                </div>
            </div>
        );
    }
}

class Card extends React.PureComponent
{
    render()
    {
        return (
            <div className="Card">
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <View />
    </React.StrictMode>
);
