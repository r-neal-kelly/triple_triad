import { Float } from "../types";
import { URL_Path } from "../types";

import { Assert } from "../utils";
import { Wait } from "../utils";

import * as Model from "../model"

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";

import { Game } from "./game";
import { Game_Measurements } from "./game";
import { Group as Player_Group } from "./player/group";
import { Player } from "./player";
import { Board } from "./board";

class Arena_Card_Images
{
    private images: Array<URL_Path>;
    private elements: Array<HTMLImageElement>;

    constructor(
        model: Model.Arena.Instance,
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
        if (this.elements.length === 0) {
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
}

type Arena_Props = {
    model: Model.Arena.Instance;
    parent: Game;
    event_grid: Event.Grid;
}

export class Arena extends Component<Arena_Props>
{
    static Scroll_Player_Name_Wait():
        Float
    {
        return 5000;
    }

    static Scroll_Player_Name_Duration():
        Float
    {
        return 2000;
    }

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

    Player_Group(player_group_index: Model.Player.Group.Index):
        Player_Group
    {
        return this.Try_Array_Index(this.player_groups, player_group_index);
    }

    Player_Groups():
        Array<Player_Group>
    {
        return this.Try_Array(this.player_groups);
    }

    Player(player_index: Model.Player.Index):
        Player
    {
        // I don't like how we're doing this, but our model doesn't
        // actually represent players in groups, this is purely in the view atm.
        let current_first_index: Model.Player.Index = 0;
        const player_groups: Array<Player_Group> = this.Player_Groups();
        for (const player_group of player_groups) {
            if (
                player_index >= current_first_index &&
                player_index < current_first_index + player_group.Player_Count()
            ) {
                return player_group.Player(player_index - current_first_index);
            } else {
                current_first_index += player_group.Player_Count();
            }
        }

        throw new Error(`Invalid player_index.`);
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

    Is_Visible():
        boolean
    {
        return this.Game().Is_Visible();
    }

    Card_Images():
        Arena_Card_Images
    {
        return this.card_images;
    }

    Measurements():
        Game_Measurements
    {
        return this.Game().Measurements();
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

    override On_Refresh():
        JSX.Element | null
    {
        const game: Game = this.Game();
        const model: Model.Arena.Instance = this.Model();
        const player_groups: Array<Model.Player.Group.Instance> =
            model.Player_Groups(Game.Player_Group_Count(), game.Player_Group_Direction());
        Assert(Game.Player_Group_Count() === 2);

        return (
            <div
                className={`Arena`}
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

    override On_Restyle():
        Component_Styles
    {
        const measurements: Game_Measurements = this.Measurements();

        let flex_direction: string;
        let justify_content: string;
        let overflow_x: string;
        let overflow_y: string;
        if (measurements.Is_Vertical()) {
            flex_direction = `column`;
            if (this.Measurements().Has_Y_Scrollbar()) {
                justify_content = `start`;
                overflow_y = `scroll`;
            } else {
                justify_content = `center`;
                overflow_y = `hidden`;
            }
            overflow_x = `hidden`;
        } else {
            flex_direction = `row`;
            if (this.Measurements().Has_X_Scrollbar()) {
                justify_content = `start`;
                overflow_x = `scroll`;
            } else {
                justify_content = `center`;
                overflow_x = `hidden`;
            }
            overflow_y = `hidden`;
        }

        return ({
            display: `flex`,
            flexDirection: flex_direction,
            justifyContent: justify_content,
            alignItems: `center`,

            width: `${this.Width()}px`,
            height: `${this.Height()}px`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `0`,

            overflowX: overflow_x,
            overflowY: overflow_y,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        (async function (
            this: Arena,
        ):
            Promise<void>
        {
            this.Change_Style(`visibility`, `hidden`);
            if (this.Is_Visible()) {
                // See main's While_Alive loop for more info about this optimization
                await this.Card_Images().Load();
            }
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
            const current_player_index: Model.Player.Index = this.Model().Current_Player_Index();

            this.Change_Style(`visibility`, `visible`);
            await this.Animate(
                [
                    {
                        offset: 0.0,
                        opacity: `0%`,
                    },
                    {
                        offset: 1.0,
                        opacity: `100%`,
                    },
                ],
                {
                    duration: this.Main().Animation_Duration(1000),
                    easing: `ease-in-out`,
                },
            );

            if (this.Is_Alive()) {
                this.Start_Scrolling_Player_Names();

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
                const scores: Model.Player.Scores = this.Model().Final_Scores();

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
                const current_player_index: Model.Player.Index = this.Model().Current_Player_Index();

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

    private async Start_Scrolling_Player_Names():
        Promise<void>
    {
        let current_direction: Model.Enum.Direction = Model.Enum.Direction._NONE_;

        while (true) {
            await Wait(Arena.Scroll_Player_Name_Wait());
            if (this.Is_Alive()) {
                if (this.Measurements().Is_Vertical()) {
                    if (current_direction === Model.Enum.Direction.TOP) {
                        current_direction = Model.Enum.Direction.BOTTOM;
                    } else if (current_direction === Model.Enum.Direction.BOTTOM) {
                        current_direction = Model.Enum.Direction.TOP;
                    } else {
                        current_direction = Model.Enum.Direction.BOTTOM;
                    }
                } else {
                    if (current_direction === Model.Enum.Direction.LEFT) {
                        current_direction = Model.Enum.Direction.RIGHT;
                    } else if (current_direction === Model.Enum.Direction.RIGHT) {
                        current_direction = Model.Enum.Direction.LEFT;
                    } else {
                        current_direction = Model.Enum.Direction.RIGHT;
                    }
                }

                await this.Send({
                    name_affix: Event.SCROLL_PLAYER_NAMES,
                    name_suffixes: [
                    ],
                    data: {
                        duration: Arena.Scroll_Player_Name_Duration(),
                        direction: current_direction,
                    } as Event.Scroll_Player_Names_Data,
                    is_atomic: true,
                });
            } else {
                return;
            }
        }
    }
}
