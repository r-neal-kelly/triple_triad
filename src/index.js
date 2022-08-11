import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import Model from './model.js';

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
                <h1>Triple Triad</h1>
                <Board tile_count={this.state.model.tile_count} />
            </div>
        );
    }
}

class Board extends React.PureComponent
{
    render()
    {
        return (
            <div className="Board">
                {Array(this.props.tile_count).fill(null).map((_, index) =>
                {
                    return (
                        <Tile key={index} id={index} />
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
                {this.props.id}
            </div>
        );
    }
}

class Card extends React.PureComponent
{
    render()
    {
        return (
            <div />
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <Game />
    </React.StrictMode>
);
