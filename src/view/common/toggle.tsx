import * as Event from "../event";
import { Component, Component_Styles } from "../component";

type Toggle_Props = {
    model: any;
    parent: any;
    event_grid: Event.Grid;
}

export class Toggle extends Component<Toggle_Props>
{
    private cover: Toggle_Cover | null = null;

    Cover():
        Toggle_Cover
    {
        if (this.cover == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cover;
        }
    }

    Name():
        string
    {
        return `Toggle`;
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

    Is_Enabled():
        boolean
    {
        return true;
    }

    CSS_Width():
        string
    {
        return `100%`;
    }

    CSS_Height():
        string
    {
        return `100%`;
    }

    CSS_Text_Size():
        string
    {
        return `1em`;
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

    CSS_Untoggled_Text_Size():
        string
    {
        return this.CSS_Text_Size();
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

    CSS_Toggled_Text_Size():
        string
    {
        return this.CSS_Text_Size();
    }

    CSS_Disabled_Background_Color():
        string
    {
        return `rgba(63, 15, 15, 0.7)`;
    }

    CSS_Disabled_Text_Color():
        string
    {
        return `white`;
    }

    CSS_Disabled_Text_Size():
        string
    {
        return this.CSS_Text_Size();
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

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
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        if (this.Is_Enabled()) {
            if (this.Is_Toggled()) {
                this.Change_Style(`backgroundColor`, this.CSS_Toggled_Background_Color());
                this.Change_Style(`color`, this.CSS_Toggled_Text_Color());
                this.Change_Style(`fontSize`, this.CSS_Toggled_Text_Size());
            } else {
                this.Change_Style(`backgroundColor`, this.CSS_Untoggled_Background_Color());
                this.Change_Style(`color`, this.CSS_Untoggled_Text_Color());
                this.Change_Style(`fontSize`, this.CSS_Untoggled_Text_Size());
            }
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`backgroundColor`, this.CSS_Disabled_Background_Color());
            this.Change_Style(`color`, this.CSS_Disabled_Text_Color());
            this.Change_Style(`fontSize`, this.CSS_Disabled_Text_Size());
            this.Change_Style(`cursor`, `default`);
        }

        return (
            <div
                className={this.Name()}
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

    async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
    }
}

type Toggle_Cover_Props = {
    model: any;
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
        if (this.Toggle().Is_Enabled()) {
            this.Change_Style(`cursor`, `pointer`);
        } else {
            this.Change_Style(`cursor`, `default`);
        }

        return (
            <div
                style={this.Styles()}
                onClick={event => this.Parent().On_Toggle(event)}
            >
            </div>
        );
    }
}
