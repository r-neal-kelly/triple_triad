import { Instance } from "./instance";

export class Top
{
    private menu: Instance;

    constructor(
        {
            menu,
        }: {
            menu: Instance,
        }
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
