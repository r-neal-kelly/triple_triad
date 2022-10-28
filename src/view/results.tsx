import * as Model from "../model"

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Button } from "./common/button";
import { Main } from "./main";
import { Arena } from "./arena";

type Results_Props = {
    model: Model.Arena;
    parent: Main;
    event_grid: Event.Grid;
}

export class Results extends Component<Results_Props>
{
    private banner: Banner | null = null;
    private buttons: Buttons | null = null;

    Main():
        Main
    {
        return this.Parent();
    }

    Arena():
        Arena
    {
        return this.Main().Arena();
    }

    Banner():
        Banner
    {
        if (this.banner == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.banner;
        }
    }

    Buttons():
        Buttons
    {
        if (this.buttons == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.buttons;
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
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `25% 50% 25%`,

            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            backgroundColor: `rgba(0, 0, 0, 0.5)`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Arena = this.Model();

        if (model.Is_Game_Over()) {
            const scores: Model.Scores = model.Final_Scores();

            return (
                <div
                    className={`Results`}
                    style={this.Styles()}
                >
                    <div>
                    </div>
                    <Banner
                        ref={ref => this.banner = ref}

                        model={scores}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                    <Buttons
                        ref={ref => this.buttons = ref}

                        model={scores}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        this.Animate({
            animation_name: `Fade_In`,
            duration_in_milliseconds: 2000,
            css_iteration_count: `1`,
            css_timing_function: `ease-in-out`,
            css_direction: `normal`,
        });

        return ([
            {
                event_name: new Event.Name(Event.ON, Event.GAME_START),
                event_handler: this.On_Game_Start,
            },
            {
                event_name: new Event.Name(Event.ON, Event.GAME_STOP),
                event_handler: this.On_Game_Stop,
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
            await this.Refresh();
        }
    }

    async On_Game_Stop(
        {
        }: Event.Game_Stop_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            await this.Refresh();
        }
    }
}

type Banner_Props = {
    model: Model.Scores;
    parent: Results;
    event_grid: Event.Grid;
}

class Banner extends Component<Banner_Props>
{
    private winner: Winner | null = null;
    private draws: Draws | null = null;

    Arena():
        Arena
    {
        return this.Results().Arena();
    }

    Results():
        Results
    {
        return this.Parent();
    }

    Winner():
        Winner
    {
        if (this.winner == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.winner;
        }
    }

    Draws():
        Draws
    {
        if (this.draws == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.draws;
        }
    }

    Before_Life():
        Component_Styles
    {
        this.Change_Animation({
            animation_name: `Move_In`,
            animation_body: `
                0% {
                    left: -100%;
                }
            
                100% {
                    left: 0;
                }
            `,
        });

        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            position: `relative`,

            borderWidth: `0.6vmin 0`,
            borderStyle: `solid`,
            borderColor: `#00000080`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Scores = this.Model();

        if (model.Has_Winner()) {
            return (
                <div
                    className={`Banner`}
                    style={this.Styles()}
                >
                    <Winner
                        ref={ref => this.winner = ref}

                        model={model.Winner()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        } else {
            return (
                <div
                    className={`Banner`}
                    style={this.Styles()}
                >
                    <Draws
                        ref={ref => this.draws = ref}

                        model={model.Draws()}
                        parent={this}
                        event_grid={this.Event_Grid()}
                    />
                </div>
            );
        }
    }

    On_Life():
        Event.Listener_Info[]
    {
        this.Animate({
            animation_name: `Move_In`,
            duration_in_milliseconds: 2000,
            css_iteration_count: `1`,
            css_timing_function: `ease-in-out`,
            css_direction: `normal`,
        });

        return [
        ];
    }
}

type Winner_Props = {
    model: Model.Player_And_Score;
    parent: Banner;
    event_grid: Event.Grid;
}

class Winner extends Component<Winner_Props>
{
    Arena():
        Arena
    {
        return this.Banner().Results().Arena();
    }

    Banner():
        Banner
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        const model: Model.Player_And_Score = this.Model();
        const color: Model.Color = model.player.Color();

        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            backgroundColor: `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha()}
            )`,

            fontSize: `6vmin`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player_And_Score = this.Model();

        return (
            <div
                className={`Winner`}
                style={this.Styles()}
            >
                <div>
                    {`${model.player.Name()} Wins!`}
                </div>
            </div>
        );
    }
}

type Draws_Props = {
    model: Array<Model.Player_And_Score>;
    parent: Banner;
    event_grid: Event.Grid;
}

class Draws extends Component<Draws_Props>
{
    Arena():
        Arena
    {
        return this.Banner().Results().Arena();
    }

    Banner():
        Banner
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            backgroundImage: ``,

            fontSize: `6vmin`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Array<Model.Player_And_Score> = this.Model();
        const color_stop_percent: number = 100 / model.length;
        const linear_gradient_colors: string = model.map(function (
            draw: Model.Player_And_Score,
            index: Model.Player_Index,
        ):
            string
        {
            const color: Model.Color = draw.player.Color();
            const color_stop: string = `${index * color_stop_percent}% ${(index + 1) * color_stop_percent}%`;

            return `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()}) ${color_stop}`;
        }).join(`, `);

        this.Change_Style(
            `backgroundImage`,
            `linear-gradient(to right, ${linear_gradient_colors})`,
        );

        return (
            <div
                className={`Draws`}
                style={this.Styles()}
            >
                <div>
                    {`Draw`}
                </div>
            </div>
        );
    }
}

type Buttons_Props = {
    model: Model.Scores;
    parent: Results;
    event_grid: Event.Grid;
}

class Buttons extends Component<Buttons_Props>
{
    private rematch_button: Rematch_Button | null = null;
    private exit_button: Exit_Button | null = null;

    Arena():
        Arena
    {
        return this.Results().Arena();
    }

    Results():
        Results
    {
        return this.Parent();
    }

    Rematch_Button():
        Rematch_Button
    {
        if (this.rematch_button == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.rematch_button;
        }
    }

    Exit_Button():
        Exit_Button
    {
        if (this.exit_button == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.exit_button;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr 1fr`,
            gridTemplateRows: `1fr`,
            gridGap: `5%`,

            width: `100%`,
            height: `100%`,

            alignSelf: `center`,
            justifySelf: `center`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        const model: Model.Scores = this.Model();

        return (
            <div
                className={`Buttons`}
                style={this.Styles()}
            >
                <Rematch_Button
                    ref={ref => this.rematch_button = ref}

                    model={model}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Exit_Button
                    ref={ref => this.exit_button = ref}

                    model={model}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }
}

type Rematch_Button_Props = {
    model: Model.Scores;
    parent: Buttons;
    event_grid: Event.Grid;
}

class Rematch_Button extends Button<Rematch_Button_Props>
{
    override Name():
        string
    {
        return `Rematch_Button`;
    }

    override Text():
        string
    {
        return `Play Rematch`;
    }

    override CSS_Width():
        string
    {
        return `90%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override CSS_Text_Color():
        string
    {
        return `white`;
    }

    override CSS_Text_Size():
        string
    {
        return `2.5em`;
    }

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Send({
                name_affix: Event.REMATCH_GAME,
                name_suffixes: [
                ],
                data: {
                } as Event.Rematch_Game_Data,
                is_atomic: true,
            });
        }
    }
}

type Exit_Button_Props = {
    model: Model.Scores;
    parent: Buttons;
    event_grid: Event.Grid;
}

class Exit_Button extends Button<Exit_Button_Props>
{
    override Name():
        string
    {
        return `Exit_Button`;
    }

    override Text():
        string
    {
        return `Exit Game`;
    }

    override CSS_Width():
        string
    {
        return `90%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override CSS_Text_Color():
        string
    {
        return `white`;
    }

    override CSS_Text_Size():
        string
    {
        return `2.5em`;
    }

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Send({
                name_affix: Event.EXIT_GAME,
                name_suffixes: [
                ],
                data: {
                } as Event.Exit_Game_Data,
                is_atomic: true,
            });
        }
    }
}
