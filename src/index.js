import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import Model from "./model.js";

class Game extends React.PureComponent
{
    constructor(props)
    {
        super(props);

        this.state = {
            model: new Model(),
        };
    }

    render()
    {
        return (
            <div className="Game">
                <h1 className="Title">
                    Triple Triad
                </h1>
                <Board
                    tile_count={this.state.model.tile_count}
                    column_count={this.state.model.column_count}
                />
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
                    grid: "auto /" + Array(this.props.column_count).fill(" auto").join(""),
                }}
            >
                {
                    Array(this.props.tile_count).fill(null).map((_, index) =>
                    {
                        return (
                            <Tile key={index} id={index} />
                        );
                    })
                }
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
            <div className="Card" />
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <Game />
    </React.StrictMode>
);
