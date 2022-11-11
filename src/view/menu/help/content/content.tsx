import { Float } from "../../../../types";

import * as Model from "../../../../model";

import * as Event from "../../../event";
import { Component } from "../../../component";
import { Component_Styles } from "../../../component";

import { Menu_Measurements } from "../../../menu";
import { Help } from "../help";

type Content_Props = {
    model: Model.Menu.Help;
    parent: Help;
    event_grid: Event.Grid;
}

export class Content extends Component<Content_Props>
{
    Help():
        Help
    {
        return this.Parent();
    }

    Measurements():
        Menu_Measurements
    {
        return this.Parent().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Help_Content_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Help_Content_Height();
    }

    Padding_Left_Right():
        Float
    {
        return this.Measurements().Help_Content_Padding_Left_Right();
    }

    Padding_Top_Bottom():
        Float
    {
        return this.Measurements().Help_Content_Padding_Top_Bottom();
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Content`}
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
        );
    }

    override On_Restyle():
        Component_Styles
    {
        return ({
            width: `${this.Width()}px`,
            height: `${this.Height()}px`,
            padding: `
                ${this.Padding_Top_Bottom()}px
                ${this.Padding_Left_Right()}px
            `,

            overflowX: `hidden`,
            overflowY: `auto`,

            color: `white`,
            textAlign: `start`,
            fontSize: `0.85em`,
            lineHeight: `150%`,
        });
    }
}
