import { Float } from "../types";

import * as Model from "../model";

import * as Event from "./event";
import { Component } from "./component";
import { Component_Styles } from "./component";
import { Button } from "./common/button";

import { Main } from "./main";
import { Game } from "./game";
import { Arena } from "./arena";

type Results_Props = {
    model: Model.Arena.Instance;
    parent: Game;
    event_grid: Event.Grid;
}

export class Results extends Component<Results_Props>
{
    private banner: Banner | null = null;
    private buttons: Buttons | null = null;

    Main():
        Main
    {
        return this.Game().Main();
    }

    Game():
        Game
    {
        return this.Parent();
    }

    Arena():
        Arena
    {
        return this.Game().Arena();
    }

    Banner():
        Banner
    {
        return this.Try_Object(this.banner);
    }

    Buttons():
        Buttons
    {
        return this.Try_Object(this.buttons);
    }

    Width():
        Float
    {
        return this.Game().Measurements().Results_Width();
    }

    Height():
        Float
    {
        return this.Game().Measurements().Results_Height();
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
        const model: Model.Arena.Instance = this.Model();

        if (model.Is_Game_Over() && !this.Game().Is_Exhibition()) {
            const scores: Model.Player.Scores = model.Final_Scores();

            return (
                <div
                    className={`Results`}
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

    override On_Restyle():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `25% 50% 25%`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            overflowY: `hidden`,

            backgroundColor: `rgba(0, 0, 0, 0.5)`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
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
            this.Change_Style(`opacity`, `0%`);
            await this.Refresh();
            if (this.Is_Alive()) {
                await this.Animate_Fade_In({
                    duration: 2000,
                    easing: `ease-in-out`,
                });
            }
        }
    }
}

type Banner_Props = {
    model: Model.Player.Scores;
    parent: Results;
    event_grid: Event.Grid;
}

class Banner extends Component<Banner_Props>
{
    private winner: Winner | null = null;
    private draws: Draws | null = null;

    Main():
        Main
    {
        return this.Arena().Main();
    }

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

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player.Scores = this.Model();

        if (model.Has_Winner()) {
            return (
                <div
                    className={`Banner`}
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

    override On_Restyle():
        Component_Styles
    {
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

    override On_Life():
        Array<Event.Listener_Info>
    {
        this.Animate_Enter_Left({
            duration: 2000,
            easing: `ease-in-out`,
        });

        return [
        ];
    }
}

type Winner_Props = {
    model: Model.Player_And_Score.Instance;
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

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player_And_Score.Instance = this.Model();

        return (
            <div
                className={`Winner`}
            >
                <div>
                    {`${model.player.Name()} Wins!`}
                </div>
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const model: Model.Player_And_Score.Instance = this.Model();
        const color: Model.Color.HSLA = model.player.Color();

        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            backgroundColor: `hsl(
                ${color.Hue()},
                ${color.Saturation()}%,
                ${color.Lightness()}%,
                ${color.Alpha()}
            )`,

            color: `white`,
            textAlign: `center`,
            fontSize: `6vmin`,
        });
    }
}

type Draws_Props = {
    model: Array<Model.Player_And_Score.Instance>;
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

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Draws`}
            >
                <div>
                    {`Draw`}
                </div>
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const model: Array<Model.Player_And_Score.Instance> = this.Model();
        const color_stop_percent: number = 100 / model.length;
        const linear_gradient_colors: string = model.map(function (
            draw: Model.Player_And_Score.Instance,
            index: Model.Player.Index,
        ):
            string
        {
            const color: Model.Color.HSLA = draw.player.Color();
            const color_stop: string =
                `${index * color_stop_percent}% ${(index + 1) * color_stop_percent}%`;

            return `hsl(
                ${color.Hue()},
                ${color.Saturation()}%,
                ${color.Lightness()}%,
                ${color.Alpha()}
            ) ${color_stop}`;
        }).join(`, `);

        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,

            backgroundImage: `linear-gradient(to right, ${linear_gradient_colors})`,

            color: `white`,
            textAlign: `center`,
            fontSize: `6vmin`,
        });
    }
}

type Buttons_Props = {
    model: Model.Player.Scores;
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

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Player.Scores = this.Model();

        return (
            <div
                className={`Buttons`}
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

    override On_Restyle():
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
}

type Rematch_Button_Props = {
    model: Model.Player.Scores;
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
    model: Model.Player.Scores;
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
