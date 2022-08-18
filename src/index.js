import React from "react";
import ReactDOM from "react-dom/client";

import Messenger from "./messenger.ts";
import * as Model from "./model.js";
import * as View from "./view.js";

class Main extends React.Component
{
    #messenger; // this maybe should be on the state object, so that we have a clean sweep of it when this is regen'd
    state;

    constructor(props)
    {
        super(props);

        this.#messenger = new Messenger();

        this.state = {};

        this.state.packs = new Model.Packs();

        // to be serialized
        this.state.rules = new Model.Rules({
            row_count: 3,
            column_count: 3,
            player_count: 2,

            open: true,
            random: true, // temp until we build up serialization more
        });

        // to be serialized
        this.state.collection = new Model.Collection({
            default_shuffle: new Model.Shuffle({
                pack: this.state.packs.Random_Pack(),
                min_tier_index: 0,
                max_tier_index: 0,
            }),
        });

        this.state.arena = new Model.Arena({
            rules: this.state.rules,
            selections: [
                new Model.Selection({
                    collection: this.state.collection,
                    color: new Model.Color({
                        red: 0,
                        green: 0,
                        blue: 255,
                    }),
                    random_card_count: this.state.rules.Selection_Count(),
                }),
                new Model.Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: this.state.packs.Random_Pack(),
                            min_tier_index: 0,
                            max_tier_index: 0,
                        }),
                    }),
                    color: new Model.Color({
                        red: 255,
                        green: 0,
                        blue: 0,
                    }),
                    random_card_count: this.state.rules.Selection_Count(),
                }),
            ],
        });

        console.log(this.state.arena); // temp
    }

    render()
    {
        return (
            <div className="View">
                <h1 className="Title">
                    Triple Triad
                </h1>
                <View.Arena
                    messenger={this.#messenger}
                    model={this.state.arena}
                />
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <Main />
);
