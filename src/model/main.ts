import { Assert } from "../utils";
import { Random_Integer_Exclusive } from "../utils";

import { Packs } from "./packs";
import { Collection } from "./collection";
import * as Selection from "./selection";
import { Options } from "./options";
import * as Menu from "./menu";
import * as Exhibition from "./exhibition";
import * as Arena from "./arena";
import * as Player from "./player";

export class Main
{
    private packs: Packs;
    private collections: { [index: Player.Name]: Collection };
    private options: Options;

    private menu: Menu.Instance;
    private exhibitions: Array<Exhibition.Instance>;

    private current_exhibition_index: Exhibition.Index | null;
    private current_arena: Arena.Instance | null;

    constructor(
        {
            collections = [],
            options = new Options({}),
            exhibition_count = 16,
        }: {
            collections?: Array<Collection>,
            options?: Options,
            exhibition_count?: Exhibition.Count,
        },
    )
    {
        this.packs = new Packs();
        this.collections = {};
        for (const collection of collections) {
            this.collections[collection.Owner_Name()] = collection;
        }
        this.options = options;

        this.menu = new Menu.Instance({
            main: this,
        });
        this.exhibitions = [];
        for (let idx = 0, end = exhibition_count; idx < end; idx += 1) {
            this.exhibitions.push(new Exhibition.Instance({
                main: this,
                index: idx,
            }));
        }

        this.current_exhibition_index = Random_Integer_Exclusive(0, exhibition_count);
        this.current_arena = null;
    }

    Packs():
        Packs
    {
        return this.packs;
    }

    Collection(owner_name: Player.Name):
        Collection
    {
        if (this.collections[owner_name] == null) {
            throw new Error(`${owner_name} does not have a collection.`);
        } else {
            return this.collections[owner_name];
        }
    }

    Collections():
        Array<Collection>
    {
        return Object.values(this.collections);
    }

    Collection_Owner_Names():
        Array<Player.Name>
    {
        return Object.keys(this.collections).sort();
    }

    Options():
        Options
    {
        return this.options;
    }

    Menu():
        Menu.Instance
    {
        return this.menu;
    }

    Exhibition_Count():
        Exhibition.Count
    {
        return this.exhibitions.length;
    }

    Exhibition(exhibition_index: Exhibition.Index):
        Exhibition.Instance
    {
        if (exhibition_index == null || exhibition_index < 0 || exhibition_index > this.exhibitions.length) {
            throw new Error(`Invalid exhibition_index.`);
        } else {
            return this.exhibitions[exhibition_index];
        }
    }

    Exhibitions():
        Array<Exhibition.Instance>
    {
        return Array.from(this.exhibitions);
    }

    Current_Exhibition_Index():
        Exhibition.Index | null
    {
        return this.current_exhibition_index;
    }

    Current_Exhibition():
        Exhibition.Instance | null
    {
        if (this.current_exhibition_index != null) {
            return this.exhibitions[this.current_exhibition_index as Exhibition.Index];
        } else {
            return null;
        }
    }

    Change_Current_Exhibition():
        void
    {
        const old_current_exhibition_index = this.current_exhibition_index;
        while (this.current_exhibition_index === old_current_exhibition_index) {
            this.current_exhibition_index = Random_Integer_Exclusive(0, this.Exhibition_Count());
        }
    }

    Current_Arena():
        Arena.Instance | null
    {
        return this.current_arena;
    }

    Is_In_Game():
        boolean
    {
        return this.current_arena != null;
    }

    Isnt_In_Game():
        boolean
    {
        return this.current_arena == null;
    }

    New_Game(arena_selections: Array<Selection.Instance>):
        Arena.Instance
    {
        this.current_exhibition_index = null;
        this.current_arena = new Arena.Instance({
            rules: this.menu.Options().Data().Rules(),
            selections: arena_selections,
        });

        return this.current_arena as Arena.Instance;
    }

    Rematch_Game():
        Arena.Instance
    {
        Assert(this.current_arena != null);

        this.current_arena = (this.current_arena as Arena.Instance).New();

        return this.current_arena as Arena.Instance;
    }

    Exit_Game():
        void
    {
        this.current_arena = null;

        this.Menu().Open_Top();

        const exhibition_count: Exhibition.Count = this.exhibitions.length;
        this.exhibitions = [];
        for (let idx = 0, end = exhibition_count; idx < end; idx += 1) {
            this.exhibitions.push(new Exhibition.Instance({
                main: this,
                index: idx,
            }));
        }
        this.current_exhibition_index = Random_Integer_Exclusive(0, exhibition_count);
    }
}
