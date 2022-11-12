import { Assert } from "../../utils";

import * as Enum from "../enum";
import { Main } from "../main";
import { Top } from "./top";
import { Options } from "./options";
import { Help } from "./help";

export class Instance
{
    private main: Main;

    private top: Top;
    private options: Options;
    private help: Help;

    private current_menu: Enum.Menu;

    constructor(
        {
            main,
        }: {
            main: Main,
        },
    )
    {
        this.main = main;

        this.top = new Top({
            menu: this,
        });
        this.options = new Options({
            menu: this,
        });
        this.help = new Help({
            menu: this,
        });

        this.current_menu = Enum.Menu.TOP;
    }

    Main():
        Main
    {
        return this.main;
    }

    Top():
        Top
    {
        return this.top;
    }

    Options():
        Options
    {
        return this.options;
    }

    Help():
        Help
    {
        return this.help;
    }

    Current_Menu():
        Enum.Menu
    {
        return this.current_menu;
    }

    Open_Top():
        void
    {
        this.current_menu = Enum.Menu.TOP;
    }

    Open_Options():
        void
    {
        Assert(this.current_menu === Enum.Menu.TOP);

        this.current_menu = Enum.Menu.OPTIONS;
    }

    Open_Help():
        void
    {
        Assert(this.current_menu === Enum.Menu.TOP);

        this.current_menu = Enum.Menu.HELP;
    }
}
