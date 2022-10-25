import cats_pack_json from "./packs/cats.json"

import * as Utils from "./utils";

/* Various aliases to assist reading comprehension. */
type Name =
    string;

type Count =
    number;

type Index =
    number;

type Delta =
    number;

type Min =
    number;

type Max =
    number;

type URL =
    string;

type Pack_Name =
    Name;

type Pack_Count =
    Count;

type Tier_Count =
    Count;

type Tier_Index =
    Index;

type Card_Name =
    Name;

type Card_Count =
    Count;

type Card_Index =
    Index;

type Card_Number =
    number;

type Element_Name =
    Name;

type Shuffle_Count =
    Count;

export type Color_Count =
    Count;

export type Color_Index =
    Index;

export type Player_Name =
    Name;

export type Player_Count =
    Count;

export type Player_Index =
    Index;

export type Stake_Count =
    Count;

export type Stake_Index =
    Index;

export type Row_Count =
    Count;

export type Column_Count =
    Count;

export type Cell_Count =
    Count;

export type Cell_Index =
    Index;

export type Turn_Count =
    Count;

export type Claim_Count =
    Count;

export type Claim_Delta =
    Delta;

export type Same_Count =
    Count;

export type Plus_Count =
    Count;

export type Combo_Count =
    Count;

export type Step_Count =
    Count;

export type Defense =
    number;

export type Defense_Count =
    number;

export type Score =
    number;

export type Exhibition_Count =
    Count;

export type Exhibition_Index =
    Index;

export type Iteration_Count =
    Count;

export enum Difficulty_e
{
    _NONE_ = -1,

    VERY_EASY,
    EASY,
    MEDIUM,
    HARD,
    VERY_HARD,

    _COUNT_,
    _FIRST_ = VERY_EASY,
    _LAST_ = VERY_HARD,
}

export enum Direction_e
{
    _NONE_ = -1,

    LEFT,
    TOP,
    RIGHT,
    BOTTOM,

    _COUNT_,
    _FIRST_ = LEFT,
    _LAST_ = BOTTOM,
}

export enum Rule_e
{
    _NONE_ = -1,

    SAME,
    PLUS,
    COMBO,

    _COUNT_,
    _FIRST_ = SAME,
    _LAST_ = COMBO,
}

export enum Menu_e
{
    _NONE_ = -1,

    TOP,
    OPTIONS,
    HELP,

    _COUNT_,
    _FIRST_ = TOP,
    _LAST_ = HELP,
}

const MIN_TIER_COUNT = Difficulty_e._COUNT_;

/* Packs and their components as provided and represented by parsed JSON. */
type Pack_JSON = {
    name: Pack_Name;
    tiers: Array<Tier_JSON>;
}

type Tier_JSON =
    Array<Card_JSON>;

type Card_JSON = {
    name: Card_Name;
    image: URL;
    element: Element_Name;
    left: Card_Number;
    top: Card_Number;
    right: Card_Number;
    bottom: Card_Number;
}

/* Contains all available packs. */
export class Packs
{
    #pack_count: Pack_Count;
    #packs: { [index: Pack_Name]: Pack };

    constructor()
    {
        const packs_json: Array<Pack_JSON> = [
            cats_pack_json,
        ];

        this.#pack_count = packs_json.length;
        this.#packs = {};

        packs_json.forEach(function (
            this: Packs,
            pack_json: Pack_JSON,
        ):
            void
        {
            if (this.#packs[pack_json.name] != null) {
                throw new Error(`Pack with the name "${pack_json.name}" already exists.`);
            } else {
                Object.freeze(pack_json);
                Object.freeze(pack_json.tiers);

                this.#packs[pack_json.name] = new Pack({
                    packs: this,
                    pack_json,
                });
            }
        }, this);

        Object.freeze(this);
        Object.freeze(this.#packs);
    }

    Pack_Count():
        Pack_Count
    {
        return this.#pack_count;
    }

    Pack(pack_name: Pack_Name):
        Pack
    {
        const pack = this.#packs[pack_name];

        if (pack == null) {
            throw new Error("Invalid pack_name.");
        } else {
            return pack;
        }
    }

    Random_Pack():
        Pack
    {
        return this.As_Array()[Utils.Random_Integer_Exclusive(0, this.Pack_Count())];
    }

    As_Array():
        Array<Pack>
    {
        return Object.values(this.#packs); // probably want to sort by pack_name
    }
}

/* Contains all the tiers and each of their collectible cards. */
class Pack
{
    #packs: Packs;
    #name: Pack_Name;
    #tiers: Array<Tier>;
    #difficulties: Array<Array<Tier>>;

    constructor(
        {
            packs,
            pack_json,
        }: {
            packs: Packs,
            pack_json: Pack_JSON,
        }
    )
    {
        if (pack_json.tiers.length < MIN_TIER_COUNT) {
            throw new Error(`The pack ${pack_json.name} must have at least ${MIN_TIER_COUNT} tiers.`);
        } else {
            this.#packs = packs;
            this.#name = pack_json.name;
            this.#tiers = pack_json.tiers.map(function (
                this: Pack,
                tier_json: Tier_JSON,
                tier_index: Tier_Index,
            ):
                Tier
            {
                Object.freeze(tier_json);

                return new Tier({
                    pack: this,
                    tier_index,
                    tier_json,
                });
            }, this);
            this.#difficulties = [];
            {
                const min_tiers_per_difficulty: Tier_Count =
                    Math.floor(this.Tier_Count() / Difficulty_e._COUNT_);
                const counts_per_difficulty: Array<Tier_Count> =
                    new Array(Difficulty_e._COUNT_).fill(min_tiers_per_difficulty);
                const tiers_to_distribute: Tier_Count =
                    this.Tier_Count() % Difficulty_e._COUNT_;
                if (tiers_to_distribute > 0) {
                    // we favor the right hand side of the array when the count or remainder is even,
                    // thus giving the harder difficulties more cards to deal with.
                    // this calculation requires that count > 0, take > 0, and take < count.
                    const middle_idx_to_distribute: Index =
                        Math.floor(Difficulty_e._COUNT_ / 2);
                    const start_idx_to_distribute: Index =
                        middle_idx_to_distribute - (Math.ceil(tiers_to_distribute / 2) - 1);
                    for (let idx = start_idx_to_distribute, end = idx + tiers_to_distribute; idx < end; idx += 1) {
                        counts_per_difficulty[idx] += 1;
                    }
                }

                let tier_idx: Tier_Index = 0;
                for (const count of counts_per_difficulty) {
                    const difficulty: Array<Tier> = [];
                    for (let count_idx = 0, end = count; count_idx < end; count_idx += 1) {
                        difficulty.push(this.Tier(tier_idx));
                        tier_idx += 1;
                    }
                    this.#difficulties.push(difficulty);
                    Object.freeze(difficulty);
                }
            }

            Object.freeze(this);
            Object.freeze(this.#tiers);
            Object.freeze(this.#difficulties);
        }
    }

    Packs():
        Packs
    {
        return this.#packs;
    }

    Name():
        Pack_Name
    {
        return this.#name;
    }

    Tier_Count():
        Tier_Count
    {
        return this.#tiers.length;
    }

    Tier(tier_index: Tier_Index):
        Tier
    {
        if (tier_index >= 0 && tier_index < this.Tier_Count()) {
            return this.#tiers[tier_index];
        } else {
            throw new Error("Invalid tier_index.");
        }
    }

    Tiers():
        Array<Tier>
    {
        return Array.from(this.#tiers);
    }

    Tiers_By_Difficulty(difficulty: Difficulty_e):
        Array<Tier>
    {
        if (difficulty == null || difficulty < Difficulty_e._FIRST_ || difficulty > Difficulty_e._LAST_) {
            throw new Error(`Invalid difficulty: ${difficulty}.`);
        } else {
            return Array.from(this.#difficulties[difficulty]);
        }
    }
}

/* Contains all the collectible cards in a single tier of a pack. */
class Tier
{
    #pack: Pack;
    #index: Tier_Index;
    #cards: Array<Card>;

    constructor(
        {
            pack,
            tier_index,
            tier_json,
        }: {
            pack: Pack,
            tier_index: Tier_Index,
            tier_json: Tier_JSON,
        }
    )
    {
        if ((tier_json.length as Card_Count) < 1) {
            throw new Error(`Each tier must have at least one card.`);
        } else {
            this.#pack = pack;
            this.#index = tier_index;
            this.#cards = tier_json.map(function (
                this: Tier,
                card_json: Card_JSON,
                card_index: Card_Index,
            ):
                Card
            {
                Object.freeze(card_json);

                return new Card({
                    tier: this,
                    card_index,
                    card_json,
                });
            }, this);

            Object.freeze(this);
            Object.freeze(this.#cards);
        }
    }

    Pack():
        Pack
    {
        return this.#pack;
    }

    Index():
        Tier_Index
    {
        return this.#index;
    }

    Card_Count():
        Card_Count
    {
        return this.#cards.length;
    }

    Card(card_index: Card_Index):
        Card
    {
        if (card_index >= 0 && card_index < this.Card_Count()) {
            return this.#cards[card_index];
        } else {
            throw new Error("Invalid card_index.");
        }
    }

    Cards():
        Array<Card>
    {
        return Array.from(this.#cards);
    }
}

/* Contains the data for each individual card in a pack. */
class Card
{
    #tier: Tier;
    #index: Card_Index;
    #card_json: Card_JSON;

    constructor(
        {
            tier,
            card_index,
            card_json,
        }: {
            tier: Tier,
            card_index: Card_Index,
            card_json: Card_JSON,
        }
    )
    {
        this.#tier = tier;
        this.#index = card_index;
        this.#card_json = card_json;

        Object.freeze(this);
    }

    Pack():
        Pack
    {
        return this.#tier.Pack();
    }

    Tier():
        Tier
    {
        return this.#tier;
    }

    Index():
        Card_Index
    {
        return this.#index;
    }

    Name():
        Card_Name
    {
        return this.#card_json.name;
    }

    Image():
        URL
    {
        return this.#card_json.image;
    }

    Element():
        Element_Name
    {
        return this.#card_json.element;
    }

    Left():
        Card_Number
    {
        return this.#card_json.left;
    }

    Top():
        Card_Number
    {
        return this.#card_json.top;
    }

    Right():
        Card_Number
    {
        return this.#card_json.right;
    }

    Bottom():
        Card_Number
    {
        return this.#card_json.bottom;
    }
}

export class Main
{
    private packs: Packs;
    private collections: { [index: Player_Name]: Collection };

    private menu: Menu;
    private exhibitions: Exhibition[];

    private current_exhibition_index: Exhibition_Index | null;
    private current_arena: Arena | null;

    constructor(
        {
            collections = [],
            options = new Options({}),
            exhibition_count = 16,
        }: {
            collections?: Array<Collection>,
            options?: Options,
            exhibition_count?: Exhibition_Count,
        },
    )
    {
        this.packs = new Packs();
        this.collections = {};
        for (const collection of collections) {
            this.collections[collection.Owner_Name()] = collection;
        }

        this.menu = new Menu({
            options,
        });
        this.exhibitions = [];
        for (let idx = 0, end = exhibition_count; idx < end; idx += 1) {
            this.exhibitions.push(new Exhibition({
                main: this,
                index: idx,
            }));
        }

        this.current_exhibition_index = Utils.Random_Integer_Exclusive(0, exhibition_count);
        this.current_arena = null;
    }

    Packs():
        Packs
    {
        return this.packs;
    }

    Collection(owner_name: Player_Name):
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
        Array<Player_Name>
    {
        return Object.keys(this.collections).sort();
    }

    Menu():
        Menu
    {
        return this.menu;
    }

    Exhibition_Count():
        Exhibition_Count
    {
        return this.exhibitions.length;
    }

    Exhibition(exhibition_index: Exhibition_Index):
        Exhibition
    {
        if (exhibition_index == null || exhibition_index < 0 || exhibition_index > this.exhibitions.length) {
            throw new Error(`Invalid exhibition_index.`);
        } else {
            return this.exhibitions[exhibition_index];
        }
    }

    Exhibitions():
        Exhibition[]
    {
        return Array.from(this.exhibitions);
    }

    Current_Exhibition_Index():
        Exhibition_Index | null
    {
        return this.current_exhibition_index;
    }

    Current_Exhibition():
        Exhibition | null
    {
        if (this.current_exhibition_index != null) {
            return this.exhibitions[this.current_exhibition_index as Exhibition_Index];
        } else {
            return null;
        }
    }

    Change_Current_Exhibition():
        void
    {
        const old_current_exhibition_index = this.current_exhibition_index;
        while (this.current_exhibition_index === old_current_exhibition_index) {
            this.current_exhibition_index = Utils.Random_Integer_Exclusive(0, this.Exhibition_Count());
        }
    }

    Current_Arena():
        Arena | null
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

    New_Game(arena_selections: Array<Selection>):
        Arena
    {
        this.current_exhibition_index = null;
        this.current_arena = new Arena({
            rules: this.menu.Options().Data().Rules(),
            selections: arena_selections,
        });

        return this.current_arena as Arena;
    }

    Exit_Game():
        void
    {
        this.current_arena = null;
        this.current_exhibition_index = Utils.Random_Integer_Exclusive(0, this.exhibitions.length);
    }
}

export class Menu
{
    private top: Menu_Top;
    private options: Menu_Options;

    private current_menu: Menu_e;

    constructor(
        {
            options = new Options({}),
        }: {
            options?: Options,
        },
    )
    {
        this.top = new Menu_Top({
            menu: this,
        });
        this.options = new Menu_Options({
            menu: this,
            options,
        });

        this.current_menu = Menu_e.TOP;
    }

    Top():
        Menu_Top
    {
        return this.top;
    }

    Options():
        Menu_Options
    {
        return this.options;
    }

    Current_Menu():
        Menu_e
    {
        return this.current_menu;
    }

    Open_Top():
        void
    {
        Utils.Assert(this.current_menu !== Menu_e.TOP);

        this.current_menu = Menu_e.TOP;
    }

    Open_Options():
        void
    {
        Utils.Assert(this.current_menu === Menu_e.TOP);

        this.current_menu = Menu_e.OPTIONS;
    }
}

export class Menu_Top
{
    private menu: Menu;

    constructor(
        {
            menu,
        }: {
            menu: Menu,
        }
    )
    {
        this.menu = menu;
    }

    Menu():
        Menu
    {
        return this.menu;
    }
}

export class Menu_Options
{
    private menu: Menu;
    private options: Options;

    constructor(
        {
            menu,
            options = new Options({}),
        }: {
            menu: Menu,
            options?: Options,
        }
    )
    {
        this.menu = menu;
        this.options = options;
    }

    Menu():
        Menu
    {
        return this.menu;
    }

    Data():
        Options
    {
        return this.options;
    }
}

export class Options
{
    private rules: Rules;

    private use_small_board: boolean;

    constructor(
        {
            rules = new Rules({}),

            use_small_board = true,
        }: {
            rules?: Rules,

            use_small_board?: boolean,
        },
    )
    {
        this.rules = rules.Clone();

        this.use_small_board = use_small_board;
    }

    Rules():
        Rules
    {
        return this.rules;
    }

    Use_Small_Board():
        boolean
    {
        return this.use_small_board;
    }
}

export class Exhibition
{
    private main: Main;
    private index: Exhibition_Index;
    private arena: Arena;
    private iteration_count: Iteration_Count;

    constructor(
        {
            main,
            index,
        }: {
            main: Main,
            index: Exhibition_Index,
        },
    )
    {
        this.main = main;
        this.index = index;
        this.arena = Exhibition.Generate(main.Packs().As_Array());
        this.iteration_count = 1;
    }

    Main():
        Main
    {
        return this.main;
    }

    Index():
        Exhibition_Index
    {
        return this.index;
    }

    Arena():
        Arena
    {
        return this.arena;
    }

    Iteration_Count():
        Iteration_Count
    {
        return this.iteration_count;
    }

    Is_Visible():
        boolean
    {
        return this.Index() === this.Main().Current_Exhibition_Index();
    }

    Regenerate():
        void
    {
        this.arena = Exhibition.Generate(this.main.Packs().As_Array());
        this.iteration_count += 1;
    }

    private static Generate(packs: Array<Pack>):
        Arena
    {
        const random_rules: Random_Rules = new Random_Rules({});

        const random_colors: Unique_Random_Colors = new Unique_Random_Colors({
            color_count: random_rules.Player_Count(),

            min_red: 31,
            max_red: 191,

            min_green: 31,
            max_green: 191,

            min_blue: 31,
            max_blue: 191,

            min_alpha: 0.7,
            max_alpha: 0.7,
        });

        const random_selections: Array<Random_Selection> = [];
        for (let idx = 0, end = random_rules.Player_Count(); idx < end; idx += 1) {
            random_selections.push(
                new Random_Selection({
                    collection: new Collection({
                        default_shuffle: new Random_Shuffle({
                            packs: packs,
                            min_difficulty: Difficulty_e.VERY_EASY,
                            max_difficulty: Difficulty_e.VERY_HARD,
                            allow_multiple_difficulties: true,
                        }),
                    }),
                    color: random_colors.Color(idx),
                    is_of_human: false,
                    card_count: random_rules.Selection_Card_Count(),
                })
            );
        }

        return new Arena({
            rules: random_rules,
            selections: random_selections,
        });
    }
}

/* An instance of a game including the rules, the board, the players, their collections, selections, and stakes. */
export class Arena
{
    #rules: Rules;
    #players: Array<Player>;
    #board: Board;

    #turn_count: Turn_Count;
    #turn_queue: Array<Player>;
    #turn_queue_index: Index;

    #is_input_enabled: boolean;

    private scores: Scores | null;

    constructor(
        {
            rules,
            selections,
        }: {
            rules: Rules,
            selections: Array<Selection>,
        },
    )
    {
        const player_count: Player_Count = rules.Player_Count();
        if (selections.length !== player_count) {
            throw new Error(`Must have a selection for each player, no more and no less.`);
        } else {
            this.#rules = rules.Clone();

            let human_count: Count = 0;
            let computer_count: Count = 0;
            this.#players = [];
            for (let idx = 0, end = player_count; idx < end; idx += 1) {
                const selection: Selection = selections[idx];
                let player_name: Player_Name = selection.Collection().Owner_Name();
                if (selection.Is_Of_Human()) {
                    human_count += 1;
                    this.#players.push(new Human_Player({
                        arena: this,
                        index: idx,
                        name: player_name !== `` ?
                            player_name :
                            `PLAYER ${human_count}`,
                        selection: selections[idx],
                    }));
                } else {
                    computer_count += 1;
                    this.#players.push(new Computer_Player({
                        arena: this,
                        index: idx,
                        name: player_name !== `` ?
                            player_name :
                            `CPU ${computer_count}`,
                        selection: selections[idx],
                    }));
                }
            }

            this.#board = new Board({
                arena: this,
            });

            this.#turn_count = rules.Cell_Count();
            this.#turn_queue = Array.from(this.#players).sort(() => Utils.Random_Boolean() ? 1 : -1);
            this.#turn_queue_index = 0;

            this.#is_input_enabled = true;

            this.scores = null;

            Object.freeze(this.#rules);
            Object.freeze(this.#players);
            Object.freeze(this.#turn_queue);
        }
    }

    Rules():
        Rules
    {
        return this.#rules;
    }

    Player_Count():
        Player_Count
    {
        return this.#players.length;
    }

    Player(player_index: Player_Index):
        Player
    {
        if (player_index >= 0 && player_index < this.Player_Count()) {
            return this.#players[player_index];
        } else {
            throw new Error("Invalid player_index.");
        }
    }

    Players():
        Array<Player>
    {
        return Array.from(this.#players);
    }

    Current_Player_Index():
        Player_Index
    {
        return this.Current_Player().Index();
    }

    Current_Player():
        Player
    {
        if (this.Is_Game_Over()) {
            throw new Error(`This arena has no current player because the game is over.`);
        } else {
            return this.#turn_queue[this.#turn_queue_index];
        }
    }

    Board():
        Board
    {
        return this.#board;
    }

    Turn_Count():
        Turn_Count
    {
        return this.#turn_count;
    }

    Is_On_Human_Turn():
        boolean
    {
        if (this.Is_Game_Over()) {
            return false;
        } else {
            return this.Current_Player().Is_Human();
        }
    }

    Is_On_Computer_Turn():
        boolean
    {
        if (this.Is_Game_Over()) {
            return false;
        } else {
            return !this.Is_On_Human_Turn();
        }
    }

    Next_Turn():
        void
    {
        Utils.Assert(
            this.Is_Game_Over() === false,
            `No more turns, the game is over.`,
        );


        this.#turn_count -= 1;
        this.#turn_queue_index += 1;
        if (this.#turn_queue_index === this.#turn_queue.length) {
            this.#turn_queue_index = 0;
        }

        if (this.Is_Game_Over()) {
            this.scores = new Scores({
                players: this.#players,
            });
        }
    }

    Is_Input_Enabled():
        boolean
    {
        return this.#is_input_enabled;
    }

    Enable_Input():
        void
    {
        this.#is_input_enabled = true;
    }

    Disable_Input():
        void
    {
        this.#is_input_enabled = false;
    }

    Is_Game_Over():
        boolean
    {
        return this.#turn_count === 0;
    }

    Scores():
        Scores | null
    {
        return this.scores;
    }
}

/* Contains a number of cards held by a player and several shuffles from which to generate cards. */
export class Collection
{
    #owner_name: Player_Name;
    #default_shuffle: Shuffle;
    #shuffle_count: Shuffle_Count;
    #shuffles: { [index: Pack_Name]: Shuffle };
    #pack_card_and_counts: { [index: Pack_Name]: Array<Card_And_Count> }; // may want to keep each pack sorted

    constructor(
        {
            owner_name = ``,
            default_shuffle,
        }: {
            owner_name?: Player_Name,
            default_shuffle: Shuffle,
        }
    )
    {
        this.#owner_name = owner_name;
        this.#default_shuffle = default_shuffle;
        this.#shuffle_count = 0;
        this.#shuffles = {};
        this.#pack_card_and_counts = {};

        this.Add_Shuffle(default_shuffle);
    }

    Owner_Name():
        Player_Name
    {
        return this.#owner_name;
    }

    Shuffle_Count():
        Shuffle_Count
    {
        return this.#shuffle_count;
    }

    Shuffle(pack_name: Pack_Name):
        Shuffle
    {
        return this.#shuffles[pack_name];
    }

    Default_Shuffle():
        Shuffle
    {
        return this.#default_shuffle;
    }

    Random_Shuffle():
        Shuffle
    {
        return Object.values(this.#shuffles)[Utils.Random_Integer_Exclusive(0, this.Shuffle_Count())];
    }

    Add_Shuffle(shuffle: Shuffle):
        void
    {
        if (this.#shuffles[shuffle.Pack().Name()]) {
            throw new Error(`This collection already has a shuffle for the "${shuffle.Pack().Name()}" pack.`);
        } else {
            this.#shuffle_count += 1;
            this.#shuffles[shuffle.Pack().Name()] = shuffle;
        }
    }

    Remove_Shuffle(pack_name: Pack_Name):
        void
    {
        if (this.#shuffles[pack_name]) {
            this.#shuffle_count -= 1;
            delete this.#shuffles[pack_name];
        }
    }

    Add_Card(
        card: Card,
        card_count: Card_Count,
    ):
        void
    {

    }

    Remove_Card(
        card: Card,
        card_count: Card_Count,
    ):
        void
    {

    }

    Random_Cards(
        {
            card_count,
            allow_repeats = true,
            allow_multiple_packs = false,
        }: {
            card_count: Card_Count,
            allow_repeats: boolean,
            allow_multiple_packs: boolean,
        }
    ):
        Array<Card>
    {
        // we need to be able to select random cards from the card_and_counts too, but for now we'll keep it easy
        // we also need to add the functionality to use multiple packs, but one thing at a time here

        if (allow_repeats) {
            return this.Random_Shuffle().Cards(card_count);
        } else {
            return this.Random_Shuffle().Unique_Cards(card_count);
        }
    }

    Serialize():
        object
    {
        // if we serialize by indices into a pack but the pack is changed, there's no way to know the difference.
        // we could serialize with card names, but that may be overkill here.
        return {};
    }

    Deserialize(save_data: object):
        void
    {

    }
}

/* Provides a fine-tuned way to randomly generate a list of cards from an individual pack. */
export class Shuffle
{
    #pack: Pack;
    #min_tier_index: Tier_Index;
    #max_tier_index: Tier_Index;

    constructor(
        {
            pack,
            min_tier_index,
            max_tier_index,
        }: {
            pack: Pack,
            min_tier_index: Tier_Index,
            max_tier_index: Tier_Index,
        }
    )
    {
        if (min_tier_index > max_tier_index) {
            throw new Error(`The min_tier_index cannot be greater than the max_tier_index: ${min_tier_index} > ${max_tier_index}`);
        } else if (max_tier_index >= pack.Tier_Count()) {
            throw new Error(`The max_tier_index includes a non-existent tier in the pack "${pack.Name()}"`);
        } else {
            this.#pack = pack;
            this.#min_tier_index = min_tier_index;
            this.#max_tier_index = max_tier_index;

            Object.freeze(this);
        }
    }

    Pack():
        Pack
    {
        return this.#pack;
    }

    Min_Tier_Index():
        Tier_Index
    {
        return this.#min_tier_index;
    }

    Max_Tier_Index():
        Tier_Index
    {
        return this.#max_tier_index;
    }

    Cards(card_count: Card_Count):
        Array<Card>
    {
        // It's guaranteed that at least one card exists in every tier, and that every pack has at least one tier.

        const min_tier_index: Tier_Index = this.Min_Tier_Index();
        const max_tier_index: Tier_Index = this.Max_Tier_Index();

        const results: Array<Card> = [];
        for (let idx = 0, end = card_count; idx < end; idx += 1) {
            const tier_index: Tier_Index = Utils.Random_Integer_Inclusive(min_tier_index, max_tier_index);
            const tier: Tier = this.#pack.Tier(tier_index);
            results.push(tier.Card(Utils.Random_Integer_Exclusive(0, tier.Card_Count())));
        }

        return results;
    }

    Unique_Cards(card_count: Card_Count):
        Array<Card>
    {
        const pack: Pack = this.Pack();
        const min_tier_index: Tier_Index = this.Min_Tier_Index();
        const max_tier_index: Tier_Index = this.Max_Tier_Index();

        const cards: Array<Card> = [];
        for (let idx = min_tier_index, end = max_tier_index + 1; idx < end; idx += 1) {
            cards.push(...pack.Tier(idx).Cards());
        }

        if (card_count > cards.length) {
            throw new Error(`The card_count exceeds the number of available unique cards.`);
        } else {
            const results: Array<Card> = [];
            for (let idx = 0, end = card_count; idx < end; idx += 1) {
                const card_index: Card_Index = Utils.Random_Integer_Exclusive(0, cards.length);
                results.push(cards[card_index]);
                cards[card_index] = cards[cards.length - 1];
                cards.pop();
            }

            return results;
        }
    }
}

export class Random_Shuffle extends Shuffle
{
    constructor(
        {
            packs,
            min_difficulty = Difficulty_e.VERY_EASY,
            max_difficulty = Difficulty_e.VERY_HARD,
            allow_multiple_difficulties = true,
        }: {
            packs: Array<Pack>,
            min_difficulty?: Difficulty_e,
            max_difficulty?: Difficulty_e,
            allow_multiple_difficulties?: boolean,
        },
    )
    {
        if (packs.length < 1) {
            throw new Error(`packs must have at least one pack to choose from.`);
        } else if (min_difficulty < 0 || min_difficulty > max_difficulty) {
            throw new Error(
                `min_difficulty of ${min_difficulty} is greater than max_difficulty of ${max_difficulty}.`
            );
        } else {
            const pack: Pack = packs[Utils.Random_Integer_Exclusive(0, packs.length)];

            let min_tier_index: Tier_Index = 0;
            let max_tier_index: Tier_Index = 0;
            if (allow_multiple_difficulties) {
                const from_difficulty: Difficulty_e =
                    Utils.Random_Integer_Inclusive(min_difficulty, max_difficulty);
                const to_difficulty: Difficulty_e =
                    Utils.Random_Integer_Inclusive(from_difficulty, max_difficulty);
                const from_tiers_by_difficulty: Array<Tier> =
                    pack.Tiers_By_Difficulty(from_difficulty);
                const to_tiers_by_difficulty: Array<Tier> =
                    pack.Tiers_By_Difficulty(to_difficulty);
                min_tier_index = from_tiers_by_difficulty[0].Index();
                max_tier_index = to_tiers_by_difficulty[to_tiers_by_difficulty.length - 1].Index();
            } else {
                const difficulty: Difficulty_e =
                    Utils.Random_Integer_Inclusive(min_difficulty, max_difficulty);
                const tiers_by_difficulty: Array<Tier> =
                    pack.Tiers_By_Difficulty(difficulty);
                min_tier_index = tiers_by_difficulty[0].Index();
                max_tier_index = tiers_by_difficulty[tiers_by_difficulty.length - 1].Index();
            }

            super(
                {
                    pack,
                    min_tier_index,
                    max_tier_index,
                }
            );
        }
    }
}

/* Contains a particular card and a count thereof. */
class Card_And_Count
{
    #card: Card;
    #count: Card_Count;

    constructor(
        {
            card,
            count,
        }: {
            card: Card,
            count: Card_Count,
        }
    )
    {
        if (count >= 0) {
            this.#card = card;
            this.#count = count;
        } else {
            throw new Error(`count must be greater than or equal to 0.`);
        }
    }

    Card():
        Card
    {
        return this.#card;
    }

    Count():
        Card_Count
    {
        return this.#count;
    }

    Add(card_count: Card_Count):
        void
    {
        if (this.#count + card_count < this.#count) {
            throw new Error(`Cannot add ${card_count} to the count.`);
        } else {
            this.#count += card_count;
        }
    }

    Subtract(card_count: Card_Count):
        void
    {
        if (this.#count - card_count > this.#count) {
            throw new Error(`Cannot subtract ${card_count} from the count.`);
        } else {
            this.#count -= card_count;
        }
    }

    Increment():
        void
    {
        this.Add(1);
    }

    Decrement():
        void
    {
        this.Subtract(1);
    }
}

/* Contains a list of individual cards drawn from a collection and their color, with possible repeats. */
export class Selection
{
    #collection: Collection;
    #color: Color;
    #cards: Array<Card>;
    #is_of_human: boolean;

    constructor(
        {
            collection,
            color,
            cards,
            is_of_human,
        }: {
            collection: Collection,
            color: Color,
            cards: Array<Card>,
            is_of_human: boolean,
        }
    )
    {
        if (cards.length < 1) {
            throw new Error(`Must have a least one card in the selection.`);
        } else {
            this.#collection = collection;
            this.#color = color;
            this.#cards = Array.from(cards);
            this.#is_of_human = is_of_human;

            Object.freeze(this);
            Object.freeze(this.#cards);
        }
    }

    Collection():
        Collection
    {
        return this.#collection;
    }

    Color():
        Color
    {
        return this.#color;
    }

    Is_Of_Human():
        boolean
    {
        return this.#is_of_human;
    }

    Is_Of_Computer():
        boolean
    {
        return !this.Is_Of_Human();
    }

    Card_Count():
        Card_Count
    {
        return this.#cards.length;
    }

    Card(card_index: Card_Index):
        Card
    {
        if (card_index >= 0 && card_index < this.Card_Count()) {
            return this.#cards[card_index];
        } else {
            throw new Error("Invalid card_index.");
        }
    }
}

/* Utilizes a manual supply of cards to create a selection. */
export type Manual_Selection =
    Selection;

/* Utilizes random generation of cards to create a selection. */
export class Random_Selection extends Selection
{
    constructor(
        {
            collection,
            color,
            is_of_human,

            card_count,
            allow_repeats = true,
            allow_multiple_packs = false,
        }: {
            collection: Collection,
            color: Color,
            is_of_human: boolean,

            card_count: Card_Count,
            allow_repeats?: boolean,
            allow_multiple_packs?: boolean,
        }
    )
    {
        if (card_count < 1) {
            throw new Error(`'card_count' must be greater than 0 for a selection.`);
        } else {
            const cards: Array<Card> = collection.Random_Cards({
                card_count,
                allow_repeats,
                allow_multiple_packs,
            });

            super({
                collection,
                color,
                cards,
                is_of_human,
            });
        }
    }
}

/* Contains RGBA values for a color. */
export class Color
{
    #red: number;
    #green: number;
    #blue: number;
    #alpha: number;

    constructor(
        {
            red = 0,
            green = 0,
            blue = 0,
            alpha = 1.0,
        }: {
            red?: number,
            green?: number,
            blue?: number,
            alpha?: number,
        }
    )
    {
        if (red < 0 || red > 255 ||
            green < 0 || green > 255 ||
            blue < 0 || blue > 255) {
            throw new Error(`Color must be from 0 to 255.`);
        } else if (alpha < 0.0 || alpha > 1.0) {
            throw new Error(`Alpha must be from 0.0 to 1.0`);
        } else {
            this.#red = red;
            this.#green = green;
            this.#blue = blue;
            this.#alpha = alpha;

            Object.freeze(this);
        }
    }

    Red():
        number
    {
        return this.#red;
    }

    Green():
        number
    {
        return this.#green;
    }

    Blue():
        number
    {
        return this.#blue;
    }

    Alpha():
        number
    {
        return this.#alpha;
    }

    Percent_Difference_From(other_color: Color):
        number
    {
        let percent_difference = 0;

        for (const [color_a, color_b] of
            [
                [this.Red(), other_color.Red()],
                [this.Green(), other_color.Green()],
                [this.Blue(), other_color.Blue()],
            ] as Array<[number, number]>
        ) {
            if (color_a > color_b) {
                percent_difference += (color_a - color_b) * 100 / 255;
            } else {
                percent_difference += (color_b - color_a) * 100 / 255;
            }
        }

        const alpha_a = this.Alpha();
        const alpha_b = other_color.Alpha();
        if (alpha_a > alpha_b) {
            percent_difference += (alpha_a - alpha_b) * 100;
        } else {
            percent_difference += (alpha_b - alpha_a) * 100;
        }

        return percent_difference / 4;
    }
}

export class Random_Color extends Color
{
    constructor(
        {
            min_red = 0,
            max_red = 255,

            min_green = 0,
            max_green = 255,

            min_blue = 0,
            max_blue = 255,

            min_alpha = 0.0,
            max_alpha = 1.0,
        }: {
            min_red?: number,
            max_red?: number,

            min_green?: number,
            max_green?: number,

            min_blue?: number,
            max_blue?: number,

            min_alpha?: number,
            max_alpha?: number,
        },
    )
    {
        if (min_red < 0 || min_red > max_red) {
            throw new Error(
                `min_red of ${min_red} is greater than max_red of ${max_red}.`
            );
        } else if (min_green < 0 || min_green > max_green) {
            throw new Error(
                `min_green of ${min_green} is greater than max_green of ${max_green}.`
            );
        } else if (min_blue < 0 || min_blue > max_blue) {
            throw new Error(
                `min_blue of ${min_blue} is greater than max_blue of ${max_blue}.`
            );
        } else if (min_alpha < 0 || min_alpha > max_alpha) {
            throw new Error(
                `min_alpha of ${min_alpha} is greater than max_alpha of ${max_alpha}.`
            );
        } else {
            super({
                red: Utils.Random_Integer_Inclusive(min_red, max_red),
                green: Utils.Random_Integer_Inclusive(min_green, max_green),
                blue: Utils.Random_Integer_Inclusive(min_blue, max_blue),
                alpha: Utils.Random_Float_Inclusive(min_alpha, max_alpha),
            });
        }
    }
}

export class Unique_Random_Colors
{
    #min_red: number;
    #max_red: number;

    #min_green: number;
    #max_green: number;

    #min_blue: number;
    #max_blue: number;

    #min_alpha: number;
    #max_alpha: number;

    #color_count: number;
    #colors: Array<Color>;

    #did_interpolate: boolean;

    constructor(
        {
            color_count,

            min_red = 0,
            max_red = 255,

            min_green = 0,
            max_green = 255,

            min_blue = 0,
            max_blue = 255,

            min_alpha = 0.0,
            max_alpha = 1.0,
        }: {
            color_count: Color_Count,

            min_red?: number,
            max_red?: number,

            min_green?: number,
            max_green?: number,

            min_blue?: number,
            max_blue?: number,

            min_alpha?: number,
            max_alpha?: number,
        }
    )
    {
        if (color_count < 0) {
            throw new Error(
                `color_count of ${color_count} is less than 0.`
            );
        } else if (min_red < 0 || min_red > max_red) {
            throw new Error(
                `min_red of ${min_red} is greater than max_red of ${max_red}.`
            );
        } else if (min_green < 0 || min_green > max_green) {
            throw new Error(
                `min_green of ${min_green} is greater than max_green of ${max_green}.`
            );
        } else if (min_blue < 0 || min_blue > max_blue) {
            throw new Error(
                `min_blue of ${min_blue} is greater than max_blue of ${max_blue}.`
            );
        } else if (min_alpha < 0 || min_alpha > max_alpha) {
            throw new Error(
                `min_alpha of ${min_alpha} is greater than max_alpha of ${max_alpha}.`
            );
        } else {
            this.#min_red = min_red;
            this.#max_red = max_red;

            this.#min_green = min_green;
            this.#max_green = max_green;

            this.#min_blue = min_blue;
            this.#max_blue = max_blue;

            this.#min_alpha = min_alpha;
            this.#max_alpha = max_alpha;

            this.#color_count = color_count;
            this.#colors = [];

            const min_percent_difference: number = this.#Min_Percent_Difference();
            const max_failure_count: number = 50;

            let failure_count: number = 0;
            while (this.#colors.length < color_count) {
                if (failure_count <= max_failure_count) {
                    const new_color: Random_Color = new Random_Color(
                        {
                            min_red,
                            max_red,

                            min_green,
                            max_green,

                            min_blue,
                            max_blue,

                            min_alpha,
                            max_alpha,
                        }
                    );

                    let is_different_enough: boolean = true;
                    for (const old_color of this.#colors) {
                        if (new_color.Percent_Difference_From(old_color) < min_percent_difference) {
                            failure_count += 1;
                            is_different_enough = false;
                            break;
                        }
                    }

                    if (is_different_enough) {
                        this.#colors.push(new_color);
                    }
                } else {
                    // temp
                    // we need to interpolate between the first two colors
                    // with the greatest difference.
                    this.#colors.push(new Random_Color(
                        {
                            min_red,
                            max_red,

                            min_green,
                            max_green,

                            min_blue,
                            max_blue,

                            min_alpha,
                            max_alpha,
                        }
                    ));
                }
            }

            this.#did_interpolate = failure_count > max_failure_count;

            Object.freeze(this.#colors);
            Object.freeze(this);
        }
    }

    Min_Red():
        number
    {
        return this.#min_red;
    }

    Max_Red():
        number
    {
        return this.#max_red;
    }

    Min_Green():
        number
    {
        return this.#min_green;
    }

    Max_Green():
        number
    {
        return this.#max_green;
    }

    Min_Blue():
        number
    {
        return this.#min_blue;
    }

    Max_Blue():
        number
    {
        return this.#max_blue;
    }

    Min_Alpha():
        number
    {
        return this.#min_alpha;
    }

    Max_Alpha():
        number
    {
        return this.#max_alpha;
    }

    Color_Count():
        Color_Count
    {
        return this.#color_count;
    }

    Color(color_index: Color_Index):
        Color
    {
        if (color_index == null || color_index < 0 || color_index > this.Color_Count()) {
            throw new Error(`Invalid color_index of ${color_index}.`)
        } else {
            return this.#colors[color_index];
        }
    }

    Colors():
        Array<Color>
    {
        return Array.from(this.#colors);
    }

    Did_Interpolate():
        boolean
    {
        return this.#did_interpolate;
    }

    #Min_Percent_Difference():
        number
    {
        if (this.#color_count > 0) {
            // if there were no ranges, the min_percent_difference would simply be
            // (100 / color_count), but because ranges are allowed, it's as if we're
            // only using a percentage of each color in the count. so we must multiply
            // the color_count by the average range's scale, such that if only 50% of
            // each range is used on average, then our equation would be
            // (100 / (color_count * 0.5)). this would make it so that upon comparison
            // of each random color generated, there must be a higher min_percent_difference
            // between the colors with these ranges, to ensure more uniqueness. Because
            // they randomly generating colors and not equally distributing them, we need to
            // further decrease the min_percent_difference to ensure that we can get as many
            // randomly unique colors upto the color_count as possible within reason.
            let total_decimal_of_ranges_used: number = 0;
            for (const [min, max] of
                [
                    [this.Min_Red(), this.Max_Red()],
                    [this.Min_Green(), this.Max_Green()],
                    [this.Min_Blue(), this.Max_Blue()],
                ] as Array<[number, number]>
            ) {
                total_decimal_of_ranges_used += (max - min) * 1.0 / 255;
            }
            total_decimal_of_ranges_used += (this.Max_Alpha() - this.Min_Alpha());

            const average_decimal_of_ranges_used: number = total_decimal_of_ranges_used / 4;
            const reasonable_decimal_of_randomness: number = 0.75;

            return 100 / (this.Color_Count() * average_decimal_of_ranges_used * reasonable_decimal_of_randomness);
        } else {
            return 0;
        }
    }
}

export type Player_And_Score_Count =
    Count;

export type Player_And_Score_Index =
    Index;

export type Player_And_Score = {
    player: Player,
    score: Score,
};

export class Scores
{
    #top_player_and_scores: Array<Player_And_Score>;
    #bottom_player_and_scores: Array<Player_And_Score>;

    constructor(
        {
            players,
        }: {
            players: Array<Player>,
        }
    )
    {
        const players_and_scores: Array<Player_And_Score> = [];
        for (const player of players) {
            const player_and_score = {
                player: player,
                score: player.Score(),
            };
            players_and_scores.push(player_and_score);
            Object.freeze(player_and_score);
        }

        let highest_score = Number.MIN_VALUE;
        let highest_scoring_players: Array<Player> = [];
        for (const { player, score } of players_and_scores) {
            if (score > highest_score) {
                highest_score = score;
                highest_scoring_players = [player];
            } else if (score === highest_score) {
                highest_scoring_players.push(player);
            }
        }

        this.#top_player_and_scores = [];
        this.#bottom_player_and_scores = [];
        for (const player_and_score of players_and_scores) {
            if (highest_scoring_players.includes(player_and_score.player)) {
                this.#top_player_and_scores.push(player_and_score);
            } else {
                this.#bottom_player_and_scores.push(player_and_score);
            }
        }

        this.#bottom_player_and_scores.sort(function (
            a: Player_And_Score,
            b: Player_And_Score,
        ):
            number
        {
            return b.score - a.score;
        });

        Object.freeze(this.#top_player_and_scores);
        Object.freeze(this.#bottom_player_and_scores);
        Object.freeze(this);
    }

    Top_Count():
        Player_And_Score_Count
    {
        return this.#top_player_and_scores.length;
    }

    Top(top_index: Player_And_Score_Index):
        Player_And_Score
    {
        if (top_index == null || top_index < 0 || top_index >= this.Top_Count()) {
            throw new Error(`Invalid top_index: ${top_index}.`);
        } else {
            return this.#top_player_and_scores[top_index];
        }
    }

    Bottom_Count():
        Player_And_Score_Count
    {
        return this.#bottom_player_and_scores.length;
    }

    Bottom(bottom_index: Player_And_Score_Index):
        Player_And_Score
    {
        if (bottom_index == null || bottom_index < 0 || bottom_index >= this.Bottom_Count()) {
            throw new Error(`Invalid bottom_index: ${bottom_index}.`);
        } else {
            return this.#bottom_player_and_scores[bottom_index];
        }
    }

    Highest_Score():
        Score
    {
        return this.#top_player_and_scores[0].score;
    }

    Lowest_Score():
        Score
    {
        if (this.Bottom_Count() > 0) {
            return this.#bottom_player_and_scores[this.Bottom_Count() - 1].score;
        } else {
            return this.#top_player_and_scores[0].score;
        }
    }

    Has_Winner():
        boolean
    {
        return this.Top_Count() === 1;
    }

    Has_Losers():
        boolean
    {
        return this.Has_Winner();
    }

    Has_Draws():
        boolean
    {
        return !this.Has_Winner();
    }

    Has_Non_Draws():
        boolean
    {
        return this.Has_Draws() && this.Bottom_Count() > 0;
    }

    Winner():
        Player_And_Score
    {
        if (this.Has_Winner()) {
            return this.#top_player_and_scores[0];
        } else {
            throw new Error(`There is no winner.`);
        }
    }

    Losers():
        Array<Player_And_Score>
    {
        if (this.Has_Losers()) {
            return this.#bottom_player_and_scores;
        } else {
            throw new Error(`There are no losers.`);
        }
    }

    Draws():
        Array<Player_And_Score>
    {
        if (this.Has_Draws()) {
            return this.#top_player_and_scores;
        } else {
            throw new Error(`There are no draws.`);
        }
    }

    Non_Draws():
        Array<Player_And_Score>
    {
        if (this.Has_Non_Draws()) {
            return this.#bottom_player_and_scores;
        } else {
            throw new Error(`There are no non-draws.`);
        }
    }
}

/* A selection of rules which an arena must abide by. */
export class Rules
{
    #row_count: Row_Count;
    #column_count: Column_Count;
    #cell_count: Cell_Count;
    #player_count: Player_Count;
    #selection_card_count: Card_Count;

    #open: boolean;
    #same: boolean;
    #plus: boolean;
    #wall: boolean;
    #combo: boolean;
    #random: boolean;

    constructor(
        {
            row_count = 3,
            column_count = 3,
            player_count = 2,

            open = true,
            same = true,
            plus = true,
            wall = true,
            combo = true,
            random = true, // temp until we get selection view up and running
        }: {
            row_count?: Row_Count,
            column_count?: Column_Count,
            player_count?: Player_Count,

            open?: boolean,
            same?: boolean,
            plus?: boolean,
            wall?: boolean,
            combo?: boolean,
            random?: boolean,
        }
    )
    {
        if (player_count < 2) {
            throw new Error(`Must have a player_count of at least 2.`);
        } else {
            this.#row_count = row_count;
            this.#column_count = column_count;
            this.#cell_count = this.#row_count * this.#column_count;
            this.#player_count = player_count;
            this.#selection_card_count = Math.ceil(this.#cell_count / this.#player_count);

            this.#open = open;
            this.#same = same;
            this.#plus = plus;
            this.#wall = wall;
            this.#combo = combo;
            this.#random = random;

            if (this.Player_Count() > this.Cell_Count()) {
                throw new Error(`A cell_count of ${this.Cell_Count()} is too few for a player_count of ${player_count}.`);
            }
        }
    }

    Clone():
        Rules
    {
        return new Rules({
            row_count: this.Row_Count(),
            column_count: this.Column_Count(),
            player_count: this.Player_Count(),

            open: this.Open(),
            same: this.Same(),
            plus: this.Plus(),
            wall: this.Wall(),
            combo: this.Combo(),
            random: this.Random(),
        });
    }

    Row_Count():
        Row_Count
    {
        return this.#row_count;
    }

    Column_Count():
        Column_Count
    {
        return this.#column_count;
    }

    Cell_Count():
        Cell_Count
    {
        return this.#cell_count;
    }

    Player_Count():
        Player_Count
    {
        return this.#player_count;
    }

    Selection_Card_Count():
        Card_Count
    {
        return this.#selection_card_count;
    }

    Open():
        boolean
    {
        return this.#open;
    }

    Same():
        boolean
    {
        return this.#same;
    }

    Plus():
        boolean
    {
        return this.#plus;
    }

    Wall():
        boolean
    {
        return this.#wall;
    }

    Combo():
        boolean
    {
        return this.#combo;
    }

    Random():
        boolean
    {
        return this.#random;
    }

    Serialize():
        Rules_Save_Data
    {
        return ({
            row_count: this.#row_count,
            column_count: this.#column_count,
            player_count: this.#player_count,

            open: this.#open,
            random: this.#random,
        });
    }
}

type Rules_Save_Data = {
    row_count: Row_Count,
    column_count: Column_Count,
    player_count: Player_Count,

    open: boolean,
    random: boolean,
}

export class Random_Rules extends Rules
{
    constructor(
        {
            min_row_count = 3,
            max_row_count = 6,

            min_column_count = 3,
            max_column_count = 6,

            min_player_count = 2,
            max_player_count = 8,

            allow_open = true,
            allow_same = true,
            allow_plus = true,
            allow_wall = true,
            allow_combo = true,
            allow_random = true,
        }: {
            min_row_count?: Row_Count,
            max_row_count?: Row_Count,

            min_column_count?: Column_Count,
            max_column_count?: Column_Count,

            min_player_count?: Player_Count,
            max_player_count?: Player_Count,

            allow_open?: boolean,
            allow_same?: boolean,
            allow_plus?: boolean,
            allow_wall?: boolean,
            allow_combo?: boolean,
            allow_random?: boolean,
        },
    )
    {
        if (min_row_count < 0 || min_row_count > max_row_count) {
            throw new Error(
                `min_row_count of ${min_row_count} is greater than max_row_count of ${max_row_count}.`
            );
        } else if (min_column_count < 0 || min_column_count > max_column_count) {
            throw new Error(
                `min_column_count of ${min_column_count} is greater than max_column_count of ${max_column_count}.`
            );
        } else if (min_player_count < 0 || min_player_count > max_player_count) {
            throw new Error(
                `min_player_count of ${min_player_count} is greater than max_player_count of ${max_player_count}.`
            );
        } else {
            super({
                row_count: Utils.Random_Integer_Inclusive(min_row_count, max_row_count),
                column_count: Utils.Random_Integer_Inclusive(min_column_count, max_column_count),
                player_count: Utils.Random_Integer_Inclusive(min_player_count, max_player_count),

                open: allow_open ?
                    Utils.Random_Boolean() :
                    false,
                same: allow_same ?
                    Utils.Random_Boolean() :
                    false,
                plus: allow_plus ?
                    Utils.Random_Boolean() :
                    false,
                wall: allow_wall ?
                    Utils.Random_Boolean() :
                    false,
                combo: allow_combo ?
                    Utils.Random_Boolean() :
                    false,
                random: allow_random ?
                    Utils.Random_Boolean() :
                    false,
            });
        }
    }
}

/* Contains stakes selected for a player. */
export class Player
{
    #arena: Arena;
    #index: Player_Index;
    #name: Player_Name;
    #selection: Selection;

    #stakes: Array<Stake>;
    #selected_stake_index: Stake_Index | null;

    constructor(
        {
            arena,
            index,
            name,
            selection,
        }: {
            arena: Arena,
            index: Player_Index,
            name: Player_Name,
            selection: Selection,
        }
    )
    {
        this.#arena = arena;
        this.#index = index;
        this.#name = name;
        this.#selection = selection;

        this.#stakes = [];
        this.#selected_stake_index = null;

        for (let idx = 0, end = selection.Card_Count(); idx < end; idx += 1) {
            this.#stakes.push(new Stake({
                origin: this,
                card: selection.Card(idx),
            }));
        }
    }

    Arena():
        Arena
    {
        return this.#arena;
    }

    Rules():
        Rules
    {
        return this.Arena().Rules();
    }

    Board():
        Board
    {
        return this.Arena().Board();
    }

    Index():
        Player_Index
    {
        return this.#index;
    }

    Name():
        Player_Name
    {
        return this.#name;
    }

    Selection():
        Selection
    {
        return this.#selection;
    }

    Color():
        Color
    {
        return this.Selection().Color();
    }

    Is_Human():
        boolean
    {
        return this.Selection().Is_Of_Human();
    }

    Is_Computer():
        boolean
    {
        return !this.Is_Human();
    }

    Stake_Count():
        Stake_Count
    {
        return this.#stakes.length;
    }

    Stake(stake_index: Stake_Index):
        Stake
    {
        if (stake_index >= 0 && stake_index < this.Stake_Count()) {
            return this.#stakes[stake_index];
        } else {
            throw new Error(`Invalid stake_index.`);
        }
    }

    Stakes():
        Array<Stake>
    {
        return Array.from(this.#stakes);
    }

    Has_Stake(stake: Stake):
        boolean
    {
        return this.#stakes.includes(stake);
    }

    Select_Stake(stake_index: Stake_Index | null):
        void
    {
        if (stake_index == null) {
            this.#selected_stake_index = null;
        } else if (stake_index >= 0 && stake_index < this.Stake_Count()) {
            this.#selected_stake_index = stake_index;
        } else {
            throw new Error(`Invalid stake_index.`);
        }
    }

    Selected_Stake_Index():
        Stake_Index | null
    {
        return this.#selected_stake_index;
    }

    Selected_Stake():
        Stake | null
    {
        if (this.#selected_stake_index != null) {
            return this.Stake(this.#selected_stake_index);
        } else {
            return null;
        }
    }

    Has_Selected_Stake():
        boolean
    {
        return this.Selected_Stake() != null;
    }

    Remove_Selected_Stake():
        Stake
    {
        if (this.#selected_stake_index != null) {
            const selected_stake: Stake = this.#stakes[this.#selected_stake_index];

            if (this.Stake_Count() > 1) {
                for (let idx = this.#selected_stake_index + 1, end = this.Stake_Count(); idx < end; idx += 1) {
                    this.#stakes[idx - 1] = this.#stakes[idx];
                }
            }
            this.#stakes.pop();

            this.#selected_stake_index = null;

            return selected_stake;
        } else {
            throw new Error(`No selected stake to remove.`);
        }
    }

    Is_On_Turn():
        boolean
    {
        if (this.Arena().Is_Game_Over()) {
            return false;
        } else {
            return this.Arena().Current_Player() === this;
        }
    }

    Score():
        Score
    {
        return this.Stake_Count() + this.Board().Claim_Count(this);
    }
}

export class Human_Player extends Player
{
}

export class Computer_Player extends Player
{
    async Choose_Stake_And_Cell():
        Promise<{
            selection_indices: Array<Stake_Index>,
            cell_index: Cell_Index,
        }>
    {
        const {
            stake_index,
            cell_index,
        } = await this.Board().Choose_Stake_And_Cell(this);

        // used to give the impression that the ai is choosing a stake. smoothly lands on the stake it selects.
        // we can add other impression algorithms heres and choose them randomly
        const stake_count = this.Stake_Count();
        const selection_indices: Array<Stake_Index> = [stake_index];
        let selection_index: Stake_Index = stake_index;
        let selection_step_count: Count = Utils.Random_Integer_Inclusive(1, Math.min(stake_count * 1.5, 8)) - 1;
        while (selection_step_count > 0) {
            selection_step_count -= 1;
            if (Utils.Random_Boolean()) {
                if (selection_index > 0) {
                    selection_index -= 1;
                } else {
                    selection_index = stake_count - 1;
                }
            } else {
                if (selection_index < stake_count - 1) {
                    selection_index += 1;
                } else {
                    selection_index = 0;
                }
            }
            selection_indices.push(selection_index);
        }

        return ({
            selection_indices: selection_indices.reverse(),
            cell_index,
        });
    }
}

/* Contains a card either on a player or on the board, and its origin. */
export class Stake
{
    #origin: Player;
    #card: Card;

    constructor(
        {
            origin,
            card,
        }: {
            origin: Player,
            card: Card,
        }
    )
    {
        this.#origin = origin;
        this.#card = card;

        Object.freeze(this);
    }

    Arena():
        Arena
    {
        return this.Origin().Arena();
    }

    Board():
        Board
    {
        return this.Origin().Arena().Board();
    }

    Origin():
        Player
    {
        return this.#origin;
    }

    Is_Of_Human():
        boolean
    {
        return this.Origin().Is_Human();
    }

    Is_Of_Computer():
        boolean
    {
        return !this.Is_Of_Human();
    }

    Card():
        Card
    {
        return this.#card;
    }

    Color():
        Color
    {
        return this.Origin().Color();
    }

    Is_On_Player():
        boolean
    {
        return this.Origin().Has_Stake(this);
    }

    Is_On_Board():
        boolean
    {
        return !this.Is_On_Player();
    }

    Is_Selected():
        boolean
    {
        return this.Origin().Selected_Stake() === this;
    }

    Is_Selectable():
        boolean
    {
        return !this.Is_Selected() && this.Is_On_Player() && this.Origin().Is_On_Turn();
    }
}

/* Contains claims actively in play. */
export class Board
{
    #arena: Arena;
    #cells: Array<Cell>;

    constructor(
        {
            arena,
            cells,
        }: {
            arena: Arena,
            cells?: Array<Cell>,
        },
    )
    {
        this.#arena = arena;
        this.#cells = [];
        if (cells != null) {
            if (cells.length !== this.Cell_Count()) {
                throw new Error(`'cells' must have a length of ${this.Cell_Count()}.`);
            } else {
                for (let idx = 0, end = cells.length; idx < end; idx += 1) {
                    this.#cells.push(cells[idx].Clone());
                }
            }
        } else {
            for (let idx = 0, end = this.Cell_Count(); idx < end; idx += 1) {
                this.#cells.push(new Cell());
            }
        }

        Object.freeze(this);
    }

    Clone():
        Board
    {
        return new Board(
            {
                arena: this.#arena,
                cells: this.#cells,
            },
        );
    }

    Arena():
        Arena
    {
        return this.#arena;
    }

    Rules():
        Rules
    {
        return this.Arena().Rules();
    }

    Row_Count():
        Row_Count
    {
        return this.Rules().Row_Count();
    }

    Column_Count():
        Column_Count
    {
        return this.Rules().Column_Count();
    }

    Cell_Count():
        Cell_Count
    {
        return this.Rules().Cell_Count();
    }

    Cell(cell_index: Cell_Index):
        Cell
    {
        if (cell_index >= 0 && cell_index < this.#cells.length) {
            return this.#cells[cell_index];
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Cells():
        Array<Cell>
    {
        return Array.from(this.#cells);
    }

    Left_Of(cell_index: Cell_Index):
        Cell | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.#cells.length) {
            const column_count = this.Column_Count();
            if (cell_index % column_count !== 0) {
                return this.Cell(cell_index - 1);
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Top_Of(cell_index: Cell_Index):
        Cell | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.#cells.length) {
            const column_count = this.Column_Count();
            if (cell_index >= column_count) {
                return this.Cell(cell_index - column_count);
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Right_Of(cell_index: Cell_Index):
        Cell | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.#cells.length) {
            const column_count = this.Column_Count();
            if (cell_index % column_count !== column_count - 1) {
                return this.Cell(cell_index + 1);
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Bottom_Of(cell_index: Cell_Index):
        Cell | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.#cells.length) {
            const column_count = this.Column_Count();
            const cell_count = this.Cell_Count();
            if (cell_index < cell_count - column_count) {
                return this.Cell(cell_index + column_count);
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Left_Index_Of(cell_index: Cell_Index):
        Cell_Index | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.#cells.length) {
            const column_count = this.Column_Count();
            if (cell_index % column_count !== 0) {
                return cell_index - 1;
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Top_Index_Of(cell_index: Cell_Index):
        Cell_Index | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.#cells.length) {
            const column_count = this.Column_Count();
            if (cell_index >= column_count) {
                return cell_index - column_count;
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Right_Index_Of(cell_index: Cell_Index):
        Cell_Index | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.#cells.length) {
            const column_count = this.Column_Count();
            if (cell_index % column_count !== column_count - 1) {
                return cell_index + 1;
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Bottom_Index_Of(cell_index: Cell_Index):
        Cell_Index | Wall
    {
        if (cell_index != null && cell_index >= 0 && cell_index < this.#cells.length) {
            const column_count = this.Column_Count();
            const cell_count = this.Cell_Count();
            if (cell_index < cell_count - column_count) {
                return cell_index + column_count;
            } else {
                return new Wall();
            }
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Defense_Of(stake: Stake, in_cell_index: Cell_Index):
        Defense
    {
        const card: Card = stake.Card();

        let min_defense: Min = Number.MAX_VALUE;
        let max_defense: Max = 0;
        let defense_count: Defense_Count = 0;
        let defense_sum: number = 0;

        for (const { cell_or_wall, card_value } of [
            {
                cell_or_wall: this.Left_Of(in_cell_index),
                card_value: card.Left(),
            },
            {
                cell_or_wall: this.Top_Of(in_cell_index),
                card_value: card.Top(),
            },
            {
                cell_or_wall: this.Right_Of(in_cell_index),
                card_value: card.Right(),
            },
            {
                cell_or_wall: this.Bottom_Of(in_cell_index),
                card_value: card.Bottom(),
            },
        ]) {
            if (cell_or_wall instanceof Cell && (cell_or_wall as Cell).Is_Empty()) {
                if (card_value < min_defense) {
                    min_defense = card_value;
                }
                if (card_value > max_defense) {
                    max_defense = card_value;
                }
                defense_count += 1;
                defense_sum += card_value;
            }
        }

        const defense = defense_count > 0 ?
            (defense_sum - (max_defense - min_defense)) / defense_count :
            Number.MAX_VALUE;

        return defense;
    }

    Defense_Count_Of(cell_index: Cell_Index):
        Defense_Count
    {
        let defense_count: Defense_Count = 0;

        for (const cell_or_wall of [
            this.Left_Of(cell_index),
            this.Top_Of(cell_index),
            this.Right_Of(cell_index),
            this.Bottom_Of(cell_index),
        ]) {
            if (cell_or_wall instanceof Cell && (cell_or_wall as Cell).Is_Empty()) {
                defense_count += 1;
            }
        }

        return defense_count;
    }

    Claim_Count(player: Player):
        Claim_Count
    {
        let claim_count: Claim_Count = 0;
        for (const cell of this.#cells) {
            if (cell.Is_Occupied() && cell.Claimant() === player) {
                claim_count += 1;
            }
        }

        return claim_count;
    }

    async Place_Current_Player_Selected_Stake(cell_index: Cell_Index):
        Promise<Turn_Result_Steps>
    {
        if (this.Arena().Is_Game_Over()) {
            throw new Error(`Cannot place any more stakes, as the game is over.`);
        } else {
            if (this.Cell(cell_index).Is_Occupied()) {
                throw new Error(`Claim already exists in cell_index ${cell_index}.`);
            } else {
                const current_player: Player = this.Current_Player();
                const selected_stake: Stake = current_player.Remove_Selected_Stake();

                return this.#Place_Stake(selected_stake, cell_index);
            }
        }
    }

    async Place_Stake(stake: Stake, cell_index: Cell_Index):
        Promise<Turn_Result_Steps>
    {
        if (this.Arena().Is_Game_Over()) {
            throw new Error(`Cannot place any more stakes, as the game is over.`);
        } else {
            if (this.Cell(cell_index).Is_Occupied()) {
                throw new Error(`Claim already exists in cell_index ${cell_index}.`);
            } else {
                return this.#Place_Stake(stake, cell_index);
            }
        }
    }

    async #Place_Stake(stake: Stake, cell_index: Cell_Index):
        Promise<Turn_Result_Steps>
    {
        this.#cells[cell_index] = new Cell(
            {
                stake: stake,
                claimant: stake.Origin(),
            },
        );

        const turn_results: Turn_Results = new Turn_Results();
        await this.#Evaluate_Cell(cell_index, turn_results, 0);

        return turn_results.Steps();
    }

    /*
        This updates adjacent cards by evaluating the rules
        when a card is placed in a particular cell_index.
        It recursively calls itself for other cards in cell_indices
        that have already been placed, but only when a combo occurs.
    */
    async #Evaluate_Cell(
        cell_index: Cell_Index,
        turn_results: Turn_Results,
        step_count: Step_Count,
    ):
        Promise<void>
    {
        const center_index: Cell_Index = cell_index;
        const center_cell: Cell = this.Cell(center_index);
        const center_card: Card = center_cell.Stake().Card();
        const center_player: Player = center_cell.Claimant();
        const center_turn_result: Turn_Result = turn_results.At(center_index);

        const left_index: Cell_Index | Wall = this.Left_Index_Of(center_index);
        const left_cell: Cell | Wall = left_index instanceof Wall ?
            left_index :
            this.Cell(left_index);
        let left_claimed: boolean = false;
        let left_combos: boolean = false;

        const top_index: Cell_Index | Wall = this.Top_Index_Of(center_index);
        const top_cell: Cell | Wall = top_index instanceof Wall ?
            top_index :
            this.Cell(top_index);
        let top_claimed: boolean = false;
        let top_combos: boolean = false;

        const right_index: Cell_Index | Wall = this.Right_Index_Of(center_index);
        const right_cell: Cell | Wall = right_index instanceof Wall ?
            right_index :
            this.Cell(right_index);
        let right_claimed: boolean = false;
        let right_combos: boolean = false;

        const bottom_index: Cell_Index | Wall = this.Bottom_Index_Of(center_index);
        const bottom_cell: Cell | Wall = bottom_index instanceof Wall ?
            bottom_index :
            this.Cell(bottom_index);
        let bottom_claimed: boolean = false;
        let bottom_combos: boolean = false;

        if (this.Rules().Same()) {
            const sames: { [index: Card_Number]: Array<Cell_Index | Wall> } = {};

            // first we get all instances of where same can occur, to cache
            // what cards can be claimed, and if the rule has enough counts, including wall
            for (const [cell, index, center_card_value, cell_card_value] of [
                [
                    left_cell,
                    left_index,
                    center_card.Left(),
                    (card: Card) => card.Right(),
                ],
                [
                    top_cell,
                    top_index,
                    center_card.Top(),
                    (card: Card) => card.Bottom(),
                ],
                [
                    right_cell,
                    right_index,
                    center_card.Right(),
                    (card: Card) => card.Left(),
                ],
                [
                    bottom_cell,
                    bottom_index,
                    center_card.Bottom(),
                    (card: Card) => card.Top(),
                ],
            ] as Array<
                [
                    Cell | Wall,
                    Cell_Index | Wall,
                    Card_Number,
                    (card: Card) => Card_Number,
                ]
            >) {
                if (cell instanceof Cell && cell.Is_Occupied() && cell.Claimant() !== center_player) {
                    const card: Card = cell.Stake().Card();
                    if (center_card_value === cell_card_value(card)) {
                        if (sames[center_card_value] == null) {
                            sames[center_card_value] = [];
                        }
                        sames[center_card_value].push(index as Cell_Index);
                    }
                } else if (cell instanceof Wall && this.Rules().Wall()) {
                    if (center_card_value === 10) {
                        if (sames[center_card_value] == null) {
                            sames[center_card_value] = [];
                        }
                        sames[center_card_value].push(index as Wall);
                    }
                }
            }

            // we remove any that does not include 2 or more indices, which satisfies the rules.
            // we also remove any that would result in no additional claims, i.e. if it just matches walls.
            const same_array: Array<Array<Cell_Index | Wall>> = Object.values(sames).filter(function (
                same: Array<Cell_Index | Wall>,
            ):
                boolean
            {
                if (same.length >= 2) {
                    for (const index of same) {
                        if (index instanceof Wall === false) {
                            return true;
                        }
                    }

                    return false;
                } else {
                    return false;
                }
            });

            for (const same of same_array) {
                for (const index of same) {
                    if (index === left_index) {
                        if (index instanceof Wall === false) {
                            left_claimed = true;
                            left_combos = true;
                        }
                        center_turn_result.same.left = true;
                    } else if (index === top_index) {
                        if (index instanceof Wall === false) {
                            top_claimed = true;
                            top_combos = true;
                        }
                        center_turn_result.same.top = true;
                    } else if (index === right_index) {
                        if (index instanceof Wall === false) {
                            right_claimed = true;
                            right_combos = true;
                        }
                        center_turn_result.same.right = true;
                    } else if (index === bottom_index) {
                        if (index instanceof Wall === false) {
                            bottom_claimed = true;
                            bottom_combos = true;
                        }
                        center_turn_result.same.bottom = true;
                    }
                }
            }
        }

        if (this.Rules().Plus()) {
            const sums: { [index: Card_Number]: Array<Cell_Index | Wall> } = {};

            // first we get all instances of where plus can occur, to cache
            // what cards can be claimed, and if the rule has enough counts, including wall
            for (const [cell, index, center_card_value, cell_card_value] of [
                [
                    left_cell,
                    left_index,
                    center_card.Left(),
                    (card: Card) => card.Right(),
                ],
                [
                    top_cell,
                    top_index,
                    center_card.Top(),
                    (card: Card) => card.Bottom(),
                ],
                [
                    right_cell,
                    right_index,
                    center_card.Right(),
                    (card: Card) => card.Left(),
                ],
                [
                    bottom_cell,
                    bottom_index,
                    center_card.Bottom(),
                    (card: Card) => card.Top(),
                ],
            ] as Array<
                [
                    Cell | Wall,
                    Cell_Index | Wall,
                    Card_Number,
                    (card: Card) => Card_Number,
                ]
            >) {
                if (cell instanceof Cell && cell.Is_Occupied() && cell.Claimant() !== center_player) {
                    const card: Card = cell.Stake().Card();
                    const sum = center_card_value + cell_card_value(card);
                    if (sums[sum] == null) {
                        sums[sum] = [];
                    }
                    sums[sum].push(index as Cell_Index);
                } else if (cell instanceof Wall && this.Rules().Wall()) {
                    const sum = center_card_value + 10;
                    if (sums[sum] == null) {
                        sums[sum] = [];
                    }
                    sums[sum].push(index as Wall);
                }
            }

            // we remove any that does not include 2 or more indices, which satisfies the rules.
            // we also remove any that would result in no additional claims, i.e. if it just matches walls.
            const sum_array: Array<Array<Cell_Index | Wall>> = Object.values(sums).filter(function (
                sum: Array<Cell_Index | Wall>,
            ):
                boolean
            {
                if (sum.length >= 2) {
                    for (const index of sum) {
                        if (index instanceof Wall === false) {
                            return true;
                        }
                    }

                    return false;
                } else {
                    return false;
                }
            });

            for (const sum of sum_array) {
                for (const index of sum) {
                    if (index === left_index) {
                        if (index instanceof Wall === false) {
                            left_claimed = true;
                            left_combos = true;
                        }
                        center_turn_result.plus.left = true;
                    } else if (index === top_index) {
                        if (index instanceof Wall === false) {
                            top_claimed = true;
                            top_combos = true;
                        }
                        center_turn_result.plus.top = true;
                    } else if (index === right_index) {
                        if (index instanceof Wall === false) {
                            right_claimed = true;
                            right_combos = true;
                        }
                        center_turn_result.plus.right = true;
                    } else if (index === bottom_index) {
                        if (index instanceof Wall === false) {
                            bottom_claimed = true;
                            bottom_combos = true;
                        }
                        center_turn_result.plus.bottom = true;
                    }
                }
            }
        }

        if (left_cell instanceof Cell && left_cell.Is_Occupied() && left_cell.Claimant() !== center_player) {
            const left_card: Card = left_cell.Stake().Card();
            if (center_card.Left() > left_card.Right()) {
                left_claimed = true;
            }
        }
        if (top_cell instanceof Cell && top_cell.Is_Occupied() && top_cell.Claimant() !== center_player) {
            const top_card: Card = top_cell.Stake().Card();
            if (center_card.Top() > top_card.Bottom()) {
                top_claimed = true;
            }
        }
        if (right_cell instanceof Cell && right_cell.Is_Occupied() && right_cell.Claimant() !== center_player) {
            const right_card: Card = right_cell.Stake().Card();
            if (center_card.Right() > right_card.Left()) {
                right_claimed = true;
            }
        }
        if (bottom_cell instanceof Cell && bottom_cell.Is_Occupied() && bottom_cell.Claimant() !== center_player) {
            const bottom_card: Card = bottom_cell.Stake().Card();
            if (center_card.Bottom() > bottom_card.Top()) {
                bottom_claimed = true;
            }
        }

        if (left_claimed) {
            this.#cells[left_index as Cell_Index] = new Cell(
                {
                    stake: (left_cell as Cell).Stake(),
                    claimant: center_player,
                },
            );

            const left_turn_result: Turn_Result = turn_results.At(left_index as Cell_Index);
            left_turn_result.direction = Direction_e.LEFT;
            left_turn_result.old_color = (left_cell as Cell).Color();
            left_turn_result.step = step_count + 1;
        }
        if (top_claimed) {
            this.#cells[top_index as Cell_Index] = new Cell(
                {
                    stake: (top_cell as Cell).Stake(),
                    claimant: center_player,
                },
            );

            const top_turn_result: Turn_Result = turn_results.At(top_index as Cell_Index);
            top_turn_result.direction = Direction_e.TOP;
            top_turn_result.old_color = (top_cell as Cell).Color();
            top_turn_result.step = step_count + 1;
        }
        if (right_claimed) {
            this.#cells[right_index as Cell_Index] = new Cell(
                {
                    stake: (right_cell as Cell).Stake(),
                    claimant: center_player,
                },
            );

            const right_turn_result: Turn_Result = turn_results.At(right_index as Cell_Index);
            right_turn_result.direction = Direction_e.RIGHT;
            right_turn_result.old_color = (right_cell as Cell).Color();
            right_turn_result.step = step_count + 1;
        }
        if (bottom_claimed) {
            this.#cells[bottom_index as Cell_Index] = new Cell(
                {
                    stake: (bottom_cell as Cell).Stake(),
                    claimant: center_player,
                },
            );

            const bottom_turn_result: Turn_Result = turn_results.At(bottom_index as Cell_Index);
            bottom_turn_result.direction = Direction_e.BOTTOM;
            bottom_turn_result.old_color = (bottom_cell as Cell).Color();
            bottom_turn_result.step = step_count + 1;
        }

        if (this.Rules().Combo()) {
            if (center_turn_result.step > 0) {
                if (left_claimed || top_claimed || right_claimed || bottom_claimed) {
                    center_turn_result.combo = true;
                }
            }

            const cell_indices_to_combo: Array<Cell_Index> = [];
            if (left_combos) {
                cell_indices_to_combo.push(left_index as Cell_Index);
            }
            if (top_combos) {
                cell_indices_to_combo.push(top_index as Cell_Index);
            }
            if (right_combos) {
                cell_indices_to_combo.push(right_index as Cell_Index);
            }
            if (bottom_combos) {
                cell_indices_to_combo.push(bottom_index as Cell_Index);
            }

            for (const cell_index_to_combo of cell_indices_to_combo) {
                await this.#Evaluate_Cell(cell_index_to_combo, turn_results, step_count + 1);
            }
        }
    }

    async Choose_Stake_And_Cell(computer_player: Computer_Player):
        Promise<{
            stake_index: Stake_Index,
            cell_index: Cell_Index,
        }>
    {
        // if the 'open' rule is in play, we can actually let this part look at all the other player's cards
        // to help choose which stake a computer_player will play. however, we're avoiding that altogether
        // for now for the sake of simplicity.

        class Choices
        {
            #placements: { [index: Claim_Delta]: Placements };

            constructor()
            {
                this.#placements = {};
            }

            Add(
                claim_delta: Claim_Delta,
                stake_index: Stake_Index,
                cell_index: Cell_Index,
            ):
                void
            {
                if (this.#placements[claim_delta] == null) {
                    this.#placements[claim_delta] = new Placements();
                }

                this.#placements[claim_delta].Push(stake_index, cell_index);
            }

            Claim_Deltas():
                Array<Claim_Delta>
            {
                return Object.keys(this.#placements).map(function (value: string):
                    Claim_Delta
                {
                    return parseInt(value) as Claim_Delta;
                }).sort(function (a: Claim_Delta, b: Claim_Delta):
                    number
                {
                    return a - b;
                });
            }

            Min_Claim_Delta():
                Claim_Delta
            {
                const claim_deltas = this.Claim_Deltas();
                if (claim_deltas.length < 1) {
                    throw new Error(`Has no claim_deltas.`);
                } else {
                    return Math.min(...claim_deltas);
                }
            }

            Max_Claim_Delta():
                Claim_Delta
            {
                const claim_deltas = this.Claim_Deltas();
                if (claim_deltas.length < 1) {
                    throw new Error(`Has no claim_deltas.`);
                } else {
                    return Math.max(...claim_deltas);
                }
            }

            Placements(claim_delta: Claim_Delta):
                Placements
            {
                if (this.#placements[claim_delta] == null) {
                    throw new Error(`Has no placements with a 'claim_delta' of ${claim_delta}.`);
                } else {
                    return this.#placements[claim_delta];
                }
            }

            Min_Claim_Placements():
                Placements
            {
                return this.#placements[this.Min_Claim_Delta()];
            }

            Max_Claim_Placements():
                Placements
            {
                return this.#placements[this.Max_Claim_Delta()];
            }
        }

        class Placements
        {
            #stake_indices: Array<Stake_Index>;
            #cell_indices: Array<Cell_Index>;

            constructor()
            {
                this.#stake_indices = [];
                this.#cell_indices = [];
            }

            Push(
                stake_index: Stake_Index,
                cell_index: Cell_Index,
            ):
                void
            {
                this.#stake_indices.push(stake_index);
                this.#cell_indices.push(cell_index);
            }

            Count():
                Count
            {
                return this.#stake_indices.length;
            }

            Random():
                {
                    stake_index: Stake_Index,
                    cell_index: Cell_Index,
                }
            {
                const index: Index = Utils.Random_Integer_Exclusive(0, this.#stake_indices.length);

                return (
                    {
                        stake_index: this.#stake_indices[index],
                        cell_index: this.#cell_indices[index],
                    }
                );
            }

            Filter_By_Best_Defense(board: Board, player: Player):
                Placements
            {
                let results = new Placements();

                let best_defense: number = 0;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake_Index = this.#stake_indices[idx];
                    const cell_index: Cell_Index = this.#cell_indices[idx];

                    const defense = board.Defense_Of(player.Stake(stake_index), cell_index);
                    if (defense > best_defense) {
                        best_defense = defense;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (defense === best_defense) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }

            Filter_By_Worst_Defense(board: Board, player: Player):
                Placements
            {
                let results = new Placements();

                let worst_defense: number = Number.MAX_VALUE;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake_Index = this.#stake_indices[idx];
                    const cell_index: Cell_Index = this.#cell_indices[idx];

                    const defense = board.Defense_Of(player.Stake(stake_index), cell_index);
                    if (defense < worst_defense) {
                        worst_defense = defense;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (defense === worst_defense) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }

            Filter_By_Biggest_Defense(board: Board):
                Placements
            {
                let results = new Placements();

                let biggest_defense: number = -1;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake_Index = this.#stake_indices[idx];
                    const cell_index: Cell_Index = this.#cell_indices[idx];

                    const defense_count = board.Defense_Count_Of(cell_index);
                    if (defense_count > biggest_defense) {
                        biggest_defense = defense_count;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (defense_count === biggest_defense) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }

            Filter_By_Smallest_Defense(board: Board):
                Placements
            {
                let results = new Placements();

                let smallest_defense: number = Number.MAX_VALUE;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake_Index = this.#stake_indices[idx];
                    const cell_index: Cell_Index = this.#cell_indices[idx];

                    const defense_count = board.Defense_Count_Of(cell_index);
                    if (defense_count < smallest_defense) {
                        smallest_defense = defense_count;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (defense_count === smallest_defense) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }

            Filter_By_Most_Value(player: Player):
                Placements
            {
                let results = new Placements();

                let most_value = 0;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake_Index = this.#stake_indices[idx];
                    const cell_index: Cell_Index = this.#cell_indices[idx];
                    const card: Card = player.Stake(stake_index).Card();

                    const value_sum = card.Left() + card.Top() + card.Right() + card.Bottom();
                    if (value_sum > most_value) {
                        most_value = value_sum;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (value_sum === most_value) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }

            Filter_By_Least_Value(player: Player):
                Placements
            {
                let results = new Placements();

                let least_value = Number.MAX_VALUE;
                for (let idx = 0, end = this.Count(); idx < end; idx += 1) {
                    const stake_index: Stake_Index = this.#stake_indices[idx];
                    const cell_index: Cell_Index = this.#cell_indices[idx];
                    const card: Card = player.Stake(stake_index).Card();

                    const value_sum = card.Left() + card.Top() + card.Right() + card.Bottom();
                    if (value_sum < least_value) {
                        least_value = value_sum;
                        results = new Placements();
                        results.Push(stake_index, cell_index);
                    } else if (value_sum === least_value) {
                        results.Push(stake_index, cell_index);
                    }
                }

                return results;
            }
        };

        // we need to figure out what stakes in which cells have the greatest increase in claims.
        // then we can determine if this computer_player will want to play offensively or defensively.
        const current_claim_count: Claim_Count = this.Claim_Count(computer_player);
        const choices: Choices = new Choices();
        for (const [cell_index, cell] of this.#cells.entries()) {
            if (cell.Is_Empty()) {
                for (const [stake_index, stake] of computer_player.Stakes().entries()) {
                    const new_board = this.Clone();
                    await new_board.Place_Stake(stake, cell_index);

                    const claim_delta = new_board.Claim_Count(computer_player) - current_claim_count;
                    choices.Add(claim_delta, stake_index, cell_index);
                }
            }
        }

        const max_claim_delta = choices.Max_Claim_Delta();
        if (max_claim_delta > 1) {
            // offensive mode
            // claim as many cards on the board as possible with the least valuable card
            const max_claim_placements = choices.Max_Claim_Placements();
            const best_defense_placements = max_claim_placements.Filter_By_Best_Defense(this, computer_player);
            const least_value_placements = best_defense_placements.Filter_By_Least_Value(computer_player);

            return least_value_placements.Random();
        } else {
            // defensive mode
            const min_claim_placements = choices.Min_Claim_Placements();
            const biggest_defense_placements = min_claim_placements.Filter_By_Biggest_Defense(this);
            if (Utils.Random_Boolean() && this.Defense_Count_Of(biggest_defense_placements.Random().cell_index) >= 2) {
                // bait mode
                // place the least valuable yet easily re-claimable card on the board
                const worst_defense_placements = biggest_defense_placements.Filter_By_Worst_Defense(this, computer_player);
                const least_value_placements = worst_defense_placements.Filter_By_Least_Value(computer_player);

                return least_value_placements.Random();
            } else {
                // turtle mode
                // place the most defensible yet least valuable card on the board
                const smallest_defense_placements = min_claim_placements.Filter_By_Smallest_Defense(this);
                const best_defense_placements = smallest_defense_placements.Filter_By_Best_Defense(this, computer_player);
                const least_value_placements = best_defense_placements.Filter_By_Least_Value(computer_player);

                return least_value_placements.Random();
            }
        }
    }

    Current_Player():
        Player
    {
        return this.Arena().Current_Player();
    }

    Current_Player_Index():
        Player_Index
    {
        return this.Arena().Current_Player_Index();
    }

    Is_On_Human_Turn():
        boolean
    {
        return this.Arena().Is_On_Human_Turn();
    }

    Is_On_Computer_Turn():
        boolean
    {
        return this.Arena().Is_On_Computer_Turn();
    }

    Is_Cell_Selectable(cell_index: Cell_Index):
        boolean
    {
        if (this.Arena().Is_Game_Over()) {
            return false;
        } else {
            return this.Current_Player().Has_Selected_Stake() && this.Cell(cell_index).Is_Empty();
        }
    }
}

/* Represents an empty cell or a player that's making a claim on a stake. */
export class Cell
{
    #stake: Stake | null;
    #claimant: Player | null;

    constructor(
        occupant?: {
            stake: Stake,
            claimant: Player,
        },
    )
    {
        if (occupant != null) {
            this.#stake = occupant.stake;
            this.#claimant = occupant.claimant;
        } else {
            this.#stake = null;
            this.#claimant = null;
        }

        Object.freeze(this);
    }

    Clone():
        Cell
    {
        if (this.Is_Occupied()) {
            return new Cell(
                {
                    stake: this.#stake as Stake,
                    claimant: this.#claimant as Player,
                },
            );
        } else {
            return new Cell();
        }
    }

    Is_Empty():
        boolean
    {
        return this.#stake == null;
    }

    Is_Occupied():
        boolean
    {
        return !this.Is_Empty();
    }

    Stake():
        Stake
    {
        if (this.#stake == null) {
            throw new Error(`This cell is not occupied.`);
        } else {
            return this.#stake;
        }
    }

    Claimant():
        Player
    {
        if (this.#claimant == null) {
            throw new Error(`This cell is not occupied.`);
        } else {
            return this.#claimant;
        }
    }

    Color():
        Color
    {
        return this.Claimant().Color();
    }
}

/* Represents a border on the board, which can be relevant according to the rules. */
export class Wall
{
}

class Turn_Results
{
    #turn_results: { [index: Cell_Index]: Turn_Result };

    constructor()
    {
        this.#turn_results = {};

        Object.freeze(this);
    }

    Freeze():
        void
    {
        for (const turn_result of Object.values(this.#turn_results)) {
            Object.freeze(turn_result.same);
            Object.freeze(turn_result.plus);
            Object.freeze(turn_result);
        }
    }

    At(cell_index: Cell_Index):
        Turn_Result
    {
        if (this.#turn_results[cell_index] == null) {
            this.#turn_results[cell_index] = {
                cell_index: cell_index,
                direction: Direction_e._NONE_,
                old_color: null,
                step: 0,
                same: {
                    left: false,
                    top: false,
                    right: false,
                    bottom: false,
                },
                plus: {
                    left: false,
                    top: false,
                    right: false,
                    bottom: false,
                },
                combo: false,
            };
        }

        return this.#turn_results[cell_index];
    }

    Steps():
        Turn_Result_Steps
    {
        const results: Turn_Result_Steps = [];

        const step_hashmap: { [index: Step_Count]: Array<Turn_Result> } = {};
        for (const turn_result of Object.values(this.#turn_results)) {
            if (step_hashmap[turn_result.step] == null) {
                step_hashmap[turn_result.step] = [];
            }
            step_hashmap[turn_result.step].push(turn_result);

            Object.freeze(turn_result.same);
            Object.freeze(turn_result.plus);
            Object.freeze(turn_result);
        }

        const step_array = Object.keys(step_hashmap).map(key => parseInt(key)).sort();
        for (const step of step_array) {
            results.push(step_hashmap[step]);
        }

        return results;
    }
}

export type Turn_Result_Steps =
    Array<Array<Turn_Result>>;

export type Turn_Result = {
    cell_index: Cell_Index,
    direction: Direction_e,
    old_color: Color | null,
    step: Step_Count,
    same: {
        left: boolean,
        top: boolean,
        right: boolean,
        bottom: boolean,
    },
    plus: {
        left: boolean,
        top: boolean,
        right: boolean,
        bottom: boolean,
    },
    combo: boolean,
}
