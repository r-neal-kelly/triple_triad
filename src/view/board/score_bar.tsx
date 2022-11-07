import { Integer } from "../../types";
import { Index } from "../../types";
import { Float } from "../../types";
import { Delta } from "../../types";

import { Plot_Bezier_Curve_4 } from "../../utils";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Component_Animation_Frame } from "../component";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Board } from "../board";
import { Bumper } from "./bumper";

type Score_Bar_Props = {
    model: Model.Board.Score_Bar.Instance;
    parent: Bumper;
    event_grid: Event.Grid;
}

export class Score_Bar extends Component<Score_Bar_Props>
{
    private scores: Array<Score | null> =
        new Array(this.Model().Player_Count()).fill(null);

    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Parent().Board();
    }

    Bumper():
        Bumper
    {
        return this.Parent();
    }

    Score(score_index: Model.Player.Index):
        Score
    {
        return this.Try_Array_Index(this.scores, score_index);
    }

    Scores():
        Array<Score>
    {
        return this.Try_Array(this.scores);
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Board.Score_Bar.Instance = this.Model();

        const scores: Array<JSX.Element> = [];
        for (let idx = 0, end = model.Player_Count(); idx < end; idx += 1) {
            scores.push(<Score
                key={`score_${idx}`}
                ref={ref => this.scores[idx] = ref}

                model={model}
                parent={this}
                event_grid={this.Event_Grid()}
                index={idx}
            />);
        }

        return (
            <div
                className={`Score_Bar`}
            >
                {scores}
            </div >
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const measurements: Game_Measurements = this.Measurements();

        let flex_direction: string;
        if (measurements.Is_Vertical()) {
            flex_direction = `column`;
        } else {
            flex_direction = `row`;
        }

        return ({
            display: `flex`,
            flexDirection: flex_direction,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            border: `0.3vmin solid #00000080`,

            backgroundColor: `rgba(0, 0, 0, 0.8)`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, Event.BOARD_CHANGE_SCORE),
                event_handler: this.Board_Change_Score,
            },
        ]);
    }

    async Board_Change_Score(
        {
            player_index_to_decrement,
            player_index_to_increment,
        }: Event.Board_Change_Score_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Board.Score_Bar.Instance = this.Model();

            const decrement_from: Delta =
                model.Score_Percent(player_index_to_decrement);
            const increment_from: Delta =
                model.Score_Percent(player_index_to_increment);
            model.Modify({
                player_index_to_decrement: player_index_to_decrement,
                player_index_to_increment: player_index_to_increment,
            });
            const decrement_to: Delta =
                model.Score_Percent(player_index_to_decrement);
            const increment_to: Delta =
                model.Score_Percent(player_index_to_increment);

            await this.Modify({
                duration: 300, // this is the same time as the cell flash, we should conjoin the two
                decrement_index: player_index_to_decrement,
                decrement_from: decrement_from,
                decrement_to: decrement_to,
                increment_index: player_index_to_increment,
                increment_from: increment_from,
                increment_to: increment_to,
            });
        }
    }

    async Modify(
        {
            duration,
            decrement_index,
            decrement_from,
            decrement_to,
            increment_index,
            increment_from,
            increment_to,
        }: {
            duration: Float,
            decrement_index: Model.Player.Index,
            decrement_from: Float,
            decrement_to: Float,
            increment_index: Model.Player.Index,
            increment_from: Float,
            increment_to: Float,
        },
    ):
        Promise<void>
    {
        function On_Frame(
            this: Score_Bar,
            {
                elapsed,
            }: Component_Animation_Frame,
            state: {
                decrement_element: HTMLElement,
                increment_element: HTMLElement,
                decrement_from: Float,
                increment_from: Float,
                decrement_to: Float,
                increment_to: Float,
                decrement_delta: Delta,
                increment_delta: Delta,
                duration: Integer,
                plot: Array<{
                    x: Float,
                    y: Float,
                }>,
            },
        ):
            boolean
        {
            const measurements: Game_Measurements = this.Measurements();

            if (elapsed >= state.duration) {
                if (measurements.Is_Vertical()) {
                    state.decrement_element.style.height = `${state.decrement_to}%`;
                    state.increment_element.style.height = `${state.increment_to}%`;
                } else {
                    state.decrement_element.style.width = `${state.decrement_to}%`;
                    state.increment_element.style.width = `${state.increment_to}%`;
                }

                return false;
            } else {
                const index: Index =
                    Math.floor(elapsed * state.plot.length / state.duration);

                const decrement_percent: Float =
                    state.decrement_from + (state.plot[index].y * state.decrement_delta);
                const increment_percent: Float =
                    state.increment_from + (state.plot[index].y * state.increment_delta);
                if (measurements.Is_Vertical()) {
                    state.decrement_element.style.height = `${decrement_percent}%`;
                    state.increment_element.style.height = `${increment_percent}%`;
                } else {
                    state.decrement_element.style.width = `${decrement_percent}%`;
                    state.increment_element.style.width = `${increment_percent}%`;
                }

                return true;
            }
        }

        if (this.Is_Alive()) {
            const decrement_element: HTMLElement =
                this.Score(decrement_index).Some_Element();
            const increment_element: HTMLElement =
                this.Score(increment_index).Some_Element();
            if (duration > 0) {
                await this.Animate_By_Frame(
                    On_Frame.bind(this),
                    {
                        decrement_element: decrement_element,
                        increment_element: increment_element,
                        decrement_from: decrement_from,
                        increment_from: increment_from,
                        decrement_to: decrement_to,
                        increment_to: increment_to,
                        decrement_delta: decrement_to - decrement_from,
                        increment_delta: increment_to - increment_from,
                        duration: duration,
                        plot: Plot_Bezier_Curve_4(
                            1.0 / (duration / 15 - 1),
                            1.0,
                            0.0, 0.0,
                            0.42, 0.0,
                            0.58, 1.0,
                            1.0, 1.0,
                        ),
                    },
                );
            } else {
                const measurements: Game_Measurements = this.Measurements();
                if (measurements.Is_Vertical()) {
                    decrement_element.style.height = `${decrement_to}%`;
                    increment_element.style.height = `${increment_to}%`;
                } else {
                    decrement_element.style.width = `${decrement_to}%`;
                    increment_element.style.width = `${increment_to}%`;
                }
            }
        }
    }
}

type Score_Props = {
    model: Model.Board.Score_Bar.Instance;
    parent: Score_Bar;
    event_grid: Event.Grid;
    index: Model.Player.Index;
}

export class Score extends Component<Score_Props>
{
    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.Parent().Board();
    }

    Bumper():
        Bumper
    {
        return this.Score_Bar().Bumper();
    }

    Score_Bar():
        Score_Bar
    {
        return this.Parent();
    }

    Index():
        Model.Player.Index
    {
        return this.props.index;
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    override On_Refresh():
        JSX.Element | null
    {
        const player_index: Model.Player.Index = this.Index();

        return (
            <div
                className={`Score_${player_index}`}
            >
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const measurements: Game_Measurements = this.Measurements();
        const model: Model.Board.Score_Bar.Instance = this.Model();
        const player_index: Model.Player.Index = this.Index();
        const player_color: Model.Color.Instance =
            model.Player_Color(player_index);
        const score_percent: Float =
            model.Score_Percent(player_index);

        let width: string;
        let height: string;
        if (measurements.Is_Vertical()) {
            width = `100%`;
            height = `${score_percent}%`;
        } else {
            width = `${score_percent}%`;
            height = `100%`;
        }

        return ({
            width: width,
            height: height,

            // maybe use a multiplier for the alpha
            backgroundColor: `rgba(
                ${player_color.Red()},
                ${player_color.Green()},
                ${player_color.Blue()},
                ${player_color.Alpha()}
            )`,
        });
    }
}
