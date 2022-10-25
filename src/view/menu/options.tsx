import * as Model from "../../model";

import * as Event from "../event";
import { Component, Component_Styles } from "../component";
import { Menu } from "../menu";

type Options_Props = {
    model: Model.Menu_Options;
    parent: Menu;
    event_grid: Event.Grid;
}

export class Options extends Component<Options_Props>
{
    private same_toggle: Same_Toggle | null = null;
    private plus_toggle: Plus_Toggle | null = null;
    private wall_toggle: Wall_Toggle | null = null;
    private combo_toggle: Combo_Toggle | null = null;

    private back_button: Back_Button | null = null;

    Menu():
        Menu
    {
        return this.Parent();
    }

    Same_Toggle():
        Same_Toggle
    {
        if (this.same_toggle == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.same_toggle;
        }
    }

    Plus_Toggle():
        Plus_Toggle
    {
        if (this.plus_toggle == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.plus_toggle;
        }
    }

    Wall_Toggle():
        Wall_Toggle
    {
        if (this.wall_toggle == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.wall_toggle;
        }
    }

    Combo_Toggle():
        Combo_Toggle
    {
        if (this.combo_toggle == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.combo_toggle;
        }
    }

    Back_Button():
        Back_Button
    {
        if (this.back_button == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.back_button;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `grid`,
            gridTemplateColumns: `1fr 1fr`,
            gridTemplateRows: `1fr 1fr 1fr`,
            columnGap: `3%`,
            rowGap: `5%`,

            width: `90%`,
            height: `90%`,
            margin: `0`,
            padding: `3%`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(0, 0, 0, 0.3)`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                style={this.Styles()}
            >
                <Same_Toggle
                    ref={ref => this.same_toggle = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Plus_Toggle
                    ref={ref => this.plus_toggle = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Wall_Toggle
                    ref={ref => this.wall_toggle = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Combo_Toggle
                    ref={ref => this.combo_toggle = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Back_Button
                    ref={ref => this.back_button = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }
}

type Toggle_Props = {
    model: Model.Menu_Options;
    parent: Options;
    event_grid: Event.Grid;
}

class Toggle extends Component<Toggle_Props>
{
    private cover: Toggle_Cover | null = null;

    Options():
        Options
    {
        return this.Parent();
    }

    Cover():
        Toggle_Cover
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

    Is_Toggled():
        boolean
    {
        return false;
    }

    Can_Toggle():
        boolean
    {
        return true;
    }

    CSS_Untoggled_Background_Color():
        string
    {
        return `rgba(0, 0, 0, 0.7)`;
    }

    CSS_Untoggled_Text_Color():
        string
    {
        return `white`;
    }

    CSS_Toggled_Background_Color():
        string
    {
        return `rgba(255, 255, 255, 0.7)`;
    }

    CSS_Toggled_Text_Color():
        string
    {
        return `black`;
    }

    CSS_Disabled_Background_Color():
        string
    {
        return `rgba(128, 128, 128, 0.7)`;
    }

    CSS_Disabled_Text_Color():
        string
    {
        return `white`;
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `90%`,
            height: `90%`,

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: 'transparent',
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            fontSize: `2.5em`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        if (this.Can_Toggle()) {
            if (this.Is_Toggled()) {
                this.Change_Style(`backgroundColor`, this.CSS_Toggled_Background_Color());
                this.Change_Style(`color`, this.CSS_Toggled_Text_Color());
            } else {
                this.Change_Style(`backgroundColor`, this.CSS_Untoggled_Background_Color());
                this.Change_Style(`color`, this.CSS_Untoggled_Text_Color());
            }
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`backgroundColor`, this.CSS_Disabled_Background_Color());
            this.Change_Style(`color`, this.CSS_Disabled_Text_Color());
            this.Change_Style(`cursor`, `default`);
        }

        return (
            <div
                style={this.Styles()}
            >
                <div
                    style={{
                        color: `inherit`,
                    }}
                >
                    {this.Text()}
                </div>
                <Toggle_Cover
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

type Toggle_Cover_Props = {
    model: Model.Menu_Options;
    parent: Toggle;
    event_grid: Event.Grid;
}

class Toggle_Cover extends Component<Toggle_Cover_Props>
{
    Toggle():
        Toggle
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
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        if (this.Toggle().Can_Toggle()) {
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`cursor`, `default`);
        }

        return (
            <div
                style={this.Styles()}
                onClick={event => this.Parent().On_Click(event)}
            >
            </div>
        );
    }
}

type Button_Props = {
    model: Model.Menu_Options;
    parent: Options;
    event_grid: Event.Grid;
}

class Button extends Component<Button_Props>
{
    private cover: Button_Cover | null = null;

    Options():
        Options
    {
        return this.Parent();
    }

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
    model: Model.Menu_Options;
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

class Same_Toggle extends Toggle
{
    Text():
        string
    {
        return `Same`;
    }

    Is_Toggled():
        boolean
    {
        return this.Model().Data().Rules().Same();
    }

    Can_Toggle():
        boolean
    {
        return this.Model().Data().Rules().Can_Toggle_Same();
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Data().Rules().Toggle_Same();
            await this.Options().Refresh();
        }
    }
}

class Plus_Toggle extends Toggle
{
    Text():
        string
    {
        return `Plus`;
    }

    Is_Toggled():
        boolean
    {
        return this.Model().Data().Rules().Plus();
    }

    Can_Toggle():
        boolean
    {
        return this.Model().Data().Rules().Can_Toggle_Plus();
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Data().Rules().Toggle_Plus();
            await this.Options().Refresh();
        }
    }
}

class Wall_Toggle extends Toggle
{
    Text():
        string
    {
        return `Wall`;
    }

    Is_Toggled():
        boolean
    {
        return this.Model().Data().Rules().Wall();
    }

    Can_Toggle():
        boolean
    {
        return this.Model().Data().Rules().Can_Toggle_Wall();
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Can_Toggle()) {
                this.Model().Data().Rules().Toggle_Wall();
                await this.Options().Refresh();
            }
        }
    }
}

class Combo_Toggle extends Toggle
{
    Text():
        string
    {
        return `Combo`;
    }

    Is_Toggled():
        boolean
    {
        return this.Model().Data().Rules().Combo();
    }

    Can_Toggle():
        boolean
    {
        return this.Model().Data().Rules().Can_Toggle_Combo();
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            if (this.Can_Toggle()) {
                this.Model().Data().Rules().Toggle_Combo();
                await this.Options().Refresh();
            }
        }
    }
}

class Back_Button extends Button
{
    Text():
        string
    {
        return `Back`;
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        this.Send({
            name_affix: Event.OPEN_TOP_MENU,
            name_suffixes: [
            ],
            data: {
            } as Event.Open_Top_Menu_Data,
            is_atomic: true,
        });
    }
}
