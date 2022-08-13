import React from "react";
import ReactDOM from "react-dom/client";

import * as Model from "./model.js";
import * as View from "./view.js";

class Main extends React.Component
{
    state;

    constructor(props)
    {
        super(props);

        this.state = {};

        this.state.packs = new Model.Packs();
        this.state.rules = new Model.Rules(); // to be serialized
        this.state.collection = new Model.Collection(new Model.Shuffle(this.state.packs.Random_Pack(), 0, 0)); // to be serialized
        this.state.arena = new Model.Arena({
            rules: this.state.rules,
            // the count of this array informs the number of players
            collections: [
                this.state.collection, // this would be the human player's collection
                new Model.Collection(new Model.Shuffle(this.state.packs.Random_Pack(), 0, 0)), // a cpu
            ],
            board_row_count: 3,
            board_column_count: 3,
        });
    }

    render()
    {
        return (
            <div className="View">
                <h1 className="Title">
                    Triple Triad
                </h1>
                <View.Arena
                    model={this.state.arena}
                />
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <Main />
    </React.StrictMode>
);
