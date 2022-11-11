import * as Event from "../event";
import { Component } from "../component";
import { Component_Props } from "../component";
import { Component_Styles } from "../component";

interface Toggle_Props extends Component_Props
{
}

export class Toggle<Props extends Toggle_Props> extends Component<Props>
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

    CSS_Untoggled_Border_Color():
        string
    {
        return `rgba(255, 255, 255, 0.5)`;
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

    CSS_Toggled_Border_Color():
        string
    {
        return `rgba(0, 0, 0, 0.7)`;
    }

    CSS_Toggled_Background_Color():
        string
    {
        return `rgba(255, 255, 255, 0.65)`;
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

    CSS_Disabled_Border_Color():
        string
    {
        return `rgba(255, 255, 255, 0.5)`;
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

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={this.Name()}
            >
                <div
                    style={{
                        color: `inherit`,
                        textAlign: `center`,
                        whiteSpace: `nowrap`,
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

    override On_Restyle():
        Component_Styles
    {
        let border_color: string;
        let background_color: string;
        let color: string;
        let font_size: string;
        let cursor: string;
        if (this.Is_Enabled()) {
            if (this.Is_Toggled()) {
                border_color = this.CSS_Toggled_Border_Color();
                background_color = this.CSS_Toggled_Background_Color();
                color = this.CSS_Toggled_Text_Color();
                font_size = this.CSS_Toggled_Text_Size();
            } else {
                border_color = this.CSS_Untoggled_Border_Color();
                background_color = this.CSS_Untoggled_Background_Color();
                color = this.CSS_Untoggled_Text_Color();
                font_size = this.CSS_Untoggled_Text_Size();
            }
            cursor = `pointer`;
        } else {
            border_color = this.CSS_Disabled_Border_Color();
            background_color = this.CSS_Disabled_Background_Color();
            color = this.CSS_Disabled_Text_Color();
            font_size = this.CSS_Disabled_Text_Size();
            cursor = `default`;
        }

        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            overflowX: `hidden`,
            overflowY: `hidden`,

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: border_color,

            backgroundColor: background_color,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            color: color,
            fontSize: font_size,

            cursor: cursor,
        });
    }

    async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
    }
}

type Toggle_Cover_Props = {
    model: any;
    parent: Toggle<Toggle_Props>;
    event_grid: Event.Grid;
}

class Toggle_Cover extends Component<Toggle_Cover_Props>
{
    Toggle():
        Toggle<Toggle_Props>
    {
        return this.Parent();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Toggle_Cover`}
                onClick={event => this.Parent().On_Toggle(event)}
            >
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const toggle: Toggle<Toggle_Props> = this.Toggle();

        let cursor: string;
        if (toggle.Is_Enabled()) {
            cursor = `pointer`;
        } else {
            cursor = `default`;
        }

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

            cursor: cursor,
        });
    }
}
