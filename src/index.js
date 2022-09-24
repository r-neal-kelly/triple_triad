import React from "react";
import ReactDOM from "react-dom/client";

import Messenger from "./messenger.ts";
import * as Model from "./model.ts";
import * as View from "./view.js";

class Main extends React.Component
{
    #messenger;
    #packs;
    #rules;
    #collection;
    #arena;

    constructor(props)
    {
        super(props);

        this.#messenger = new Messenger();

        this.#packs = new Model.Packs();

        // to be serialized
        this.#rules = new Model.Rules({
            row_count: 3,
            column_count: 3,
            player_count: 2,

            open: true,
            random: true, // temp until we build up serialization more
        });

        // to be serialized
        this.#collection = new Model.Collection({
            default_shuffle: new Model.Shuffle({
                pack: this.#packs.Random_Pack(),
                min_tier_index: 0,
                max_tier_index: 0,
            }),
        });

        this.#arena = new Model.Arena({
            rules: this.#rules,
            selections: [
                new Model.Selection({
                    collection: this.#collection,
                    color: new Model.Color({
                        red: 0,
                        green: 0,
                        blue: 255,
                    }),
                    is_of_human: true,
                    random_card_count: this.#rules.Selection_Card_Count(),
                }),
                new Model.Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: this.#packs.Random_Pack(),
                            min_tier_index: 0,
                            max_tier_index: 0,
                        }),
                    }),
                    color: new Model.Color({
                        red: 255,
                        green: 0,
                        blue: 0,
                    }),
                    is_of_human: false,
                    random_card_count: this.#rules.Selection_Card_Count(),
                }),
            ],
        });
    }

    componentDidMount()
    {
    }

    componentWillUnmount()
    {
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
                    model={this.#arena}
                />
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <Main />
);
