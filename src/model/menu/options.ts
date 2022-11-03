import { Options as Data } from "../options";
import { Instance } from "./instance";

export class Options
{
    private menu: Instance;
    private data: Data;

    constructor(
        {
            menu,
            data = new Data({}),
        }: {
            menu: Instance,
            data?: Data,
        },
    )
    {
        this.menu = menu;
        this.data = data;
    }

    Menu():
        Instance
    {
        return this.menu;
    }

    Data():
        Data
    {
        return this.data;
    }
}
