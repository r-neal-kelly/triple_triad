import { Float } from "../../types";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
import { Game_Measurements } from "../game";
import { Arena } from "../arena";
import { Group } from "./group";

type Empty_Props = {
    model: null;
    parent: Group;
    event_grid: Event.Grid;
}

export class Empty extends Component<Empty_Props>
{
    Arena():
        Arena
    {
        return this.Group().Arena();
    }

    Group():
        Group
    {
        return this.Parent();
    }

    Measurements():
        Game_Measurements
    {
        return this.Arena().Measurements();
    }

    Width():
        Float
    {
        return this.Measurements().Player_Width();
    }

    Height():
        Float
    {
        return this.Measurements().Player_Height();
    }

    CSS_Width():
        string
    {
        return `${this.Width()}px`;
    }

    CSS_Height():
        string
    {
        return `${this.Height()}px`;
    }

    override On_Refresh():
        JSX.Element | null
    {
        return (
            <div
                className={`Empty`}
            >
            </div>
        );
    }

    override On_Restyle():
        Component_Styles
    {
        const measurements: Game_Measurements = this.Measurements();

        let flex_direction: string;
        if (measurements.Is_Vertical()) {
            flex_direction = `row`;
        } else {
            flex_direction = `column`;
        }

        return ({
            display: `flex`,
            flexDirection: flex_direction,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `relative`,

            backgroundColor: `transparent`,
        });
    }
}
