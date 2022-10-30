import { Float } from "../types";
import { URL_Path } from "../types";

import { Assert } from "../utils";
import { Percent } from "../utils";

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

    // we'll eventually cache all these values for efficiency.
    // i also want it to find if the scroll bar is visible and what size
    Width():
        Float
    {
        return this.Parent().Width();
    }

    Height():
        Float
    {
        return this.Parent().Height();
    }

    private Card_Width():
        Float
    {
        return Percent(80, this.Card_Height());
    }

    private Card_Height():
        Float
    {
        const row_count: Model.Row_Count =
            this.Model().Rules().Row_Count();

        return (
            (
                this.Board_Cells_Height() -
                (this.Board_Cells_Padding() * 2) -
                (this.Board_Cells_Grid_Gap() * (row_count - 1))
            ) /
            row_count
        );
    }

    Board_Width():
        Float
    {
        const column_count: Model.Column_Count =
            this.Model().Rules().Column_Count();

        return (
            (this.Board_Cells_Padding() * 2) +
            (this.Board_Cells_Grid_Gap() * (column_count - 1)) +
            (this.Card_Width() * column_count)
        );
    }

    Board_Height():
        Float
    {
        return this.Height();
    }

    Board_Bumper_Width():
        Float
    {
        return this.Board_Width();
    }

    Board_Bumper_Height():
        Float
    {
        return Percent(8, this.Board_Height());
    }

    Board_Cells_Width():
        Float
    {
        return this.Board_Width();
    }

    Board_Cells_Height():
        Float
    {
        return this.Board_Height() - this.Board_Bumper_Height();
    }

    Board_Cells_Padding():
        Float
    {
        return Percent(2, this.Height());
    }

    Board_Cells_Grid_Gap():
        Float
    {
        return Percent(0.5, this.Height());
    }

    Board_Cell_Width():
        Float
    {
        return this.Card_Width();
    }

    Board_Cell_Height():
        Float
    {
        return this.Card_Height();
    }

    Player_Width():
        Float
    {
        return this.Card_Width() * 1.07;
    }

    Player_Height():
        Float
    {
        return this.Height();
    }

    Player_Bumper_Width():
        Float
    {
        return this.Card_Width();
    }

    Player_Bumper_Height():
        Float
    {
        return this.Board_Bumper_Height();
    }

    Player_Hand_Width():
        Float
    {
        return this.Card_Width();
    }

    Player_Hand_Height():
        Float
    {
        return this.Board_Cells_Height();
    }

    Player_Stake_Width():
        Float
    {
        return this.Card_Width();
    }

    Player_Stake_Height():
        Float
    {
        return this.Card_Height();
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
            justifyContent: `center`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            overflowX: `hidden`, // will be `auto`
            overflowY: `hidden`,

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
                duration_in_milliseconds: 2000,
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
