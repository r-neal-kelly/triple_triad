import React from "react";
import ReactDOM from "react-dom/client";

import * as Event from "./event";
import * as Model from "./model";
import * as View from "./view";

type Main_Props = {
}

class Main extends React.Component<Main_Props>
{
    #event_grid: Event.Grid;
    #packs: Model.Packs;
    #rules: Model.Rules;
    #collection: Model.Collection;
    #arena: Model.Arena;

    constructor(props: Main_Props)
    {
        super(props);

        this.#event_grid = new Event.Grid();

        this.#packs = new Model.Packs();

        // to be serialized
        this.#rules = new Model.Rules({
            row_count: 3,
            column_count: 3,
            player_count: 2,

            open: true,
            same: true,
            plus: true,
            wall: true,
            combo: true,
            random: true, // temp until we build up serialization more
        });

        // to be serialized
        this.#collection = new Model.Collection({
            default_shuffle: new Model.Shuffle({
                pack: this.#packs.Pack(`Cats`),
                min_tier_index: 0,
                max_tier_index: 0,
            }),
        });

        this.#arena = new Model.Arena({
            rules: this.#rules,
            selections: [
                new Model.Random_Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: this.#packs.Pack(`Cats`),
                            min_tier_index: 9,
                            max_tier_index: 9,
                        }),
                    }),
                    color: new Model.Color({
                        red: 0,
                        green: 0,
                        blue: 255,
                    }),
                    is_of_human: true,
                    card_count: this.#rules.Selection_Card_Count(),
                }),
                new Model.Random_Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: this.#packs.Pack(`Cats`),
                            min_tier_index: 9,
                            max_tier_index: 9,
                        }),
                    }),
                    color: new Model.Color({
                        red: 255,
                        green: 0,
                        blue: 0,
                    }),
                    is_of_human: false,
                    card_count: this.#rules.Selection_Card_Count(),
                }),
            ],
        });
    }

    componentDidMount():
        void
    {
    }

    componentWillUnmount():
        void
    {
    }

    render():
        JSX.Element
    {
        return (
            <div className="View" >
                <h1 className="Title" >
                    Triple Triad
                </h1>
                <View.Arena
                    event_grid={this.#event_grid}
                    model={this.#arena}
                />
            </div>
        );
    }
}

const root_element: HTMLElement | null = document.getElementById("root");
if (root_element == null) {
    throw new Error(`'root_element' could not be found in the dom.`);
} else {
    const root_component: ReactDOM.Root = ReactDOM.createRoot(root_element);

    root_component.render(
        <Main />
    );
}
