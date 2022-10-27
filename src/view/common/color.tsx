import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";

interface Color_Props
{
    model: any;
    parent: any;
    event_grid: Event.Grid;
}

export class Color<Props extends Color_Props> extends Component<Props>
{
    private previous: Previous | null = null;
    private next: Next | null = null;

    Previous():
        Previous
    {
        if (this.previous == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.previous;
        }
    }

    Next():
        Next
    {
        if (this.next == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.next;
        }
    }

    Name():
        string
    {
        return `Color`;
    }

    Color():
        Model.Color
    {
        return new Model.Color({});
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

    CSS_Button_Width():
        string
    {
        return `10%`;
    }

    CSS_Button_Height():
        string
    {
        return `100%`;
    }

    CSS_Button_Background_Color():
        string
    {
        return `rgba(0, 0, 0, 0.7)`;
    }

    CSS_Button_Text_Color():
        string
    {
        return `white`;
    }

    CSS_Button_Text_Size():
        string
    {
        return `1em`;
    }

    CSS_Button_Activated_Background_Color():
        string
    {
        return `rgba(255, 255, 255, 0.7)`;
    }

    CSS_Button_Activated_Text_Color():
        string
    {
        return `black`;
    }

    CSS_Button_Activated_Text_Size():
        string
    {
        return `1em`;
    }

    Before_Life():
        Component_Styles
    {
        const color: Model.Color = this.Color();

        return ({
            display: `flex`,
            flexDirection: `row`,
            justifyContent: `center`,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),
            margin: `0`,
            padding: `0`,

            position: `relative`,

            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(
                ${color.Red()},
                ${color.Green()},
                ${color.Blue()},
                ${color.Alpha()}
            )`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={this.Name()}
                style={this.Styles()}
            >
                <Previous
                    ref={ref => this.previous = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Next
                    ref={ref => this.next = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }

    async On_Previous(event: React.SyntheticEvent):
        Promise<void>
    {
    }

    async On_Next(event: React.SyntheticEvent):
        Promise<void>
    {
    }
}

type Previous_Props = {
    model: any;
    parent: Color<Color_Props>;
    event_grid: Event.Grid;
}

class Previous extends Component<Previous_Props>
{
    private cover: Previous_Cover | null = null;

    Color():
        Color<Color_Props>
    {
        return this.Parent();
    }

    Cover():
        Previous_Cover
    {
        if (this.cover == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cover;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: this.Color().CSS_Button_Width(),
            height: this.Color().CSS_Button_Height(),

            borderWidth: `0.6vmin`,
            borderRadius: `100%`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: this.Color().CSS_Button_Background_Color(),
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            color: this.Color().CSS_Button_Text_Color(),
            fontSize: this.Color().CSS_Button_Text_Size(),
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Previous`}
                style={this.Styles()}
            >
                <div
                    style={{
                        color: `inherit`,
                    }}
                >
                    {`<`}
                </div>
                <Previous_Cover
                    ref={ref => this.cover = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }
}

type Previous_Cover_Props = {
    model: any;
    parent: Previous;
    event_grid: Event.Grid;
}

class Previous_Cover extends Component<Previous_Cover_Props>
{
    Color():
        Color<Color_Props>
    {
        return this.Previous().Color();
    }

    Previous():
        Previous
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
        const color: Color<Color_Props> = this.Color();

        return (
            <div
                className={`Previous_Cover`}
                style={this.Styles()}
                onClick={event => color.On_Previous(event)}
            >
            </div>
        );
    }
}

type Next_Props = {
    model: any;
    parent: Color<Color_Props>;
    event_grid: Event.Grid;
}

class Next extends Component<Next_Props>
{
    private cover: Next_Cover | null = null;

    Color():
        Color<Color_Props>
    {
        return this.Parent();
    }

    Cover():
        Next_Cover
    {
        if (this.cover == null) {
            throw this.Error_Not_Rendered();
        } else {
            return this.cover;
        }
    }

    Before_Life():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `column`,
            justifyContent: `center`,
            alignItems: `center`,

            width: this.Color().CSS_Button_Width(),
            height: this.Color().CSS_Button_Height(),

            borderWidth: `0.6vmin`,
            borderRadius: `100%`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: this.Color().CSS_Button_Background_Color(),
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            color: this.Color().CSS_Button_Text_Color(),
            fontSize: this.Color().CSS_Button_Text_Size(),
        });
    }

    On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Next`}
                style={this.Styles()}
            >
                <div
                    style={{
                        color: `inherit`,
                    }}
                >
                    {`>`}
                </div>
                <Next_Cover
                    ref={ref => this.cover = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
            </div>
        );
    }
}

type Next_Cover_Props = {
    model: any;
    parent: Next;
    event_grid: Event.Grid;
}

class Next_Cover extends Component<Next_Cover_Props>
{
    Color():
        Color<Color_Props>
    {
        return this.Next().Color();
    }

    Next():
        Next
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
        const color: Color<Color_Props> = this.Color();

        return (
            <div
                style={this.Styles()}
                onClick={event => color.On_Next(event)}
            >
            </div>
        );
    }
}
