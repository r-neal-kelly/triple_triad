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
            player_count: 4,

            open: true,
            same: true,
            plus: true,
            wall: true,
            combo: true,
            random: true, // temp until we build up serialization more

            is_small_board: true,
        });

        // to be serialized for human players
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
                            min_tier_index: 0,
                            max_tier_index: 9,
                        }),
                    }),
                    color: new Model.Color({
                        red: 63,
                        green: 63,
                        blue: 127,
                        alpha: 0.7,
                    }),
                    is_of_human: true,
                    card_count: this.#rules.Selection_Card_Count(),
                }),
                new Model.Random_Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: this.#packs.Pack(`Cats`),
                            min_tier_index: 0,
                            max_tier_index: 9,
                        }),
                    }),
                    color: new Model.Color({
                        red: 63,
                        green: 127,
                        blue: 63,
                        alpha: 0.7,
                    }),
                    is_of_human: false,
                    card_count: this.#rules.Selection_Card_Count(),
                }),
                new Model.Random_Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: this.#packs.Pack(`Cats`),
                            min_tier_index: 0,
                            max_tier_index: 9,
                        }),
                    }),
                    color: new Model.Color({
                        red: 127,
                        green: 63,
                        blue: 63,
                        alpha: 0.7,
                    }),
                    is_of_human: false,
                    card_count: this.#rules.Selection_Card_Count(),
                }),
                new Model.Random_Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: this.#packs.Pack(`Cats`),
                            min_tier_index: 0,
                            max_tier_index: 9,
                        }),
                    }),
                    color: new Model.Color({
                        red: 127,
                        green: 127,
                        blue: 0,
                        alpha: 0.7,
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
            <View.Arena
                key={`arena`}
                event_grid={this.#event_grid}
                model={this.#arena}
            />
        );
    }
}

const view_element: HTMLElement | null = document.getElementById("view");
if (view_element == null) {
    throw new Error(`'view_element' could not be found in the dom.`);
} else {
    const root_component: ReactDOM.Root = ReactDOM.createRoot(view_element);

    root_component.render(
        <Main />
    );
}
