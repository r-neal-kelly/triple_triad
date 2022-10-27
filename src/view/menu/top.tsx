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

class New_Game_Button extends Button
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

class Options_Button extends Button
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
