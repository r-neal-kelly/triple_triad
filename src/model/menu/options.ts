import { Options as Data } from "../options";
import { Instance } from "./instance";

export class Options
{
    private menu: Instance;

    constructor(
        {
            menu,
        }: {
            menu: Instance,
        },
    )
    {
        this.menu = menu;
    }

    Menu():
        Instance
    {
        return this.menu;
    }

    Data():
        Data
    {
        return this.menu.Main().Options();
    }
}
