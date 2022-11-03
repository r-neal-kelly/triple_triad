import { Instance } from "./instance";

export class Help
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
}
