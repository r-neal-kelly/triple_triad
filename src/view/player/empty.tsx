import { Float } from "../../types";

import * as Event from "../event";
import { Component } from "../component";
import { Component_Styles } from "../component";
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

    Width():
        Float
    {
        return this.Arena().Measurements().Player_Width();
    }

    Height():
        Float
    {
        return this.Arena().Measurements().Player_Height();
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
        return ({
            display: `flex`,
            flexDirection: `column`,
            alignItems: `center`,

            width: this.CSS_Width(),
            height: this.CSS_Height(),

            position: `relative`,

            backgroundColor: `transparent`,
        });
    }
}
