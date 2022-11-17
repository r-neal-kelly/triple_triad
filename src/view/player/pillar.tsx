import { Integer } from "../../types";
import { Index } from "../../types";
import { Float } from "../../types";

import { Assert } from "../../utils";
import { Plot_Bezier_Curve_4 } from "../../utils";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Component_Animation_Frame } from "../component";

import { Main } from "../main";
import { Game } from "../game";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Group } from "../player/group";
import { Player } from "../player";

type Pillar_Props = {
    model: Model.Player.Instance;
    parent: Player;
    event_grid: Event.Grid;
}

export class Pillar extends Component<Pillar_Props>
{
    static Alpha_Highlight_Multiplier():
        Float
    {
        return 0.7;
    }

    Main():
        Main
    {
        return this.Game().Main();
    }

    Game():
        Game
    {
        return this.Arena().Game();
    }

    Arena():
        Arena
    {
        return this.Group().Arena();
    }

    Group():
        Group
    {
        return this.Player().Group();
    }

    Player():
        Player
    {
        return this.Parent();
    }

    Index():
        Model.Player.Index
    {
        return this.Player().Index();
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Player_Pillar_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Player_Pillar_Height();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Pillar`}
            >
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const model: Model.Player.Instance = this.Model();
        const color: Model.Color.HSLA = this.Model().Color();

        let background_color: string;
        if (model.Is_On_Turn()) {
            background_color = `hsl(
                ${color.Hue()},
                ${color.Saturation()}%,
                ${color.Lightness()}%,
                ${color.Alpha() * Player.Alpha_Highlight_Multiplier()}
            )`;
        } else {
            background_color = `transparent`;
        }

        return ({
            width: `${this.Width()}px`,
            height: `${this.Height()}px`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `-1`,

            backgroundColor: background_color,
            backgroundImage: ``,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        const player_index: Model.Player.Index = this.Index();

        return ([
            {
                event_name: new Event.Name(Event.ON, Event.GAME_START),
                event_handler: this.On_Game_Start,
            },
            {
                event_name: new Event.Name(Event.BEFORE, Event.PLAYER_START_TURN, player_index.toString()),
                event_handler: this.Before_This_Player_Start_Turn,
            },
            {
                event_name: new Event.Name(Event.AFTER, Event.PLAYER_START_TURN),
                event_handler: this.After_Player_Start_Turn,
            },
            {
                event_name: new Event.Name(Event.BEFORE, Event.PLAYER_STOP_TURN, player_index.toString()),
                event_handler: this.Before_This_Player_Stop_Turn,
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
            const model: Model.Player.Instance = this.Model();
            if (model.Is_On_Turn()) {
                this.Change_Style(`opacity`, `0%`);
            }
        }
    }

    async Before_This_Player_Start_Turn(
        {
        }: Event.Player_Start_Turn_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Player.Instance = this.Model();
            if (model.Arena().Is_On_First_Turn()) {
                await this.Animate_Fade_In({
                    duration: 750,
                    easing: `ease-in-out`,
                });
            }
        }
    }

    async After_Player_Start_Turn(
        {
        }: Event.Player_Start_Turn_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            // Because all player groups have the same z-index,
            // we in Before_This_Player_Stop_Turn, we set it lower.
            // but if we unset it at the end of that event, flickering
            // will occur. So we unset it whenever a player is starting
            // a turn. We have to call this whenever any player starts.
            this.Group().Some_Element().style.zIndex = `1`;
        }
    }

    async Before_This_Player_Stop_Turn(
        {
        }: Event.Player_Stop_Turn_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Player.Instance = this.Model();
            const next_player_index: Model.Player.Index | null =
                model.Arena().Next_Player_Index();
            if (next_player_index != null) {
                await this.Move_To_Player({
                    player_index: next_player_index as Model.Player.Index,
                    duration: 750,
                });
            } else {
                await this.Animate_Fade_Out({
                    duration: 750,
                    easing: `ease-in-out`,
                });
            }
        }
    }

    private async Move_To_Player(
        {
            player_index,
            duration,
        }: {
            player_index: Model.Player.Index,
            duration: Integer,
        },
    ):
        Promise<void>
    {
        Assert(duration > 0);

        if (this.Is_Alive()) {
            const old_player: Player = this.Player();
            const new_player: Player = this.Arena().Player(player_index);
            const old_player_element: HTMLElement = old_player.Some_Element();
            const new_player_element: HTMLElement = new_player.Some_Element();
            const pillar_element: HTMLElement = this.Some_Element();
            const old_player_color: Model.Color.HSLA = old_player.Model().Color();
            const new_player_color: Model.Color.HSLA = new_player.Model().Color();

            {
                const pillar_rect: DOMRect = pillar_element.getBoundingClientRect();
                pillar_element.style.position = `fixed`;
                pillar_element.style.left = `${pillar_rect.left}px`;
                pillar_element.style.top = `${pillar_rect.top}px`;
            }

            const current_direction: Model.Enum.Direction = Direction.bind(this)();
            Set_Background.bind(this)(current_direction);

            const group_element: HTMLElement = this.Group().Some_Element();
            group_element.style.zIndex = `-1`;
            await this.Animate_By_Frame(
                On_Frame.bind(this),
                {
                    direction: current_direction,
                    duration: duration,
                    plot: Plot_Bezier_Curve_4(
                        1.0 / (duration / 15),
                        1.0,
                        0.0, 0.0,
                        0.42, 0.0,
                        0.58, 1.0,
                        1.0, 1.0,
                    ),
                },
            );
            // See After_Player_Start_Turn for why we don't do this here
            //group_element.style.zIndex = `1`;

            function Direction(
                this: Pillar,
            ):
                Model.Enum.Direction
            {
                return (
                    old_player.Index() < new_player.Index() ?
                        this.Measurements().Is_Vertical() ?
                            Model.Enum.Direction.TOP :
                            Model.Enum.Direction.LEFT :
                        this.Measurements().Is_Vertical() ?
                            Model.Enum.Direction.BOTTOM :
                            Model.Enum.Direction.RIGHT
                );
            }

            function Set_Background(
                current_direction: Model.Enum.Direction,
            ):
                void
            {
                const old_background_color: string = `hsl(
                    ${old_player_color.Hue()},
                    ${old_player_color.Saturation()}%,
                    ${old_player_color.Lightness()}%,
                    ${old_player_color.Alpha() * Player.Alpha_Highlight_Multiplier()}
                )`;

                const new_background_color: string = `hsl(
                    ${new_player_color.Hue()},
                    ${new_player_color.Saturation()}%,
                    ${new_player_color.Lightness()}%,
                    ${new_player_color.Alpha() * Player.Alpha_Highlight_Multiplier()}
                )`;

                pillar_element.style.backgroundColor = ``;

                if (current_direction === Model.Enum.Direction.LEFT) {
                    pillar_element.style.backgroundPosition = `100% 0%`;
                    pillar_element.style.backgroundSize = `1000% 100%`;
                    pillar_element.style.backgroundImage = `linear-gradient(
                        to right,
                        ${new_background_color},
                        ${old_background_color}
                    )`;
                } else if (current_direction === Model.Enum.Direction.TOP) {
                    pillar_element.style.backgroundPosition = `0% 100%`;
                    pillar_element.style.backgroundSize = `100% 1000%`;
                    pillar_element.style.backgroundImage = `linear-gradient(
                        to bottom,
                        ${new_background_color},
                        ${old_background_color}
                    )`;
                } else if (current_direction === Model.Enum.Direction.RIGHT) {
                    pillar_element.style.backgroundPosition = `0% 0%`;
                    pillar_element.style.backgroundSize = `1000% 100%`;
                    pillar_element.style.backgroundImage = `linear-gradient(
                        to right,
                        ${old_background_color},
                        ${new_background_color}
                    )`;
                } else {
                    pillar_element.style.backgroundPosition = `0% 0%`;
                    pillar_element.style.backgroundSize = `100% 1000%`;
                    pillar_element.style.backgroundImage = `linear-gradient(
                        to bottom,
                        ${old_background_color},
                        ${new_background_color}
                    )`;
                }
            }

            function On_Frame(
                this: Pillar,
                {
                    elapsed,
                }: Component_Animation_Frame,
                state: {
                    direction: Model.Enum.Direction,
                    duration: Integer,
                    plot: Array<{
                        x: Float,
                        y: Float,
                    }>,
                },
            ):
                boolean
            {
                const current_direction: Model.Enum.Direction = Direction.bind(this)();
                if (state.direction !== current_direction) {
                    state.direction = current_direction;
                    Set_Background.bind(this)(current_direction);
                }

                const old_player_rect: DOMRect =
                    old_player_element.getBoundingClientRect();
                const new_player_rect: DOMRect =
                    new_player_element.getBoundingClientRect();

                if (elapsed >= state.duration) {
                    pillar_element.style.left = `${new_player_rect.left}px`;
                    pillar_element.style.top = `${new_player_rect.top}px`;

                    if (current_direction === Model.Enum.Direction.LEFT) {
                        pillar_element.style.backgroundPosition = `0% 0%`;
                    } else if (current_direction === Model.Enum.Direction.TOP) {
                        pillar_element.style.backgroundPosition = `0% 0%`;
                    } else if (current_direction === Model.Enum.Direction.RIGHT) {
                        pillar_element.style.backgroundPosition = `100% 0%`;
                    } else {
                        pillar_element.style.backgroundPosition = `0% 100%`;
                    }

                    return false;
                } else {
                    const index: Index =
                        Math.floor(elapsed * state.plot.length / state.duration);

                    const left_distance: Float =
                        new_player_rect.left - old_player_rect.left;
                    const top_distance: Float =
                        new_player_rect.top - old_player_rect.top;
                    pillar_element.style.left =
                        `${old_player_rect.left + (left_distance * state.plot[index].y)}px`;
                    pillar_element.style.top =
                        `${old_player_rect.top + (top_distance * state.plot[index].y)}px`;

                    const percent: Float =
                        100 * state.plot[index].y;
                    if (current_direction === Model.Enum.Direction.LEFT) {
                        pillar_element.style.backgroundPosition = `${100 - percent}% 0%`;
                    } else if (current_direction === Model.Enum.Direction.TOP) {
                        pillar_element.style.backgroundPosition = `0% ${100 - percent}%`;
                    } else if (current_direction === Model.Enum.Direction.RIGHT) {
                        pillar_element.style.backgroundPosition = `${percent}% 0%`;
                    } else {
                        pillar_element.style.backgroundPosition = `0% ${percent}%`;
                    }

                    return true;
                }
            }
        }
    }
}
