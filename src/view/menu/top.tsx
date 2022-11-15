import { Integer } from "../../types";
import { Index } from "../../types";
import { Float } from "../../types";

import { Plot_Bezier_Curve_4 } from "../../utils";

import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Component_Animation_Frame } from "../component";
import { Button } from "../common/button";

import { Menu } from "../menu";
import { Content as Menu_Content } from "../menu";
import { Menu_Measurements } from "../menu";

type Top_Props = {
    model: Model.Menu.Top;
    parent: Menu_Content;
    event_grid: Event.Grid;
}

export class Top extends Component<Top_Props>
{
    private title_area: Title_Area | null = null;
    private buttons: Buttons | null = null;

    Menu():
        Menu
    {
        return this.Menu_Content().Menu();
    }

    Menu_Content():
        Menu_Content
    {
        return this.Parent();
    }

    Title_Area():
        Title_Area
    {
        return this.Try_Object(this.title_area);
    }

    Buttons():
        Buttons
    {
        return this.Try_Object(this.buttons);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Menu().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Top_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Top_Height();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Top`}
            >
                <Title_Area
                    ref={ref => this.title_area = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Buttons
                    ref={ref => this.buttons = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const measurements: Menu_Measurements = this.Measurements();

        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `
                ${measurements.Top_Title_Area_Height()}px
                ${measurements.Top_Buttons_Height()}px
            `,
            rowGap: `0%`,

            width: `${this.Width()}px`,
            height: `${this.Height()}px`,

            position: `relative`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        return ([
            {
                event_name: new Event.Name(Event.ON, Event.CLOSE_MENUS),
                event_handler: this.On_Close_Menus,
            },
        ]);
    }

    async On_Close_Menus(
        {
        }: Event.Close_Menus_Data,
    ):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Is_Alive()) {
                await this.Fade_And_Move_Out(1000);
            }
        }
    }

    async Fade_And_Move_Out(
        duration: Float,
    ):
        Promise<void>
    {
        function On_Frame(
            {
                elapsed,
            }: Component_Animation_Frame,
            state: {
                element: HTMLElement,
                duration: Integer,
                plot: Array<{
                    x: Float,
                    y: Float,
                }>,
            },
        ):
            boolean
        {
            if (elapsed >= state.duration) {
                element.style.opacity = `0%`;
                element.style.left = `-100%`;

                return false;
            } else {
                const index: Index =
                    Math.floor(elapsed * state.plot.length / state.duration);

                state.element.style.opacity =
                    `${state.plot[index].y}%`;
                state.element.style.left =
                    `${state.plot[index].x}%`;

                return true;
            }
        }

        const element: HTMLElement = this.Some_Element();
        if (duration === 0) {
            element.style.opacity = `0%`;
            element.style.left = `-100%`;
        } else {
            await this.Animate_By_Frame(
                On_Frame,
                {
                    element: element,
                    duration: duration,
                    plot: Plot_Bezier_Curve_4(
                        1.0 / (duration / 15),
                        100.0,
                        0.0, 1.0,
                        0.72, 1.0,
                        -0.38, 0.0,
                        -1.0, 0.0,
                    ),
                },
            );
        }
    }
}

type Title_Area_Props = {
    model: Model.Menu.Top;
    parent: Top;
    event_grid: Event.Grid;
}

class Title_Area extends Component<Title_Area_Props>
{
    private text: Title_Text | null = null;

    Top():
        Top
    {
        return this.Parent();
    }

    Text():
        Title_Text
    {
        return this.Try_Object(this.text);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Top_Title_Area_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Top_Title_Area_Height();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Title_Area`}
                onClick={event => this.On_Click(event)}
            >
                <Title_Text
                    ref={ref => this.text = ref}

                    model={this.Model()}
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
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `${this.Width()}px`,
            height: `${this.Height()}px`,

            alignSelf: `center`,
            justifySelf: `center`,

            fontSize: `5em`,
        });
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        event.preventDefault();
        event.stopPropagation();

        if (this.Is_Alive()) {
            if (event.target === this.Some_Element()) {
                await this.Send({
                    name_affix: Event.HIDE_MENUS,
                    name_suffixes: [
                    ],
                    data: {
                    } as Event.Hide_Menus_Data,
                    is_atomic: true,
                });
            }
        }
    }
}

type Title_Text_Props = {
    model: Model.Menu.Top;
    parent: Title_Area;
    event_grid: Event.Grid;
}

class Title_Text extends Component<Title_Text_Props>
{
    Area():
        Title_Area
    {
        return this.Parent();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Title_Text`}
            >
                {`Triple Triad`}
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: `calc(100% + (0.8vmin * 2))`,
            height: `fit-content`,

            padding: `1% 0`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.8vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundImage: `linear-gradient(
                to right,
                rgba(0, 0, 0, 0.9),
                rgba(0, 0, 0, 0.8),
                rgba(0, 0, 0, 0.7),
                rgba(0, 0, 0, 0.6),
                rgba(0, 0, 0, 0.5),
                rgba(128, 128, 128, 0.4),
                rgba(0, 0, 0, 0.3),
                rgba(0, 0, 0, 0.2),
                rgba(0, 0, 0, 0.1)
            )`,
            backgroundSize: `1000% 100%`,
            backgroundPosition: `left`,

            color: `white`,
            textAlign: `center`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        this.Change_Animation({
            animation_name: `Flash`,
            animation_body: `
                0% {
                    background-position: right;
                    color: rgba(255, 255, 255, 0.0);
                }

                20% {
                    color: rgba(255, 255, 255, 0.0);
                }

                100% {
                    background-position: left;
                    color: rgba(255, 255, 255, 1.0);
                }
            `,
        });

        this.Animate({
            animation_name: `Flash`,
            duration_in_milliseconds: 4000,
            css_iteration_count: `1`,
        });

        return [];
    }
}

type Buttons_Props = {
    model: Model.Menu.Top;
    parent: Top;
    event_grid: Event.Grid;
}

class Buttons extends Component<Buttons_Props>
{
    private new_game: New_Game_Button | null = null;
    private options: Options_Button | null = null;
    private help: Help_Button | null = null;

    Top():
        Top
    {
        return this.Parent();
    }

    New_Game():
        New_Game_Button
    {
        return this.Try_Object(this.new_game);
    }

    Options():
        Options_Button
    {
        return this.Try_Object(this.options);
    }

    Help():
        Help_Button
    {
        return this.Try_Object(this.help);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Top_Buttons_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Top_Buttons_Height();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Buttons`}
                onClick={event => this.On_Click(event)}
            >
                <New_Game_Button
                    ref={ref => this.new_game = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Options_Button
                    ref={ref => this.options = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Help_Button
                    ref={ref => this.help = ref}

                    model={this.Model()}
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
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `1fr 1fr 1fr`,
            rowGap: `4%`,

            width: `${this.Width()}px`,
            height: `${this.Height()}px`,
            padding: `2%`,

            alignSelf: `center`,
            justifySelf: `center`,
        });
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        event.preventDefault();
        event.stopPropagation();

        if (this.Is_Alive()) {
            if (event.target === this.Some_Element()) {
                await this.Send({
                    name_affix: Event.HIDE_MENUS,
                    name_suffixes: [
                    ],
                    data: {
                    } as Event.Hide_Menus_Data,
                    is_atomic: true,
                });
            }
        }
    }
}

type New_Game_Button_Props = {
    model: Model.Menu.Top;
    parent: Buttons;
    event_grid: Event.Grid;
}

class New_Game_Button extends Button<New_Game_Button_Props>
{
    override Name():
        string
    {
        return `New_Game_Button`;
    }

    override Text():
        string
    {
        return `New Game`;
    }

    override CSS_Width():
        string
    {
        return `40%`;
    }

    override CSS_Height():
        string
    {
        return `100%`;
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

    override CSS_Activated_Text_Size():
        string
    {
        return `1.5em`;
    }

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Send({
                name_affix: Event.START_NEW_GAME,
                name_suffixes: [
                ],
                data: {
                } as Event.Start_New_Game_Data,
                is_atomic: true,
            });
        }
    }
}

type Options_Button_Props = {
    model: Model.Menu.Top;
    parent: Buttons;
    event_grid: Event.Grid;
}

class Options_Button extends Button<Options_Button_Props>
{
    override Name():
        string
    {
        return `Options_Button`;
    }

    override Text():
        string
    {
        return `Options`;
    }

    override CSS_Width():
        string
    {
        return `40%`;
    }

    override CSS_Height():
        string
    {
        return `100%`;
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

    override CSS_Activated_Text_Size():
        string
    {
        return `1.5em`;
    }

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Send({
                name_affix: Event.OPEN_OPTIONS_MENU,
                name_suffixes: [
                ],
                data: {
                } as Event.Open_Options_Menu_Data,
                is_atomic: true,
            });
        }
    }
}

type Help_Button_Props = {
    model: Model.Menu.Top;
    parent: Buttons;
    event_grid: Event.Grid;
}

class Help_Button extends Button<Help_Button_Props>
{
    override Name():
        string
    {
        return `Help_Button`;
    }

    override Text():
        string
    {
        return `Help`;
    }

    override CSS_Width():
        string
    {
        return `40%`;
    }

    override CSS_Height():
        string
    {
        return `100%`;
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

    override CSS_Activated_Text_Size():
        string
    {
        return `1.5em`;
    }

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Send({
                name_affix: Event.OPEN_HELP_MENU,
                name_suffixes: [
                ],
                data: {
                } as Event.Open_Help_Menu_Data,
                is_atomic: true,
            });
        }
    }
}
