import { Integer } from "../../types";
import { Index } from "../../types";
import { Float } from "../../types";

import { Plot_Bezier_Curve_4 } from "../../utils";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Component_Animation_Frame } from "../component";

import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Player } from "../player";
import { Stake } from "./stake";

type Hand_Props = {
    model: Model.Player.Instance;
    parent: Player;
    event_grid: Event.Grid;
}

export class Hand extends Component<Hand_Props>
{
    private stakes: Array<Stake | null> =
        new Array(this.Model().Stake_Count()).fill(null);

    Arena():
        Arena
    {
        return this.Player().Arena();
    }

    Player():
        Player
    {
        return this.Parent();
    }

    Stake(stake_index: Model.Stake.Index):
        Stake
    {
        return this.Try_Array_Index(this.stakes, stake_index);
    }

    Stakes():
        Array<Stake>
    {
        return this.Try_Array(this.stakes);
    }

    Index():
        Model.Player.Index
    {
        return this.Model().Index();
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Player_Hand_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Player_Hand_Height();
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
        const stake_count: Model.Stake.Count = this.Model().Stake_Count();

        return (
            <div
                className={`Hand`}
            >
                {
                    Array(stake_count).fill(null).map((_, stake_index: Model.Stake.Index) =>
                    {
                        return (
                            <Stake
                                key={`stake_${stake_index}`}
                                ref={ref => this.stakes[stake_index] = ref}

                                model={this.Model().Stake(stake_index)}
                                parent={this}
                                event_grid={this.Event_Grid()}
                                index={stake_index}
                            />
                        );
                    })
                }
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const measurements: Game_Measurements = this.Measurements();

        let overflow_x: string;
        let overflow_y: string;
        if (measurements.Is_Vertical()) {
            overflow_x = `auto`;
            overflow_y = `hidden`;
        } else {
            overflow_x = `hidden`;
            overflow_y = `auto`;
        }

        return ({
            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `relative`,
            zIndex: `0`,

            overflowX: overflow_x,
            overflowY: overflow_y,

            scrollbarWidth: `none`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        const player_index: Model.Player.Index = this.Model().Index();

        return ([
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_SELECT_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Select_Stake,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_PLACE_STAKE, player_index.toString()),
                event_handler: this.On_This_Player_Place_Stake,
            },
        ]);
    }

    async On_This_Player_Select_Stake(
        {
            stake_index,
        }: Event.Player_Select_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Scroll_To_Stake({
                stake_index: stake_index,
                duration: this.Main().Animation_Duration(100),
            });
        }
    }

    async On_This_Player_Place_Stake(
        {
        }: Event.Player_Place_Stake_Data
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }

    private async Scroll_To_Stake(
        {
            stake_index,
            duration,
        }: {
            stake_index: Model.Stake.Index,
            duration: Integer,
        },
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const from_scroll_ratio = this.Measurements().Is_Vertical() ?
                this.Some_Element().scrollLeft / this.Max_Scroll_Left() :
                this.Some_Element().scrollTop / this.Max_Scroll_Top();

            if (duration > 0) {
                await this.Animate_By_Frame(
                    On_Frame.bind(this),
                    {
                        stake_index: stake_index,
                        // We store this as a ratio so that if a resize occurs
                        // or the view mode shifts from vertical to horizontal
                        // that we can complete the animation faithfully
                        from_scroll_ratio: from_scroll_ratio,
                        duration: duration,
                        plot: Plot_Bezier_Curve_4(
                            Math.min(1.0 / (duration / 15), 1.0),
                            1.0,
                            0.0, 0.0,
                            0.42, 0.0,
                            0.58, 1.0,
                            1.0, 1.0,
                        ),
                    },
                );
            } else {
                const hand: Hand = this;
                const stake: Stake = hand.Stake(stake_index);
                const hand_element: HTMLElement = hand.Some_Element();
                if (hand.Measurements().Is_Vertical()) {
                    const max_scroll_left: Float = hand.Max_Scroll_Left();
                    const from_scroll_left: Float = max_scroll_left * from_scroll_ratio;
                    const hand_width: Float = hand.Width();
                    const stake_width: Float = stake.Width();
                    const hand_x1: Float = from_scroll_left;
                    const hand_x2: Float = hand_x1 + hand_width;
                    const stake_x1: Float = stake.X_Offset();
                    const stake_x2: Float = stake_x1 + stake_width;
                    const stake_x_offset_multiplier: Float = Stake.X_Offset_Multiplier();
                    const stake_x_offset: Float = stake_x_offset_multiplier < 0.5 ?
                        stake_width * stake_x_offset_multiplier :
                        stake_width - stake_width * stake_x_offset_multiplier;

                    if (stake_x1 - stake_x_offset < hand_x1) {
                        hand_element.scrollLeft =
                            from_scroll_left + (stake_x1 - stake_x_offset - hand_x1);
                    } else if (stake_x2 > hand_x2) {
                        hand_element.scrollLeft =
                            from_scroll_left + (stake_x2 - hand_x2);
                    }
                } else {
                    const max_scroll_top: Float = hand.Max_Scroll_Top();
                    const from_scroll_top: Float = max_scroll_top * from_scroll_ratio;
                    const hand_height: Float = hand.Height();
                    const stake_height: Float = stake.Height();
                    const hand_y1: Float = from_scroll_top;
                    const hand_y2: Float = hand_y1 + hand_height;
                    const stake_y1: Float = stake.Y_Offset();
                    const stake_y2: Float = stake_y1 + stake_height;
                    const stake_y_offset_multiplier: Float = Stake.Y_Offset_Multiplier();
                    const stake_y_offset: Float = stake_y_offset_multiplier < 0.5 ?
                        stake_height * stake_y_offset_multiplier :
                        stake_height - stake_height * stake_y_offset_multiplier;

                    if (stake_y1 - stake_y_offset < hand_y1) {
                        hand_element.scrollTop =
                            from_scroll_top + (stake_y1 - stake_y_offset - hand_y1);
                    } else if (stake_y2 > hand_y2) {
                        hand_element.scrollTop =
                            from_scroll_top + (stake_y2 - hand_y2);
                    }
                }
            }

            function On_Frame(
                this: Hand,
                {
                    elapsed,
                }: Component_Animation_Frame,
                state: {
                    stake_index: Model.Stake.Index,
                    from_scroll_ratio: Float,
                    duration: Integer,
                    plot: Array<{
                        x: Float,
                        y: Float,
                    }>,
                },
            ):
                boolean
            {
                const hand: Hand = this;
                const stake: Stake = hand.Stake(state.stake_index);
                const hand_element: HTMLElement = hand.Some_Element();
                if (hand.Measurements().Is_Vertical()) {
                    const max_scroll_left: Float = hand.Max_Scroll_Left();
                    const from_scroll_left: Float = max_scroll_left * state.from_scroll_ratio;
                    const hand_width: Float = hand.Width();
                    const stake_width: Float = stake.Width();
                    const hand_x1: Float = from_scroll_left;
                    const hand_x2: Float = hand_x1 + hand_width;
                    const stake_x1: Float = stake.X_Offset();
                    const stake_x2: Float = stake_x1 + stake_width;
                    const stake_x_offset_multiplier: Float = Stake.X_Offset_Multiplier();
                    const stake_x_offset: Float = stake_x_offset_multiplier < 0.5 ?
                        stake_width * stake_x_offset_multiplier :
                        stake_width - stake_width * stake_x_offset_multiplier;

                    if (elapsed >= state.duration) {
                        if (stake_x1 - stake_x_offset < hand_x1) {
                            hand_element.scrollLeft =
                                from_scroll_left + (stake_x1 - stake_x_offset - hand_x1);
                        } else if (stake_x2 > hand_x2) {
                            hand_element.scrollLeft =
                                from_scroll_left + (stake_x2 - hand_x2);
                        }

                        return false;
                    } else {
                        const index: Index =
                            Math.floor(elapsed * state.plot.length / state.duration);

                        if (stake_x1 - stake_x_offset < hand_x1) {
                            const start_scroll_left: Float =
                                from_scroll_left;
                            const end_scroll_left: Float =
                                from_scroll_left + (stake_x1 - stake_x_offset - hand_x1);
                            hand_element.scrollLeft =
                                start_scroll_left -
                                (start_scroll_left - end_scroll_left) *
                                state.plot[index].y;
                        } else if (stake_x2 > hand_x2) {
                            const start_scroll_left: Float =
                                from_scroll_left;
                            const end_scroll_left: Float =
                                from_scroll_left + (stake_x2 - hand_x2);
                            hand_element.scrollLeft =
                                start_scroll_left +
                                (end_scroll_left - start_scroll_left) *
                                state.plot[index].y;
                        }

                        return true;
                    }
                } else {
                    const max_scroll_top: Float = hand.Max_Scroll_Top();
                    const from_scroll_top: Float = max_scroll_top * state.from_scroll_ratio;
                    const hand_height: Float = hand.Height();
                    const stake_height: Float = stake.Height();
                    const hand_y1: Float = from_scroll_top;
                    const hand_y2: Float = hand_y1 + hand_height;
                    const stake_y1: Float = stake.Y_Offset();
                    const stake_y2: Float = stake_y1 + stake_height;
                    const stake_y_offset_multiplier: Float = Stake.Y_Offset_Multiplier();
                    const stake_y_offset: Float = stake_y_offset_multiplier < 0.5 ?
                        stake_height * stake_y_offset_multiplier :
                        stake_height - stake_height * stake_y_offset_multiplier;

                    if (elapsed >= state.duration) {
                        if (stake_y1 - stake_y_offset < hand_y1) {
                            hand_element.scrollTop =
                                from_scroll_top + (stake_y1 - stake_y_offset - hand_y1);
                        } else if (stake_y2 > hand_y2) {
                            hand_element.scrollTop =
                                from_scroll_top + (stake_y2 - hand_y2);
                        }

                        return false;
                    } else {
                        const index: Index =
                            Math.floor(elapsed * state.plot.length / state.duration);

                        if (stake_y1 - stake_y_offset < hand_y1) {
                            const start_scroll_top: Float =
                                from_scroll_top;
                            const end_scroll_top: Float =
                                from_scroll_top + (stake_y1 - stake_y_offset - hand_y1);
                            hand_element.scrollTop =
                                start_scroll_top -
                                (start_scroll_top - end_scroll_top) *
                                state.plot[index].y;
                        } else if (stake_y2 > hand_y2) {
                            const start_scroll_top: Float =
                                from_scroll_top;
                            const end_scroll_top: Float =
                                from_scroll_top + (stake_y2 - hand_y2);
                            hand_element.scrollTop =
                                start_scroll_top +
                                (end_scroll_top - start_scroll_top) *
                                state.plot[index].y;
                        }

                        return true;
                    }
                }
            }
        }
    }
}
