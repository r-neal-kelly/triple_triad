import { Float } from "../types";

import { Wait } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Menu } from "./menu"
import { Exhibitions } from "../view";
import { Arena } from "./arena";
import { Results } from "./results";

type Main_Props = {
    model: Model.Main;
    parent: HTMLElement;
    event_grid: Event.Grid;
}

export class Main extends Component<Main_Props>
{
    private menu: Menu | null = null;
    private exhibitions: Exhibitions | null = null;
    private arena: Arena | null = null;
    private results: Results | null = null;

    private current_width: Float;
    private current_height: Float;
    private resize_observer: ResizeObserver;

    constructor(props: Main_Props)
    {
        super(props);

        const rect: DOMRect = this.Parent().getBoundingClientRect();
        this.current_width = rect.width;
        this.current_height = rect.height;
        this.resize_observer = new ResizeObserver((this.On_Resize.bind(this)));
    }

    Menu():
        Menu
    {
        return this.Try_Object(this.menu);
    }

    Exhibitions():
        Exhibitions
    {
        return this.Try_Object(this.exhibitions);
    }

    Arena():
        Arena
    {
        return this.Try_Object(this.arena);
    }

    Results():
        Results
    {
        return this.Try_Object(this.results);
    }

    Width():
        Float
    {
        return this.current_width;
    }

    Height():
        Float
    {
        return this.current_height;
    }

    CSS_Width():
        string
    {
        return `${this.Width()}px`;
    }

    CSS_Height():
        string
    {
        return `${this.Height()}px`;
    }

    Before_Life():
        Component_Styles
    {
        return ({
            position: `relative`,

            animationName: `Main_Fade_In`,
            animationDuration: `5000ms`,
            animationTimingFunction: `ease-in-out`,
            animationIterationCount: `1`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        // we create an exhibition match between computers for the background of main
        // and keep doing rematches until the player decides to start up a game of their own

        const model: Model.Main = this.Model();

        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        if (model.Isnt_In_Game()) {
            return (
                <div
                    className={`Main`}
                    style={this.Styles()}
                >
                    <Menu
                        key={`menu`}
                        ref={ref => this.menu = ref}

                        model={model.Menu()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                    <Exhibitions
                        key={`exhibitions`}
                        ref={ref => this.exhibitions = ref}

                        model={this.Model()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            const arena: Model.Arena = model.Current_Arena() as Model.Arena;

            return (
                <div
                    className={`Main`}
                    style={this.Styles()}
                >
                    <Arena
                        key={`arena_${arena.ID()}`}
                        ref={ref => this.arena = ref}

                        model={arena}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                    <Results
                        key={`results`}
                        ref={ref => this.results = ref}

                        model={arena}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        this.resize_observer.observe(this.Parent());

        this.While_Alive();

        return [
            {
                event_name: new Event.Name(Event.ON, Event.START_NEW_GAME),
                event_handler: this.On_Start_New_Game,
            },
            {
                event_name: new Event.Name(Event.ON, Event.REMATCH_GAME),
                event_handler: this.On_Rematch_Game,
            },
            {
                event_name: new Event.Name(Event.ON, Event.EXIT_GAME),
                event_handler: this.On_Exit_Game,
            },
        ];
    }

    On_Resize():
        void
    {
        const rect: DOMRect = this.Parent().getBoundingClientRect();
        if (this.current_width !== rect.width || this.current_height !== rect.height) {
            this.current_width = rect.width;
            this.current_height = rect.height;

            // Our event system is way faster than react's, so we go
            // ahead and do preliminary updates then call refresh.
            this.Send({
                name_affix: `${Event.RESIZE}_${this.ID()}`,
                data: {
                    width: this.current_width,
                    height: this.current_height,
                } as Event.Resize_Data,
                is_atomic: false,
            });

            this.Refresh();
        }
    }

    async While_Alive():
        Promise<void>
    {
        while (true) {
            await Wait(5000);
            if (this.Is_Alive()) {
                this.Model().Change_Current_Exhibition();
                await this.Refresh();
            } else {
                return;
            }
        }
    }

    async On_Start_New_Game(
        {
        }: Event.Start_New_Game_Data
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Main = this.Model();
            const packs: Model.Packs = model.Packs();
            const options: Model.Options = model.Menu().Options().Data();
            const rules: Model.Rules = options.Rules();

            const selections: Array<Model.Selection> = [
                new Model.Random_Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: packs.Pack(`Cats`),
                            min_tier_index: 0,
                            max_tier_index: 9,
                        }),
                    }),
                    color: options.Player_Color(0),
                    is_of_human: true,
                    card_count: rules.Selection_Card_Count(),
                }),
            ];
            for (let idx = 1, end = rules.Player_Count(); idx < end; idx += 1) {
                selections.push(
                    new Model.Random_Selection({
                        collection: new Model.Collection({
                            default_shuffle: new Model.Shuffle({
                                pack: packs.Pack(`Cats`),
                                min_tier_index: 0,
                                max_tier_index: 9,
                            }),
                        }),
                        color: options.Player_Color(idx),
                        is_of_human: false,
                        card_count: rules.Selection_Card_Count(),
                    }),
                );
            }

            model.New_Game(selections);

            await this.Refresh();
        }
    }

    async On_Rematch_Game(
        {
        }: Event.Rematch_Game_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Main = this.Model();

            model.Rematch_Game();

            await this.Refresh();
        }
    }

    async On_Exit_Game(
        {
        }: Event.Exit_Game_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Main = this.Model();

            model.Exit_Game();

            await this.Refresh();
        }
    }

    On_Death():
        void
    {
        this.resize_observer.disconnect();
        this.current_height = 0;
        this.current_width = 0;
    }
}
