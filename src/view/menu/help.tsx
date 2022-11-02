import * as Model from "../../model";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Button } from "../common/button";
import { Menu } from "../menu";

type Help_Props = {
    model: Model.Menu_Help;
    parent: Menu;
    event_grid: Event.Grid;
}

export class Help extends Component<Help_Props>
{
    private back_button: Back_Button | null = null;

    Menu():
        Menu
    {
        return this.Parent();
    }

    Back_Button():
        Back_Button
    {
        return this.Try_Object(this.back_button);
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Help`}
            >
                <div
                    className={`Info`}
                    style={{
                        overflowY: `auto`,

                        color: `white`,
                        textAlign: `start`,
                        fontSize: `0.85em`,
                        lineHeight: `150%`,
                    }}
                >
                    <h2>
                        How To Play
                    </h2>
                    <hr></hr>
                    <ul>
                        <li>The default board is a 3x3 grid upon which players place their cards.</li>
                        <li>Players place one card per turn, alternating until the board is full of cards.</li>
                        <li>Each player's stack of cards comes with a unique color.</li>
                        <li>The goal is to turn other cards into your color!</li>
                        <li>Whoever has the most cards at the end of the match wins.</li>
                        <li>If the top two players have the same amount of cards, the match ends in a draw.</li>
                        <li>Each card has 4 numbers located in the top-left of the card. The numbers can be 1 through 9 or the letter A, which represents the number 10.</li>
                        <li>There is one number for each side of the card, i.e. left, top, right, and bottom.</li>
                        <li>When you place a card next to another card, it will change into your color if your card has a higher number on the touching side.</li>
                        <li>You can change multiple cards in one turn, one for each side. With the optional rules, even more cards can be taken in a single turn!</li>
                    </ul>
                    <h2>
                        Optional Rules
                    </h2>
                    <hr></hr>
                    <h3>
                        Same
                    </h3>
                    <div>
                        The same rule applies when 2 or more sides of your card are the same as those of your opponents' adjacent cards. You get to take each card that is!
                    </div>
                    <h3>
                        Plus
                    </h3>
                    <div>
                        The plus rule applies when 2 or more sides of your card and your opponents' adjacent cards add up to the same sum. You get to take each card that does!
                    </div>
                    <h3>
                        Wall
                    </h3>
                    <div>
                        The wall rule causes the edge of the board to equate to A, which will count as 1 of the 2 needed sides to trigger the same or plus rule!
                    </div>
                    <h3>
                        Combo
                    </h3>
                    <div>
                        The combo rule applies after a same or plus and makes each taken card act as if you had just placed it on the board, allowing for a chain. The chain can continue if another same or plus rule occurs. With this rule, it's possible to take the entire board in one turn!
                    </div>
                </div>
                <Back_Button
                    ref={ref => this.back_button = ref}

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
            gridTemplateRows: `9fr 1.5fr`,
            gridGap: `3%`,

            width: `90%`,
            height: `90%`,
            margin: `0`,
            padding: `3vmin`,

            borderWidth: `0.6vmin`,
            borderRadius: `0`,
            borderStyle: `solid`,
            borderColor: `rgba(255, 255, 255, 0.5)`,

            backgroundColor: `rgba(0, 0, 0, 0.95)`,

            fontSize: `1.8em`,
        });
    }
}

type Back_Button_Props = {
    model: Model.Menu_Help;
    parent: Help;
    event_grid: Event.Grid;
}

class Back_Button extends Button<Back_Button_Props>
{
    Help():
        Help
    {
        return this.Parent();
    }

    override Name():
        string
    {
        return `Back_Button`;
    }

    override Text():
        string
    {
        return `Back`;
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

    override async On_Activate(event: React.SyntheticEvent):
        Promise<void>
    {
        if (this.Is_Alive()) {
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
}
