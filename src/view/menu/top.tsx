import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Button } from "../common/button";
import { Menu } from "../menu";

type Top_Props = {
    model: Model.Menu_Top;
    parent: Menu;
    event_grid: Event.Grid;
}

export class Top extends Component<Top_Props>
{
    private title: Title | null = null;
    private buttons: Buttons | null = null;

    Menu():
        Menu
    {
        return this.Parent();
    }

    Title():
        Title
    {
        return this.Try_Object(this.title);
    }

    Buttons():
        Buttons
    {
        return this.Try_Object(this.buttons);
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Top`}
            >
                <Title
                    ref={ref => this.title = ref}

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
        const model: Model.Menu_Top = this.Model();

        let display: string;
        if (model.Is_Open()) {
            display = `grid`;
        } else {
            display = `none`;
        }

        return ({
            display: display,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `40% 60%`,
            rowGap: `0%`,

            width: `100%`,
            height: `100%`,

            position: `relative`,

            backgroundColor: `transparent`,
        });
    }

    override On_Life():
        Event.Listener_Info[]
    {
        this.Change_Animation({
            animation_name: `Fade_And_Move_Out`,
            animation_body: `
                0% {
                    opacity: 100%;
                    left: 0;
                }

                50% {
                    opacity: 100%;
                    left: 0;
                }
            
                100% {
                    opacity: 0%;
                    left: -100%;
                }
            `,
        });

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
            this.Model().Close();
            await this.Animate({
                animation_name: `Fade_And_Move_Out`,
                duration_in_milliseconds: 750,
                css_iteration_count: `1`,
                css_timing_function: `ease-in-out`,
                //css_fill_mode: `forward`,
            });
            if (this.Is_Alive()) {
                // having troubles with the menu flicking in view
                // sometimes, when it should be completely invisible.
                this.Change_Style(`display`, `none`);
                this.Change_Style(`visibility`, `hidden`);
                this.Change_Style(`left`, `-100%`);
            }
        }
    }
}

type Title_Props = {
    model: Model.Menu_Top;
    parent: Top;
    event_grid: Event.Grid;
}

class Title extends Component<Title_Props>
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

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Title`}
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

            width: `100%`,
            height: `100%`,

            alignSelf: `center`,
            justifySelf: `center`,

            fontSize: `5em`,
        });
    }
}

type Title_Text_Props = {
    model: Model.Menu_Top;
    parent: Title;
    event_grid: Event.Grid;
}

class Title_Text extends Component<Title_Text_Props>
{
    Title():
        Title
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
            width: `80%`,
            height: `fit-content`,

            padding: `1% 0`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.8vmin`,
            borderRadius: `100%`,
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
        Event.Listener_Info[]
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
    model: Model.Menu_Top;
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

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Buttons`}
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

            width: `100%`,
            height: `100%`,
            padding: `2%`,

            alignSelf: `center`,
            justifySelf: `center`,
        });
    }
}

type New_Game_Button_Props = {
    model: Model.Menu_Top;
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
    model: Model.Menu_Top;
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
    model: Model.Menu_Top;
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
