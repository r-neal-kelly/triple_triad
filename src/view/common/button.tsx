import * as Event from "../event";
import { Component } from "../component";
import { Component_Props } from "../component";
import { Component_Styles } from "../component";

interface Button_Props extends Component_Props
{
}

export class Button<Props extends Button_Props> extends Component<Props>
{
    private cover: Button_Cover | null = null;

    Cover():
        Button_Cover
    {
        return this.Try_Object(this.cover);
    }

    Name():
        string
    {
        return `Button`;
    }

    Text():
        string
    {
        return ``;
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

    CSS_Padding_Left():
        string
    {
        return `0`;
    }

    CSS_Padding_Top():
        string
    {
        return `0`;
    }

    CSS_Padding_Right():
        string
    {
        return `0`;
    }

    CSS_Padding_Bottom():
        string
    {
        return `0`;
    }

    CSS_Text_Color():
        string
    {
        return `white`;
    }

    CSS_Text_Size():
        string
    {
        return `1em`;
    }

    CSS_Background_Color():
        string
    {
        return `rgba(0, 0, 0, 0.7)`;
    }

    CSS_Activated_Text_Color():
        string
    {
        return `black`;
    }

    CSS_Activated_Text_Size():
        string
    {
        return `1em`;
    }

    CSS_Activated_Background_Color():
        string
    {
        return `rgba(255, 255, 255, 0.7)`;
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={this.Name()}
            >
                <div
                    className={`Button_Text`}
                    style={{
                        color: `inherit`,
                    }}
                >
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

    override On_Restyle():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),
            paddingLeft: this.CSS_Padding_Left(),
            paddingTop: this.CSS_Padding_Top(),
            paddingRight: this.CSS_Padding_Right(),
            paddingBottom: this.CSS_Padding_Bottom(),

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: this.CSS_Background_Color(),
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            color: this.CSS_Text_Color(),
            fontSize: this.CSS_Text_Size(),

            cursor: `pointer`,
        });
    }

    override On_Life():
        Array<Event.Listener_Info>
    {
        // we'll eventually make these CSS variables that we can more efficiently change
        this.Change_Animation({
            animation_name: `Activate`,
            animation_body: `
                0% {
                    background-color: ${this.CSS_Background_Color()};
                    color: ${this.CSS_Text_Color()};
                    font-size: ${this.CSS_Text_Size()};
                }
            
                50% {
                    background-color: ${this.CSS_Activated_Background_Color()};
                    color: ${this.CSS_Activated_Text_Color()};
                    font-size: ${this.CSS_Activated_Text_Size()};
                }

                100% {
                    background-color: ${this.CSS_Background_Color()};
                    color: ${this.CSS_Text_Color()};
                    font-size: ${this.CSS_Text_Size()};
                }
            `,
        });

        return [];
    }

    async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
    }
}

type Button_Cover_Props = {
    model: any;
    parent: Button<Button_Props>;
    event_grid: Event.Grid;
}

class Button_Cover extends Component<Button_Cover_Props>
{
    Button():
        Button<Button_Props>
    {
        return this.Parent();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Button_Cover`}
                onClick={event => this.On_Activate(event)}
            >
            </div>
        );
    }

    override On_Restyle():
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

    async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        const button: Button<Button_Props> = this.Parent();
        if (button.Is_Alive()) {
            await button.Animate({
                animation_name: `Activate`,
                duration_in_milliseconds: 300,
                css_iteration_count: `1`,
                css_timing_function: `ease`,
                css_direction: `normal`,
                css_fill_mode: `both`,
            });
            if (button.Is_Alive()) {
                button.Deanimate();
                button.On_Activate(event);
            }
        }
    }
}
