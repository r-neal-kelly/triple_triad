import final_fantasy_8_pack_json from "./pack/final_fantasy_8.json"

/* Various aliases to assist reading comprehension. */
type Count =
    number;

type Index =
    number;

type URL =
    string;

type Pack_Name =
    string;

type Pack_Count =
    Count;

type Tier_Count =
    Count;

type Tier_Index =
    Index;

type Card_Name =
    string;

type Card_Count =
    Count;

type Card_Index =
    Index;

type Card_Number =
    number;

type Element_Name =
    string;

type Shuffle_Count =
    Count;

type Player_Count =
    Count;

export type Player_Index =
    Index;

export type Cell_Index =
    Index;

export type Stake_Count =
    Count;

export type Stake_Index =
    Index;

/* Packs and their components as provided and represented by parsed JSON. */
type Pack_JSON = {
    name: Pack_Name;
    tiers: Tiers_JSON;
}

type Tiers_JSON =
    Array<Tier_JSON>;

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
            final_fantasy_8_pack_json,
        ];

        this.#pack_count = packs_json.length;
        this.#packs = {};

        packs_json.forEach((pack_json: Pack_JSON) =>
        {
            if (this.#packs[pack_json.name] != null) {
                throw new Error(`Pack with the name "${pack_json.name}" already exists.`);
            } else {
                this.#packs[pack_json.name] = new Pack({
                    packs: this,
                    pack_json,
                });
            }
        });
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
        return this.As_Array()[Math.floor(Math.random() * this.Pack_Count())];
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

    constructor({
        packs,
        pack_json,
    }: {
        packs: Packs,
        pack_json: Pack_JSON,
    })
    {
        if (pack_json.tiers.length < 1) {
            throw new Error(`The pack ${pack_json.name} must have at least one tier.`);
        } else {
            this.#packs = packs;
            this.#name = pack_json.name;
            this.#tiers = pack_json.tiers.map((tier_json: Tier_JSON, tier_index: Tier_Index) =>
            {
                return new Tier({
                    pack: this,
                    tier_index,
                    tier_json,
                });
            });
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
}

/* Contains all the collectible cards in a single tier of a pack. */
class Tier
{
    #pack: Pack;
    #index: Tier_Index;
    #cards: Array<Card>;

    constructor({
        pack,
        tier_index,
        tier_json,
    }: {
        pack: Pack,
        tier_index: Tier_Index,
        tier_json: Tier_JSON,
    })
    {
        if ((tier_json.length as Card_Count) < 1) {
            throw new Error(`Each tier must have at least one card.`);
        } else {
            this.#pack = pack;
            this.#index = tier_index;
            this.#cards = tier_json.map((card_json: Card_JSON, card_index: Card_Index) =>
            {
                return new Card({
                    tier: this,
                    card_index,
                    card_json,
                });
            });
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

    constructor({
        tier,
        card_index,
        card_json,
    }: {
        tier: Tier,
        card_index: Card_Index,
        card_json: Card_JSON,
    })
    {
        this.#tier = tier;
        this.#index = card_index;
        this.#card_json = card_json;
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

/* Contains RGBA values for a color. */
export class Color
{
    #red: number;
    #green: number;
    #blue: number;
    #alpha: number;

    constructor({
        red = 0,
        green = 0,
        blue = 0,
        alpha = 1.0,
    }: {
        red?: number,
        green?: number,
        blue?: number,
        alpha?: number,
    })
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
}

/* Contains a number of cards held by a player and several shuffles from which to generate cards. */
export class Collection
{
    #default_shuffle: Shuffle;
    #shuffle_count: Shuffle_Count;
    #shuffles: { [index: Pack_Name]: Shuffle };
    #pack_card_and_counts: { [index: Pack_Name]: Array<Card_And_Count> }; // may want to keep each pack sorted

    constructor({
        default_shuffle,
    }: {
        default_shuffle: Shuffle,
    })
    {
        this.#default_shuffle = default_shuffle;
        this.#shuffle_count = 0;
        this.#shuffles = {};
        this.#pack_card_and_counts = {};

        this.Add_Shuffle(default_shuffle);
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
        return Object.values(this.#shuffles)[Math.floor(Math.random() * this.Shuffle_Count())];
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

    Random_Cards({
        card_count,
        allow_repeats = true,
        allow_multiple_packs = false,
    }: {
        card_count: Card_Count,
        allow_repeats: boolean,
        allow_multiple_packs: boolean,
    }):
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

/* Contains a particular card and a count thereof. */
class Card_And_Count
{
    #card: Card;
    #count: Card_Count;

    constructor({
        card,
        count,
    }: {
        card: Card,
        count: Card_Count,
    })
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

/* Provides a fine-tuned way to randomly generate a list of cards from an individual pack. */
export class Shuffle
{
    #pack: Pack;
    #min_tier_index: Tier_Index;
    #max_tier_index: Tier_Index;

    constructor({
        pack,
        min_tier_index,
        max_tier_index,
    }: {
        pack: Pack,
        min_tier_index: Tier_Index,
        max_tier_index: Tier_Index,
    })
    {
        if (min_tier_index > max_tier_index) {
            throw new Error(`The min_tier_index cannot be greater than the max_tier_index: ${min_tier_index} > ${max_tier_index}`);
        } else if (max_tier_index >= pack.Tier_Count()) {
            throw new Error(`The max_tier_index includes a non-existant tier in the pack "${pack.Name()}"`);
        } else {
            this.#pack = pack;
            this.#min_tier_index = min_tier_index;
            this.#max_tier_index = max_tier_index;
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
        const tier_count: Tier_Count = max_tier_index + 1 - min_tier_index;

        const results: Array<Card> = [];
        for (let idx = 0, end = card_count; idx < end; idx += 1) {
            const tier_index: Tier_Index = Math.floor(Math.random() * tier_count) + min_tier_index;
            const tier: Tier = this.#pack.Tier(tier_index);
            results.push(tier.Card(Math.floor(Math.random() * tier.Card_Count())));
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
                const card_index: Card_Index = Math.floor(Math.random() * cards.length);
                results.push(cards[card_index]);
                cards[card_index] = cards[cards.length - 1];
                cards.pop();
            }

            return results;
        }
    }
}

/* An instance of a game including the rules, the board, the players, their collections, selections, and stakes. */
export class Arena
{
    #rules: Rules;
    #board: Board;
    #players: Array<Player>;
    #turn_queue: Array<Player>; // does this need to be separate from players? if we need to keep track of humans players, we can store separate
    #turn_queue_index: Index;
    #is_input_enabled: boolean;

    constructor({
        rules,
        selections,
    }: {
        rules: Rules,
        selections: Array<Selection>
    })
    {
        this.#rules = rules;

        this.#board = new Board({
            arena: this,
        });

        const player_count: Player_Count = rules.Player_Count();
        if (selections.length !== player_count) {
            throw new Error(`Must have a selection for each player, no more and no less.`);
        } else {
            this.#players = [];
            for (let idx = 0, end = player_count; idx < end; idx += 1) {
                const selection: Selection = selections[idx];
                if (selection.Is_Of_Human()) {
                    this.#players.push(new Human_Player({
                        arena: this,
                        index: idx,
                        selection: selections[idx],
                    }));
                } else {
                    this.#players.push(new Computer_Player({
                        arena: this,
                        index: idx,
                        selection: selections[idx],
                    }));
                }
            }

            this.#turn_queue = Array.from(this.#players).sort(() => Math.random() - 0.5);
            this.#turn_queue_index = 0;

            this.#is_input_enabled = true;
        }
    }

    Rules():
        Rules
    {
        return this.#rules;
    }

    Board():
        Board
    {
        return this.#board;
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

    Current_Player():
        Player
    {
        return this.#turn_queue[this.#turn_queue_index];
    }

    Current_Player_Index():
        Player_Index
    {
        return this.Current_Player().Index();
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

    Is_On_Human_Turn():
        boolean
    {
        return this.Current_Player().Is_Human();
    }

    Is_On_Computer_Turn():
        boolean
    {
        return !this.Is_On_Human_Turn();
    }

    Next_Turn():
        boolean
    {
        if (this.Board().Cell_Count() !== this.Board().Stake_Count()) {
            this.#turn_queue_index += 1;
            if (this.#turn_queue_index === this.#turn_queue.length) {
                this.#turn_queue_index = 0;
            }

            return false;
        } else {
            return true;
        }
    }
};

/* A selection of rules which an arena must abide by. */
export class Rules
{
    #row_count: Count;
    #column_count: Count;
    #cell_count: Count;
    #player_count: Player_Count;
    #selection_card_count: Card_Count;

    #open: boolean;
    #random: boolean;

    constructor({
        row_count = 3,
        column_count = 3,
        player_count = 2,

        open = true,
        random = false,
    }: {
        row_count?: Count,
        column_count?: Count,
        player_count?: Player_Count,

        open?: boolean,
        random?: boolean,
    })
    {
        if (player_count < 2) {
            throw new Error(`Must have a player_count of at least 2.`);
        } else {
            this.#row_count = row_count;
            this.#column_count = column_count;
            this.#cell_count = 0;
            this.#player_count = player_count;
            this.#selection_card_count = 0;

            this.#open = open;
            this.#random = random;

            this.#Update_Counts();

            if (this.Player_Count() > this.Cell_Count()) {
                throw new Error(`A cell_count of ${this.Cell_Count()} is too few for a player_count of ${player_count}.`);
            }
        }
    }

    #Update_Counts():
        void
    {
        this.#cell_count = this.#row_count * this.#column_count;
        this.#selection_card_count = Math.ceil(this.#cell_count / this.#player_count);
    }

    Clone():
        Rules
    {
        const copy: Rules = Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            this
        );

        return copy;
    }

    Row_Count():
        Count
    {
        return this.#row_count;
    }

    Column_Count():
        Count
    {
        return this.#column_count;
    }

    Cell_Count():
        Count
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

    Deserialize(save_data: Rules_Save_Data)
    {
        // for this type we could just remake the object instead of deserialize, but that pattern may not hold?
        this.#row_count = save_data.row_count;
        this.#column_count = save_data.column_count;
        this.#player_count = save_data.player_count;

        this.#open = save_data.open;
        this.#random = save_data.random;

        this.#Update_Counts();
    }
}

type Rules_Save_Data = {
    row_count: Count,
    column_count: Count,
    player_count: Player_Count,

    open: boolean,
    random: boolean,
}

/* Contains a list of individuals cards drawn from a collection and their color, with possible repeats. */
export class Selection
{
    #collection: Collection;
    #color: Color;
    #cards: Array<Card>;
    #is_of_human: boolean;

    constructor({
        collection,
        color,
        cards,
        is_of_human,
    }: {
        collection: Collection,
        color: Color,
        cards: Array<Card>,
        is_of_human: boolean,
    })
    {
        if (cards.length < 1) {
            throw new Error(`Must have a least one card in the selection.`);
        } else {
            this.#collection = collection;
            this.#color = color;
            this.#cards = Array.from(cards);
            this.#is_of_human = is_of_human;
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
    constructor({
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
    })
    {
        if (card_count < 1) {
            throw new Error(`'card_count' must be greater than 0 for a selection.`);
        } else {
            const cards: Array<Card> = collection.Random_Cards({
                card_count,
                allow_repeats,
                allow_multiple_packs,
            });

            super({ collection, color, cards, is_of_human });
        }
    }
}

/* Contains stakes actively in play. */
export class Board
{
    #arena: Arena;

    #stake_count: Stake_Count;
    #cells: Array<Stake | null>;

    constructor({
        arena,
    }: {
        arena: Arena,
    })
    {
        this.#arena = arena;

        this.#stake_count = 0;
        this.#cells = Array(this.Cell_Count()).fill(null);
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
        Count
    {
        return this.Rules().Row_Count();
    }

    Column_Count():
        Count
    {
        return this.Rules().Column_Count();
    }

    Cell_Count():
        Count
    {
        return this.Rules().Cell_Count();
    }

    Stake_Count():
        Stake_Count
    {
        return this.#stake_count;
    }

    Stake(cell_index: Cell_Index):
        Stake | null
    {
        if (cell_index >= 0 && cell_index < this.#cells.length) {
            return this.#cells[cell_index];
        } else {
            throw new Error(`Invalid cell_index.`);
        }
    }

    Cells():
        Array<Stake | null>
    {
        return Array.from(this.#cells);
    }

    Place_Current_Player_Selected_Stake(cell_index: Cell_Index):
        boolean
    {
        if (this.#cells[cell_index] != null) {
            throw new Error(`Stake already exists in cell_index ${cell_index}.`);
        } else {
            const current_player: Player = this.Current_Player();
            const selected_stake: Stake = current_player.Remove_Selected_Stake();

            this.#cells[cell_index] = selected_stake;
            this.#stake_count += 1;

            this.#Evaluate_Cell(cell_index);

            return this.Arena().Next_Turn();
        }
    }

    #Evaluate_Cell(cell_index: Cell_Index):
        void
    {
        // this should update adjacents cards by evaluating the rules,
        // as if a card was just placed in this position.
        // however, it will be used recursively for cards that have already
        // been placed to detect if a combo should occur.
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
        return this.Current_Player().Is_Human();
    }

    Is_On_Computer_Turn():
        boolean
    {
        return !this.Is_On_Human_Turn();
    }

    Is_Cell_Selectable(cell_index: Cell_Index):
        boolean
    {
        return this.Current_Player().Has_Selected_Stake() && this.Stake(cell_index) == null;
    }
}

/* Contains stakes selected for a player. */
export class Player
{
    #arena: Arena;
    #index: Player_Index;
    #selection: Selection;
    #stakes: Array<Stake>;
    #selected_stake_index: Stake_Index | null;

    constructor({
        arena,
        index,
        selection,
    }: {
        arena: Arena,
        index: Player_Index,
        selection: Selection,
    })
    {
        this.#arena = arena;
        this.#index = index;
        this.#selection = selection;
        this.#stakes = [];
        this.#selected_stake_index = null;

        for (let idx = 0, end = selection.Card_Count(); idx < end; idx += 1) {
            this.#stakes.push(new Stake({
                claimant: this,
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
        return this.Arena().Current_Player() === this;
    }
}

export class Human_Player extends Player
{
}

export class Computer_Player extends Player
{
    Select_Stake_And_Cell():
        {
            selection_indices: Array<Stake_Index>,
            cell_index: Cell_Index,
        }
    {
        const cells: Array<Stake | null> = this.Board().Cells();
        const empty_cells: Array<Cell_Index> = [];
        for (let idx = 0, end = cells.length; idx < end; idx += 1) {
            if (cells[idx] == null) {
                empty_cells.push(idx);
            }
        }

        // these will need to be chosen based on observing the rules and cards around empty cells on the board.
        // currently we just do it randomly
        const stake_index: Stake_Index = Math.floor(Math.random() * this.Stake_Count());
        const cell_index: Cell_Index = empty_cells[Math.floor(Math.random() * empty_cells.length)];

        // used to give the impression that the ai is choosing a stake. smoothly lands on the stake it selects.
        // we can add other impression algorithms heres and choose them randomly
        const selection_indices: Array<Stake_Index> = [];
        for (let idx = 0, end = this.Stake_Count(); idx < end; idx += 1) {
            selection_indices.push(idx);
        }
        if (selection_indices[selection_indices.length - 1] !== stake_index) {
            for (let idx = this.Stake_Count() - 1, end = stake_index; idx > end;) {
                idx -= 1;
                selection_indices.push(idx);
            }
        }

        return ({
            selection_indices,
            cell_index,
        });
    }
}

/* Contains a card either on a player or on the board, and its current claimant. */
export class Stake
{
    #claimant: Player;
    #card: Card;

    constructor({
        claimant,
        card,
    }: {
        claimant: Player,
        card: Card,
    })
    {
        this.#claimant = claimant;
        this.#card = card;
    }

    Arena():
        Arena
    {
        return this.Claimant().Arena();
    }

    Board():
        Board
    {
        return this.Claimant().Arena().Board();
    }

    Claimant():
        Player
    {
        return this.#claimant;
    }

    Is_Of_Human():
        boolean
    {
        return this.Claimant().Is_Human();
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
        return this.Claimant().Color();
    }

    Is_On_Player():
        boolean
    {
        return this.Claimant().Has_Stake(this);
    }

    Is_On_Board():
        boolean
    {
        return !this.Is_On_Player();
    }

    Is_Selected():
        boolean
    {
        return this.Claimant().Selected_Stake() === this;
    }

    Is_Selectable():
        boolean
    {
        return !this.Is_Selected() && this.Is_On_Player() && this.Claimant().Is_On_Turn();
    }
}
