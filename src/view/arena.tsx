import { Float } from "../types";
import { URL_Path } from "../types";

import { Assert } from "../utils";

import * as Model from "../model"

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Game } from "./game";
import { Game_Measurements } from "./game";
import { Group as Player_Group } from "./player/group";
import { Board } from "../view";

class Arena_Card_Images
{
    private images: Array<URL_Path>;
    private elements: Array<HTMLImageElement>;

    constructor(
        model: Model.Arena,
    )
    {
        this.images = model.Card_Images();
        this.elements = [];

        Object.freeze(this.images);
        Object.freeze(this);
    }

    async Load():
        Promise<void>
    {
        Assert(
            this.elements.length === 0,
            `The images have already been loaded.`,
        );

        await Promise.all(this.images.map(async function (
            this: Arena_Card_Images,
            image: URL_Path,
        ):
            Promise<void>
        {
            const element = new Image();
            this.elements.push(element);

            await new Promise<void>(function (
                resolve: () => void,
                reject: () => void,
            ):
                void
            {
                element.onload = resolve;
                element.onerror = reject;
                element.src = image;
            });
        }, this));

        Object.freeze(this.elements);
    }
}

type Arena_Props = {
    model: Model.Arena;
    parent: Game;
    event_grid: Event.Grid;
}

export class Arena extends Component<Arena_Props>
{
    private player_groups: Array<Player_Group | null> =
        new Array(Game.Player_Group_Count()).fill(null);
    private board: Board | null =
        null;

    private card_images: Arena_Card_Images =
        new Arena_Card_Images(this.Model());

    Game():
        Game
    {
        return this.Parent();
    }

    Player_Group(player_group_index: Model.Player_Group_Index):
        Player_Group
    {
        return this.Try_Array_Index(this.player_groups, player_group_index);
    }

    Player_Groups():
        Array<Player_Group>
    {
        return this.Try_Array(this.player_groups);
    }

    Board():
        Board
    {
        return this.Try_Object(this.board);
    }

    Is_Exhibition():
        boolean
    {
        return this.Game().Is_Exhibition();
    }

    Measurements():
        Game_Measurements
    {
        return this.Game().Measurements();
    }

    Card_Images():
        Arena_Card_Images
    {
        return this.card_images;
    }

    Width():
        Float
    {
        return this.Measurements().Arena_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Arena_Height();
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

    Refresh_Styles():
        void
    {
        this.Change_Style(`width`, this.CSS_Width());
        this.Change_Style(`height`, this.CSS_Height());

        if (this.Measurements().Has_X_Scrollbar()) {
            this.Change_Style(`overflowX`, `scroll`);
            this.Change_Style(`justifyContent`, `start`);
        } else {
            this.Change_Style(`overflowX`, `hidden`);
            this.Change_Style(`justifyContent`, `center`);
        }
    }

    Before_Life():
        Component_Styles
    {
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

        return ({
            display: `flex`,
            flexDirection: `row`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            overflowY: `hidden`,

            visibility: `hidden`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Arena = this.Model();
        const player_groups: Array<Model.Player_Group> =
            model.Player_Groups(Game.Player_Group_Count(), Game.Player_Group_Direction());
        Assert(Game.Player_Group_Count() === 2);

        this.Refresh_Styles();

        return (
            <div
                className={`Arena`}
                style={this.Styles()}
            >
                <Player_Group
                    ref={ref => this.player_groups[0] = ref}

                    model={player_groups[0]}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Board
                    ref={ref => this.board = ref}

                    model={model.Board()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Player_Group
                    ref={ref => this.player_groups[1] = ref}

                    model={player_groups[1]}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    On_Life():
        Event.Listener_Info[]
    {
        (async function (
            this: Arena,
        ):
            Promise<void>
        {
            await this.card_images.Load();
            if (this.Is_Alive()) {
                this.Send({
                    name_affix: Event.GAME_START,
                    name_suffixes: [
                    ],
                    data: {
                    } as Event.Game_Start_Data,
                    is_atomic: true,
                });
            }
        }).bind(this)();

        return ([
            {
                event_name: new Event.Name(Event.ON, `${Event.RESIZE}_${this.Parent().ID()}`),
                event_handler: this.On_Resize,
            },
            {
                event_name: new Event.Name(Event.ON, Event.GAME_START),
                event_handler: this.On_Game_Start,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_STOP_TURN),
                event_handler: this.On_Player_Stop_Turn,
            },
        ]);
    }

    On_Resize(
        {
        }: Event.Resize_Data,
    ):
        void
    {
        if (this.Is_Alive()) {
            this.Refresh_Styles();

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

    async On_Game_Start(
        {
        }: Event.Game_Start_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();

            this.Change_Style(`visibility`, `visible`);
            await this.Animate({
                animation_name: `Fade_In`,
                duration_in_milliseconds: 1000,
                css_iteration_count: `1`,
                css_timing_function: `ease-in-out`,
                css_fill_mode: `forward`,
            });

            if (this.Is_Alive()) {
                this.Send({
                    name_affix: Event.PLAYER_START_TURN,
                    name_suffixes: [
                        current_player_index.toString(),
                    ],
                    data: {
                        player_index: current_player_index,
                    } as Event.Player_Start_Turn_Data,
                    is_atomic: true,
                });
            }
        }
    }

    async On_Player_Stop_Turn(
        {
        }: Event.Player_Stop_Turn_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Next_Turn();

            if (this.Model().Is_Game_Over()) {
                const scores: Model.Scores = this.Model().Final_Scores();

                this.Send({
                    name_affix: Event.GAME_STOP,
                    name_suffixes: [
                    ],
                    data: {
                        scores,
                    } as Event.Game_Stop_Data,
                    is_atomic: true,
                });
            } else {
                const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();

                this.Send({
                    name_affix: Event.PLAYER_START_TURN,
                    name_suffixes: [
                        current_player_index.toString(),
                    ],
                    data: {
                        player_index: current_player_index,
                    } as Event.Player_Start_Turn_Data,
                    is_atomic: true,
                });
            }
        }
    }
}
