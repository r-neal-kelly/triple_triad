import React from "react";
import ReactDOM from "react-dom/client";

import * as Model from "./model.js";
import * as View from "./view.js";

class Main extends React.Component
{
    #state; // does this need to be public for react?

    constructor(props)
    {
        super(props);

        this.#state = {
            packs_model: new Model.Packs(),
            arena_model: new Model.Arena(new Model.Rules(), 3, 3, 2),
        };
    }

    render()
    {
        return (
            <div className="View">
                <h1 className="Title">
                    Triple Triad
                </h1>
                <View.Arena
                    model={this.#state.arena_model}
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
