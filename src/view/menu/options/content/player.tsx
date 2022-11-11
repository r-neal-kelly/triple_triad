import { Integer } from "../../../../types";
import { Float } from "../../../../types";

import * as Model from "../../../../model";

import * as Event from "../../../event";
import { Component } from "../../../component";
import { Component_Styles } from "../../../component";
import { Toggle } from "../../../common/toggle";
import { Counter } from "../../../common/counter";

import { Menu_Measurements } from "../../../menu";
import { Options } from "../options";
import { Content } from "./content";

type Player_Props = {
    model: Model.Options;
    parent: Content;
    event_grid: Event.Grid;
}

export class Player extends Component<Player_Props>
{
    private title: Title | null = null;
    private counter: Player_Counter | null = null;
    private toggles: Toggles | null = null;

    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Parent();
    }

    Title():
        Title
    {
        return this.Try_Object(this.title);
    }

    Counter():
        Player_Counter
    {
        return this.Try_Object(this.counter);
    }

    Toggles():
        Toggles
    {
        return this.Try_Object(this.toggles);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Options_Content_Section_Width();
    }

    Padding_Bottom():
        Float
    {
        return this.Measurements().Options_Content_Section_Padding_Bottom();
    }

    Row_Gap():
        Float
    {
        return this.Measurements().Options_Content_Section_Row_Gap();
    }

    Column_Gap():
        Float
    {
        return this.Measurements().Options_Content_Section_Column_Gap();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Player`}
            >
                <Title
                    ref={ref => this.title = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Player_Counter
                    ref={ref => this.counter = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Toggles
                    ref={ref => this.toggles = ref}

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
            gridTemplateRows: `1fr 1fr 1fr 1fr`,
            gridGap: `
                ${this.Row_Gap()}px
                ${this.Column_Gap()}px
            `,

            width: `${this.Width()}px`,
            paddingBottom: `${this.Padding_Bottom()}px`,
        });
    }
}

type Title_Props = {
    model: Model.Options;
    parent: Player;
    event_grid: Event.Grid;
}

class Title extends Component<Title_Props>
{
    Player():
        Player
    {
        return this.Parent();
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Border_Width_Left_Right():
        Float
    {
        return this.Measurements().Options_Content_Section_Title_Border_Width_Left_Right();
    }

    Border_Width_Top_Bottom():
        Float
    {
        return this.Measurements().Options_Content_Section_Title_Border_Width_Top_Bottom();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Title`}
            >
                {`Players`}
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: `100%`,

            gridColumn: `1 / span 1`,
            gridRow: `1 / span 1`,
            alignSelf: `center`,
            justifySelf: `center`,

            borderWidth: `
                ${this.Border_Width_Top_Bottom()}px
                ${this.Border_Width_Left_Right()}px
            `,
            borderTop: `0px`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            color: `white`,
            fontSize: `110%`,
            textAlign: `center`,
            whiteSpace: `nowrap`,
        });
    }
}

type Player_Counter_Props = {
    model: Model.Options;
    parent: Player;
    event_grid: Event.Grid;
}

class Player_Counter extends Counter<Player_Counter_Props>
{
    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Player().Content();
    }

    Player():
        Player
    {
        return this.Parent();
    }

    override Name():
        string
    {
        return `Player_Counter`;
    }

    override Text():
        string
    {
        return `Count`;
    }

    override Count():
        Integer
    {
        return this.Model().Player_Count();
    }

    override Can_Decrement():
        boolean
    {
        return this.Model().Can_Decrement_Player_Count();
    }

    override Can_Increment():
        boolean
    {
        return this.Model().Can_Increment_Player_Count();
    }

    override CSS_Width():
        string
    {
        return `50%`;
    }

    override CSS_Height():
        string
    {
        return `90%`;
    }

    override async On_Decrement(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Options = this.Model();
            if (model.Can_Decrement_Player_Count()) {
                model.Decrement_Player_Count();
                await this.Options().Refresh();
            }
        }
    }

    override async On_Increment(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            const model: Model.Options = this.Model();
            if (model.Can_Increment_Player_Count()) {
                model.Increment_Player_Count();
                await this.Options().Refresh();
            }
        }
    }
}

type Toggles_Props = {
    model: Model.Options;
    parent: Player;
    event_grid: Event.Grid;
}

class Toggles extends Component<Toggles_Props>
{
    private types: Types | null = null;
    private colors: Colors | null = null;

    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Player().Content();
    }

    Player():
        Player
    {
        return this.Parent();
    }

    Types():
        Types
    {
        return this.Try_Object(this.types);
    }

    Colors():
        Colors
    {
        return this.Try_Object(this.colors);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Toggles`}
            >
                <Types
                    ref={ref => this.types = ref}

                    model={this.Model()}
                    parent={this}
                    event_grid={this.Event_Grid()}
                />
                <Colors
                    ref={ref => this.colors = ref}

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
            gridTemplateRows: `1fr 2fr`,

            width: `100%`,
            height: `100%`,

            gridColumn: `1 / span 1`,
            gridRow: `3 / span 2`,
            alignSelf: `center`,
            justifySelf: `center`,
        });
    }
}

type Types_Props = {
    model: Model.Options;
    parent: Toggles;
    event_grid: Event.Grid;
}

class Types extends Component<Types_Props>
{
    private types: Array<Type | null> =
        new Array(this.Model().Player_Count()).fill(null);

    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Player().Content();
    }

    Player():
        Player
    {
        return this.Toggles().Player();
    }

    Toggles():
        Toggles
    {
        return this.Parent();
    }

    Type(player_index: Model.Player.Index):
        Type
    {
        return this.Try_Array_Index(this.types, player_index);
    }

    Types():
        Array<Type>
    {
        return this.Try_Array(this.types);
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Options_Content_Section_Types_Width();
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Options = this.Model();
        const player_count: Model.Player.Count = model.Player_Count();

        return (
            <div
                className={`Types`}
            >
                {
                    Array(player_count).fill(null).map((
                        _,
                        player_index: Model.Player.Index
                    ):
                        JSX.Element =>
                    {
                        return (
                            <Type
                                key={player_index}
                                ref={ref => this.types[player_index] = ref}

                                model={model}
                                parent={this}
                                event_grid={this.Event_Grid()}
                                index={player_index}
                            />
                        );
                    })
                }
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `row`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `${this.Width()}px`,
            height: `100%`,
        });
    }
}

type Type_Props = {
    model: Model.Options;
    parent: Types;
    event_grid: Event.Grid;
    index: Model.Player.Index;
}

class Type extends Toggle<Type_Props>
{
    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Player().Content();
    }

    Player():
        Player
    {
        return this.Types().Player();
    }

    Types():
        Types
    {
        return this.Parent();
    }

    Index():
        Model.Player.Index
    {
        return this.props.index;
    }

    override Name():
        string
    {
        return `Type`;
    }

    override Text():
        string
    {
        return `CPU`;
    }

    override CSS_Text_Size():
        string
    {
        return `2.8vmin`;
    }

    override Is_Toggled():
        boolean
    {
        return this.Model().Player_Type(this.Index()) === Model.Player.Type.COMPUTER;
    }

    override Is_Enabled():
        boolean
    {
        return true;
    }

    override CSS_Width():
        string
    {
        return `calc(100% / ${Model.Options.Max_Player_Count()})`;
    }

    override CSS_Height():
        string
    {
        return `100%`;
    }

    override async On_Toggle(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Toggle_Player_Type(this.Index());
            await this.Options().Refresh();
        }
    }
}

type Colors_Props = {
    model: Model.Options;
    parent: Toggles;
    event_grid: Event.Grid;
}

class Colors extends Component<Colors_Props>
{
    private colors: Array<Color | null> =
        new Array(this.Model().Player_Count()).fill(null);

    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Player().Content();
    }

    Player():
        Player
    {
        return this.Toggles().Player();
    }

    Toggles():
        Toggles
    {
        return this.Parent();
    }

    Color(color_index: Model.Color.Index):
        Color
    {
        return this.Try_Array_Index(this.colors, color_index);
    }

    Colors():
        Array<Color>
    {
        return this.Try_Array(this.colors);
    }

    override On_Refresh():
        JSX.Element | null
    {
        const model: Model.Options = this.Model();
        const player_color_count: Model.Color.Count = model.Player_Color_Count();

        return (
            <div
                className={`Colors`}
            >
                {
                    Array(player_color_count).fill(null).map((
                        _,
                        player_color_index: Model.Color.Index
                    ):
                        JSX.Element =>
                    {
                        return (
                            <Color
                                key={player_color_index}
                                ref={ref => this.colors[player_color_index] = ref}

                                model={model}
                                parent={this}
                                event_grid={this.Event_Grid()}
                                index={player_color_index}
                            />
                        );
                    })
                }
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            display: `flex`,
            flexDirection: `row`,
            justifyContent: `center`,
            alignItems: `center`,

            width: `100%`,
            height: `100%`,
        });
    }
}

type Color_Props = {
    model: Model.Options;
    parent: Colors;
    event_grid: Event.Grid;
    index: Model.Player.Index;
}

class Color extends Component<Color_Props>
{
    Options():
        Options
    {
        return this.Content().Options();
    }

    Content():
        Content
    {
        return this.Player().Content();
    }

    Player():
        Player
    {
        return this.Colors().Player();
    }

    Colors():
        Colors
    {
        return this.Parent();
    }

    Index():
        Model.Player.Index
    {
        return this.props.index;
    }

    Value():
        Model.Color.Instance
    {
        return this.Model().Player_Color(this.Index());
    }

    CSS_Width():
        string
    {
        return `calc(100% / ${Model.Options.Max_Player_Count()})`;
    }

    CSS_Height():
        string
    {
        return `100%`;
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Color_${this.Index()}`}
                onClick={event => this.On_Activate(event)}
            >
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const value: Model.Color.Instance = this.Value();

        return ({
            display: `flex`,
            flexDirection: `row`,
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

            backgroundColor: `rgba(
                ${value.Red()},
                ${value.Green()},
                ${value.Blue()},
                ${value.Alpha()}
            )`,
            backgroundRepeat: `no-repeat`,
            backgroundPosition: `center`,
            backgroundSize: `100% 100%`,

            cursor: `pointer`,
        });
    }

    async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
            this.Model().Select_Next_Player_Color(this.Index());
            await this.Options().Refresh();
        }
    }
}
