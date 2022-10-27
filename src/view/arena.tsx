import { URL_Path } from "../types";

import { Assert } from "../utils";

import * as Model from "../model"

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Main } from "./main";
import { Exhibition } from "../view";
import { Player_Group } from "./player_group";
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

const PLAYER_GROUP_COUNT: Model.Player_Group_Count = 2;
const PLAYER_GROUP_DIRECTION: Model.Direction_e = Model.Direction_e.RIGHT;

type Arena_Props = {
    model: Model.Arena;
    parent: Main | Exhibition;
    event_grid: Event.Grid;
}

export class Arena extends Component<Arena_Props>
{
    private player_groups: Array<Player_Group | null> =
        new Array(PLAYER_GROUP_COUNT).fill(null);
    private board: Board | null = null;

    private card_images: Arena_Card_Images =
        new Arena_Card_Images(this.Model());

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

    Card_Images():
        Arena_Card_Images
    {
        return this.card_images;
    }

    CSS_Card_Width():
        string
    {
        return `calc(${this.CSS_Card_Height()} * 4 / 5)`
    }

    CSS_Card_Height():
        string
    {
        // I would actually like to get the width and height of the root element,
        // which should exist at all times, and just use that to derive all
        // measurements. that way we can size it depending on the actual container
        // instead of the viewport or anything else. we might even decide here
        // if we need to go by the width, when they size of the players would be
        // bigger than the root width. so we go with whichever is bigger. Or maybe
        // we can figure how to always go by width?
        const row_count: Model.Row_Count = this.Model().Rules().Row_Count();

        return `
            calc(
                (
                    ${this.CSS_Board_Cells_Height()} -
                    (${this.CSS_Board_Cells_Padding()} * 2) -
                    (${this.CSS_Board_Cells_Grid_Gap()} * ${row_count - 1})
                ) /
                ${row_count}
            )
        `;
    }

    CSS_Bumper_Height():
        string
    {
        return `8vmin`;
    }

    CSS_Player_Width():
        string
    {
        return `calc(${this.CSS_Card_Width()} * 1.07)`;
    }

    CSS_Player_Height():
        string
    {
        return `100%`;
    }

    CSS_Board_Cells_Height():
        string
    {
        return `calc(100vmin - ${this.CSS_Bumper_Height()})`;
    }

    CSS_Board_Cells_Padding():
        string
    {
        return `2vmin`;
    }

    CSS_Board_Cells_Grid_Gap():
        string
    {
        return `0.5vmin`;
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `row`,
            justifyContent: `center`,

            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            visibility: `hidden`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Arena = this.Model();
        const player_groups: Array<Model.Player_Group> =
            model.Player_Groups(PLAYER_GROUP_COUNT, PLAYER_GROUP_DIRECTION);
        Assert(PLAYER_GROUP_COUNT === 2);

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

            this.Send({
                name_affix: Event.GAME_START,
                name_suffixes: [
                ],
                data: {
                } as Event.Game_Start_Data,
                is_atomic: true,
            });
        }).bind(this)();

        return ([
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

    async On_Game_Start(
        {
        }: Event.Game_Start_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();

            this.Change_Style(`visibility`, `visible`);

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
