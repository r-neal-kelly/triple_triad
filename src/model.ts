import final_fantasy_8_pack_json from "./packs/final_fantasy_8.json"
import cats_pack_json from "./packs/cats.json"

/* Various aliases to assist reading comprehension. */
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

export type Defense =
    number;

export type Defense_Count =
    number;

function Random_Boolean():
    boolean
{
    return Math.random() < 0.5;
}

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
            final_fantasy_8_pack_json,
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
        if (pack_json.tiers.length < 1) {
            throw new Error(`The pack ${pack_json.name} must have at least one tier.`);
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

            Object.freeze(this);
            Object.freeze(this.#tiers);
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

/* Contains a number of cards held by a player and several shuffles from which to generate cards. */
export class Collection
{
    #default_shuffle: Shuffle;
    #shuffle_count: Shuffle_Count;
    #shuffles: { [index: Pack_Name]: Shuffle };
    #pack_card_and_counts: { [index: Pack_Name]: Array<Card_And_Count> }; // may want to keep each pack sorted

    constructor(
        {
            default_shuffle,
        }: {
            default_shuffle: Shuffle,
        }
    )
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
            throw new Error(`The max_tier_index includes a non-existant tier in the pack "${pack.Name()}"`);
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
}

/* An instance of a game including the rules, the board, the players, their collections, selections, and stakes. */
export class Arena
{
    #rules: Rules;
    #players: Array<Player>;
    #board: Board;

    #turn_count: Turn_Count;
    #turn_queue: Array<Player>; // does this need to be separate from players? if we need to keep track of humans players, we can store separate
    #turn_queue_index: Index;

    #is_input_enabled: boolean;

    constructor(
        {
            rules,
            selections,
        }: {
            rules: Rules,
            selections: Array<Selection>
        }
    )
    {
        const player_count: Player_Count = rules.Player_Count();
        if (selections.length !== player_count) {
            throw new Error(`Must have a selection for each player, no more and no less.`);
        } else {
            this.#rules = rules;

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

            this.#board = new Board({
                arena: this,
            });

            this.#turn_count = rules.Cell_Count();
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
        if (this.Is_Game_Over()) {
            throw new Error(`No more turns, the game is over.`);
        } else {
            this.#turn_count -= 1;
            this.#turn_queue_index += 1;
            if (this.#turn_queue_index === this.#turn_queue.length) {
                this.#turn_queue_index = 0;
            }
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
};

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
            random = false,
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

            Object.freeze(this);

            if (this.Player_Count() > this.Cell_Count()) {
                throw new Error(`A cell_count of ${this.Cell_Count()} is too few for a player_count of ${player_count}.`);
            }
        }
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

/* Contains stakes selected for a player. */
export class Player
{
    #arena: Arena;
    #index: Player_Index;
    #selection: Selection;

    #stakes: Array<Stake>;
    #selected_stake_index: Stake_Index | null;

    constructor(
        {
            arena,
            index,
            selection,
        }: {
            arena: Arena,
            index: Player_Index,
            selection: Selection,
        }
    )
    {
        this.#arena = arena;
        this.#index = index;
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
        if (cell_index >= 0 && cell_index < this.#cells.length) {
            const row_count = this.Row_Count();
            if (cell_index % row_count > 0) {
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
        if (cell_index >= 0 && cell_index < this.#cells.length) {
            const row_count = this.Row_Count();
            if (cell_index >= row_count) {
                return this.Cell(cell_index - row_count);
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
        if (cell_index >= 0 && cell_index < this.#cells.length) {
            const row_count = this.Row_Count();
            if (cell_index % row_count < row_count - 1) {
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
        if (cell_index >= 0 && cell_index < this.#cells.length) {
            const row_count = this.Row_Count();
            const cell_count = this.Cell_Count();
            if (cell_index < cell_count - row_count) {
                return this.Cell(cell_index + row_count);
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
        if (cell_index >= 0 && cell_index < this.#cells.length) {
            const row_count = this.Row_Count();
            if (cell_index % row_count > 0) {
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
        if (cell_index >= 0 && cell_index < this.#cells.length) {
            const row_count = this.Row_Count();
            if (cell_index >= row_count) {
                return cell_index - row_count;
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
        if (cell_index >= 0 && cell_index < this.#cells.length) {
            const row_count = this.Row_Count();
            if (cell_index % row_count < row_count - 1) {
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
        if (cell_index >= 0 && cell_index < this.#cells.length) {
            const row_count = this.Row_Count();
            const cell_count = this.Cell_Count();
            if (cell_index < cell_count - row_count) {
                return cell_index + row_count;
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
        let defense_count: Count = 0;
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
        let defense_count: Count = 0;

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
        Promise<void>
    {
        if (this.Arena().Is_Game_Over()) {
            throw new Error(`Cannot place any more stakes, as the game is over.`);
        } else {
            if (this.Cell(cell_index).Is_Occupied()) {
                throw new Error(`Claim already exists in cell_index ${cell_index}.`);
            } else {
                const current_player: Player = this.Current_Player();
                const selected_stake: Stake = current_player.Remove_Selected_Stake();

                await this.#Place_Stake(selected_stake, cell_index);
            }
        }
    }

    async Place_Stake(stake: Stake, cell_index: Cell_Index):
        Promise<void>
    {
        if (this.Arena().Is_Game_Over()) {
            throw new Error(`Cannot place any more stakes, as the game is over.`);
        } else {
            if (this.Cell(cell_index).Is_Occupied()) {
                throw new Error(`Claim already exists in cell_index ${cell_index}.`);
            } else {
                await this.#Place_Stake(stake, cell_index);
            }
        }
    }

    async #Place_Stake(stake: Stake, cell_index: Cell_Index):
        Promise<void>
    {
        this.#cells[cell_index] = new Cell(
            {
                stake: stake,
                claimant: stake.Origin(),
            },
        );

        await this.#Evaluate_Cell(cell_index);
    }

    async #Evaluate_Cell(cell_index: Cell_Index):
        Promise<void>
    {
        // this should update adjacents cards by evaluating the rules,
        // as if a card was just placed in this position.
        // however, it will be used recursively for cards that have already
        // been placed to detect if a combo should occur.

        const center_index: Cell_Index = cell_index;
        const center_cell: Cell = this.Cell(center_index);
        const center_card: Card = center_cell.Stake().Card();
        const center_player: Player = center_cell.Claimant();

        const left_index: Cell_Index | Wall = this.Left_Index_Of(cell_index);
        const left_cell: Cell | Wall = left_index instanceof Wall ?
            left_index :
            this.Cell(left_index);
        let left_claimed: boolean = false;
        let left_combos: boolean = false;

        const top_index: Cell_Index | Wall = this.Top_Index_Of(cell_index);
        const top_cell: Cell | Wall = top_index instanceof Wall ?
            top_index :
            this.Cell(top_index);
        let top_claimed: boolean = false;
        let top_combos: boolean = false;

        const right_index: Cell_Index | Wall = this.Right_Index_Of(cell_index);
        const right_cell: Cell | Wall = right_index instanceof Wall ?
            right_index :
            this.Cell(right_index);
        let right_claimed: boolean = false;
        let right_combos: boolean = false;

        const bottom_index: Cell_Index | Wall = this.Bottom_Index_Of(cell_index);
        const bottom_cell: Cell | Wall = bottom_index instanceof Wall ?
            bottom_index :
            this.Cell(bottom_index);
        let bottom_claimed: boolean = false;
        let bottom_combos: boolean = false;

        if (this.Rules().Same()) {
            type Same = {
                count: Count,
                indices: Array<Cell_Index>,
            };
            const sames: { [index: number]: Same } = {};

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
                            sames[center_card_value] = {
                                count: 1,
                                indices: [index as Cell_Index],
                            };
                        } else {
                            sames[center_card_value].count += 1;
                            sames[center_card_value].indices.push(index as Cell_Index);
                        }
                    }
                } else if (cell instanceof Wall && this.Rules().Wall()) {
                    if (center_card_value === 10) {
                        if (sames[center_card_value] == null) {
                            sames[center_card_value] = {
                                count: 1,
                                indices: [],
                            };
                        } else {
                            sames[center_card_value].count += 1;
                        }
                    }
                }
            }

            // then we filter out any sames that do not occur more than once, which breaks the rule,
            // and we sort from the greatest number of cards that can be claimed to the least
            const sames_array = Object.values(sames).filter(function (
                same: Same,
            ):
                boolean
            {
                return same.count >= 2;
            }).sort(function (
                a: Same,
                b: Same,
            ):
                number
            {
                return b.indices.length - a.indices.length;
            });

            if (sames_array.length > 0) {
                // we get the first however many sames that equate so that we can randomly select from them
                let biggest_same_count = 0;
                for (let idx = 0, end = sames_array.length; idx < end; idx += 1) {
                    if (sames_array[idx].indices.length === sames_array[0].indices.length) {
                        biggest_same_count += 1;
                    } else {
                        break;
                    }
                }

                const cell_indices: Array<Cell_Index> = sames_array[Math.floor(Math.random() * biggest_same_count)].indices;
                for (const cell_index of cell_indices) {
                    if (cell_index === left_index as Cell_Index) {
                        left_claimed = true;
                        left_combos = true;
                    } else if (cell_index === top_index as Cell_Index) {
                        top_claimed = true;
                        top_combos = true;
                    } else if (cell_index === right_index as Cell_Index) {
                        right_claimed = true;
                        right_combos = true;
                    } else if (cell_index === bottom_index as Cell_Index) {
                        bottom_claimed = true;
                        bottom_combos = true;
                    }
                }
            }
        }

        if (this.Rules().Plus()) {
            type Sum = {
                count: Count,
                indices: Array<Cell_Index>,
            };
            const sums: { [index: number]: Sum } = {};

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
                        sums[sum] = {
                            count: 1,
                            indices: [index as Cell_Index],
                        };
                    } else {
                        sums[sum].count += 1;
                        sums[sum].indices.push(index as Cell_Index);
                    }
                } else if (cell instanceof Wall && this.Rules().Wall()) {
                    const sum = center_card_value + 10;
                    if (sums[sum] == null) {
                        sums[sum] = {
                            count: 1,
                            indices: [],
                        };
                    } else {
                        sums[sum].count += 1;
                    }
                }
            }

            // then we filter out any sums that do not occur more than once, which breaks the rule,
            // and we sort from the greatest number of cards that can be claimed to the least
            const sums_array = Object.values(sums).filter(function (
                sum: Sum,
            ):
                boolean
            {
                return sum.count >= 2;
            }).sort(function (
                a: Sum,
                b: Sum,
            ):
                number
            {
                return b.indices.length - a.indices.length;
            });

            if (sums_array.length > 0) {
                // we get the first however many sums that equate so that we can randomly select from them
                let biggest_sum_count = 0;
                for (let idx = 0, end = sums_array.length; idx < end; idx += 1) {
                    if (sums_array[idx].indices.length === sums_array[0].indices.length) {
                        biggest_sum_count += 1;
                    } else {
                        break;
                    }
                }

                const cell_indices: Array<Cell_Index> = sums_array[Math.floor(Math.random() * biggest_sum_count)].indices;
                for (const cell_index of cell_indices) {
                    if (cell_index === left_index as Cell_Index) {
                        left_claimed = true;
                        left_combos = true;
                    } else if (cell_index === top_index as Cell_Index) {
                        top_claimed = true;
                        top_combos = true;
                    } else if (cell_index === right_index as Cell_Index) {
                        right_claimed = true;
                        right_combos = true;
                    } else if (cell_index === bottom_index as Cell_Index) {
                        bottom_claimed = true;
                        bottom_combos = true;
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
        }
        if (top_claimed) {
            this.#cells[top_index as Cell_Index] = new Cell(
                {
                    stake: (top_cell as Cell).Stake(),
                    claimant: center_player,
                },
            );
        }
        if (right_claimed) {
            this.#cells[right_index as Cell_Index] = new Cell(
                {
                    stake: (right_cell as Cell).Stake(),
                    claimant: center_player,
                },
            );
        }
        if (bottom_claimed) {
            this.#cells[bottom_index as Cell_Index] = new Cell(
                {
                    stake: (bottom_cell as Cell).Stake(),
                    claimant: center_player,
                },
            );
        }

        if (this.Rules().Combo()) {
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
                await this.#Evaluate_Cell(cell_index_to_combo);
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
                const index: Index = Math.floor(Math.random() * this.#stake_indices.length);

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
            if (Random_Boolean() && this.Defense_Count_Of(biggest_defense_placements.Random().cell_index) >= 2) {
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
