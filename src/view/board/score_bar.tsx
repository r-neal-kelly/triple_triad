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
        new Array(this.Model().Score_Count()).fill(null);

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

    Score(score_index: Model.Player.Score.Index):
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
        for (let idx = 0, end = model.Score_Count(); idx < end; idx += 1) {
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

            backgroundColor: `rgba(0, 0, 0, 0.3)`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, Event.GAME_STOP),
                event_handler: this.On_Game_Stop,
            },
            {
                event_name: new Event.Name(Event.ON, Event.PLAYER_START_TURN),
                event_handler: this.On_Player_Start_Turn,
            },
            {
                event_name: new Event.Name(Event.ON, Event.BOARD_CHANGE_SCORE),
                event_handler: this.Board_Change_Score,
            },
        ]);
    }

    async On_Game_Stop():
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }

    async On_Player_Start_Turn():
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
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

            const score_index_to_decrement: Model.Player.Score.Index =
                model.Player_Index_To_Score_Index(player_index_to_decrement);
            const score_index_to_increment: Model.Player.Score.Index =
                model.Player_Index_To_Score_Index(player_index_to_increment);

            const decrement_from: Delta =
                model.Score_Percent(score_index_to_decrement);
            const increment_from: Delta =
                model.Score_Percent(score_index_to_increment);
            model.Modify({
                score_index_to_decrement: score_index_to_decrement,
                score_index_to_increment: score_index_to_increment,
            });
            const decrement_to: Delta =
                model.Score_Percent(score_index_to_decrement);
            const increment_to: Delta =
                model.Score_Percent(score_index_to_increment);

            await this.Modify({
                duration: this.Main().Animation_Duration(300),
                decrement_index: score_index_to_decrement,
                decrement_from: decrement_from,
                decrement_to: decrement_to,
                increment_index: score_index_to_increment,
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
            decrement_index: Model.Player.Score.Index,
            decrement_from: Float,
            decrement_to: Float,
            increment_index: Model.Player.Score.Index,
            increment_from: Float,
            increment_to: Float,
        },
    ):
        Promise<void>
    {
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
    }
}

type Score_Props = {
    model: Model.Board.Score_Bar.Instance;
    parent: Score_Bar;
    event_grid: Event.Grid;
    index: Model.Player.Score.Index;
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
        Model.Player.Score.Index
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
        const score_index: Model.Player.Score.Index = this.Index();

        return (
            <div
                className={`Score_${score_index}`}
            >
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const measurements: Game_Measurements = this.Measurements();
        const model: Model.Board.Score_Bar.Instance = this.Model();
        const score_index: Model.Player.Score.Index = this.Index();
        const score_color: Model.Color.HSLA = model.Score_Color(score_index);
        const score_percent: Float = model.Score_Percent(score_index);

        let width: string;
        let height: string;
        if (measurements.Is_Vertical()) {
            width = `100%`;
            height = `${score_percent}%`;
        } else {
            width = `${score_percent}%`;
            height = `100%`;
        }

        let border: string;
        if (model.Current_Score_Index() === score_index) {
            border = `0.2vmin solid rgba(255, 255, 255, 0.5)`;
        } else {
            border = `0.2vmin solid rgba(0, 0, 0, 0.5)`;
        }

        return ({
            width: width,
            height: height,

            border: border,

            backgroundColor: `hsl(
                ${score_color.Hue()},
                ${score_color.Saturation()}%,
                ${score_color.Lightness()}%,
                ${score_color.Alpha()}
            )`,
        });
    }
}
