import * as Model from "../../model";

import * as Event from "../event";
import { Component, Component_Styles } from "../component";
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
        if (this.title == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.title;
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
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `45% 55%`,
            rowGap: `0`,

            width: `100%`,
            height: `100%`,

            backgroundColor: `transparent`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                style={this.Styles()}
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
}

type Title_Props = {
    model: Model.Menu_Top;
    parent: Top;
    event_grid: Event.Grid;
}

class Title extends Component<Title_Props>
{
    Top():
        Top
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

            width: `100%`,
            height: `100%`,

            fontSize: `5em`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                style={this.Styles()}
            >
                <div>{`Triple Triad`}</div>
            </div>
        );
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

    Top():
        Top
    {
        return this.Parent();
    }

    New_Game():
        New_Game_Button
    {
        if (this.new_game == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.new_game;
        }
    }

    Options():
        Options_Button
    {
        if (this.options == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.options;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr`,
            gridTemplateRows: `1fr 1fr 1fr`,
            rowGap: `5%`,

            width: `100%`,
            height: `100%`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                style={this.Styles()}
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
            </div>
        );
    }
}

type Button_Props = {
    model: any;
    parent: any;
    event_grid: Event.Grid;
}

class Button extends Component<Button_Props>
{
    private cover: Button_Cover | null = null;

    Cover():
        Button_Cover
    {
        if (this.cover == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cover;
        }
    }

    Text():
        string
    {
        return ``;
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `40%`,
            height: `100%`,

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(0, 0, 0, 0.7)`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            fontSize: `2.5em`,

            cursor: `pointer`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                style={this.Styles()}
            >
                <div>
                    {this.Text()}
                </div>
                <Button_Cover
                    ref={ref => this.cover = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
    }
}

type Button_Cover_Props = {
    model: any;
    parent: Button;
    event_grid: Event.Grid;
}

class Button_Cover extends Component<Button_Cover_Props>
{
    Button():
        Button
    {
        return this.Parent();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            width: `100%`,
            height: `100%`,

            position: `absolute`,
            left: `0`,
            top: `0`,
            zIndex: `1`,

            backgroundColor: `transparent`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            cursor: `pointer`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                style={this.Styles()}
                onClick={event => this.Parent().On_Click(event)}
            >
            </div>
        );
    }
}

class New_Game_Button extends Button
{
    Text():
        string
    {
        return `New Game`;
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
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

class Options_Button extends Button
{
    Text():
        string
    {
        return `Options`;
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
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
