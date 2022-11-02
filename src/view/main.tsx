import { Float } from "../types";

import { Assert } from "../utils";
import { Wait } from "../utils";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Menu } from "./menu"
import { Exhibitions } from "./exhibitions";
import { Game } from "./game";

type Main_Props = {
    root: HTMLElement;
    model: Model.Main;
    parent: null;
    event_grid: Event.Grid;
}

export class Main extends Component<Main_Props>
{
    private menu: Menu | null = null;
    private exhibitions: Exhibitions | null = null;
    private game: Game | null = null;

    private current_width: Float;
    private current_height: Float;
    private resize_observer: ResizeObserver;

    constructor(props: Main_Props)
    {
        super(props);

        const rect: DOMRect = this.Root().getBoundingClientRect();
        this.current_width = rect.width;
        this.current_height = rect.height;
        this.resize_observer = new ResizeObserver((this.On_Resize.bind(this)));
    }

    Root():
        HTMLElement
    {
        return this.Try_Object(this.props.root);
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

    Game():
        Game
    {
        return this.Try_Object(this.game);
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

    override On_Refresh():
        JSX.Element | null
    {
        // we create an exhibition match between computers for the background of main
        // and keep doing rematches until the player decides to start up a game of their own

        const model: Model.Main = this.Model();

        if (model.Isnt_In_Game()) {
            return (
                <div
                    className={`Main`}
                >
                    <Menu
                        ref={ref => this.menu = ref}

                        model={model.Menu()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                    <Exhibitions
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
                >
                    <Game
                        key={`game_${arena.ID()}`}
                        ref={ref => this.game = ref}

                        model={arena}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        }
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `relative`,

            overflowX: `hidden`,

            fontSize: `2.8vmin`,
        });
    }

    override On_Life():
        Event.Listener_Info[]
    {
        const model: Model.Main = this.Model();

        this.resize_observer.observe(this.Root());

        this.Change_Animation({
            animation_name: `Fade_In`,
            animation_body: `
                0% {
                    opacity: 0%;
                }
            
                100% {
                    opacity: 100%;
                }
            `,
        });

        this.Send({
            name_affix: Event.START_EXHIBITIONS,
            name_suffixes: [
            ],
            data: {
                exhibition: model.Current_Exhibition(),
            } as Event.Start_Exhibitions_Data,
            is_atomic: true,
        });

        this.Animate({
            animation_name: `Fade_In`,
            duration_in_milliseconds: 5000,
            css_iteration_count: `1`,
            css_timing_function: `ease-in-out`,
            css_fill_mode: `forward`,
        });

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

    override On_Resize():
        void
    {
        if (this.Is_Alive()) {
            const rect: DOMRect = this.Root().getBoundingClientRect();
            if (this.current_width !== rect.width || this.current_height !== rect.height) {
                this.current_width = rect.width;
                this.current_height = rect.height;

                // Our event system is way faster than react's
                // so we avoid a full refresh
                this.Restyle();

                this.Send({
                    name_affix: `${Event.RESIZE}_${this.ID()}`,
                    data: {
                        width: this.Width(),
                        height: this.Height(),
                    } as Event.Resize_Data,
                    is_atomic: false,
                });
            }
        }
    }

    override On_Death():
        void
    {
        this.resize_observer.disconnect();
        this.current_height = 0;
        this.current_width = 0;
    }

    async While_Alive():
        Promise<void>
    {
        while (true) {
            await Wait(5000);
            if (this.Is_Alive()) {
                const model: Model.Main = this.Model();

                if (model.Isnt_In_Game()) {
                    const previous_exhibition: Model.Exhibition =
                        model.Current_Exhibition() as Model.Exhibition;
                    this.Model().Change_Current_Exhibition();
                    const next_exhibition: Model.Exhibition =
                        model.Current_Exhibition() as Model.Exhibition;
                    Assert(previous_exhibition != null);
                    Assert(next_exhibition != null);

                    await this.Send({
                        name_affix: Event.SWITCH_EXHIBITIONS,
                        name_suffixes: [
                        ],
                        data: {
                            previous_exhibition,
                            next_exhibition,
                        } as Event.Switch_Exhibitions_Data,
                        is_atomic: true,
                    });
                }
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

            await this.Send({
                name_affix: Event.DISABLE_MENUS,
                name_suffixes: [
                ],
                data: {
                } as Event.Disable_Menus_Data,
                is_atomic: true,
            });
            if (this.Is_Alive()) {
                await this.Send({
                    name_affix: Event.STOP_EXHIBITIONS,
                    name_suffixes: [
                    ],
                    data: {
                    } as Event.Stop_Exhibitions_Data,
                    is_atomic: true,
                });
                if (this.Is_Alive()) {
                    await this.Send({
                        name_affix: Event.CLOSE_MENUS,
                        name_suffixes: [
                        ],
                        data: {
                        } as Event.Close_Menus_Data,
                        is_atomic: true,
                    });
                    if (this.Is_Alive()) {
                        await this.Refresh();
                    }
                }
            }
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

            if (this.Is_Alive()) {
                const exhibition: Model.Exhibition =
                    model.Current_Exhibition() as Model.Exhibition;
                Assert(exhibition != null);

                await this.Send({
                    name_affix: Event.START_EXHIBITIONS,
                    name_suffixes: [
                    ],
                    data: {
                        exhibition: model.Current_Exhibition(),
                    } as Event.Start_Exhibitions_Data,
                    is_atomic: true,
                });
            }
        }
    }
}
