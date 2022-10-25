import { Integer, Wait } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component, Component_Styles } from "./component";
import { Menu } from "./menu"
import { Exhibitions, Arena } from "../view";

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

    private current_width: Integer = this.Parent().clientWidth;
    private current_height: Integer = this.Parent().clientHeight;
    private resize_observer: ResizeObserver = new ResizeObserver(this.On_Resize.bind(this));

    Menu():
        Menu
    {
        if (this.menu == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.menu;
        }
    }

    Exhibitions():
        Exhibitions
    {
        if (this.exhibitions == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.exhibitions;
        }
    }

    Arena():
        Arena
    {
        if (this.arena == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.arena;
        }
    }

    Width():
        Integer
    {
        return this.current_width;
    }

    Height():
        Integer
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
            width: `100%`,
            height: `100%`,

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
                        key={`arena`}
                        ref={ref => this.arena = ref}

                        model={arena}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        }
    }

    async On_Resize():
        Promise<void>
    {
        const element: HTMLElement = this.Some_Element();
        const width: Integer = element.clientWidth;
        const height: Integer = element.clientHeight;
        if (this.current_width !== width || this.current_height !== height) {
            this.current_width = width;
            this.current_height = height;
            this.Refresh();
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        this.resize_observer.observe(this.Some_Element());

        this.While_Alive();

        return [
            {
                event_name: new Event.Name(Event.ON, Event.START_NEW_GAME),
                event_handler: this.On_Start_New_Game,
            },
            {
                event_name: new Event.Name(Event.ON, Event.EXIT_GAME),
                event_handler: this.On_Exit_Game,
            },
        ];
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

    async On_Start_New_Game():
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Main = this.Model();
            const packs: Model.Packs = model.Packs();
            const rules: Model.Rules = model.Menu().Options().Data().Rules();

            model.New_Game([
                new Model.Random_Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: packs.Pack(`Cats`),
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
                    card_count: rules.Selection_Card_Count(),
                }),
                new Model.Random_Selection({
                    collection: new Model.Collection({
                        default_shuffle: new Model.Shuffle({
                            pack: packs.Pack(`Cats`),
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
                    card_count: rules.Selection_Card_Count(),
                }),
            ]);

            await this.Refresh();
        }
    }

    async On_Exit_Game():
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
