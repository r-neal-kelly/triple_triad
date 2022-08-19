import final_fantasy_8_pack_from_json from "./pack/final_fantasy_8.json"

/* Contains all available packs. */
export class Packs
{
    #pack_count;
    #packs;

    constructor()
    {
        const packs_from_json = [
            final_fantasy_8_pack_from_json,
        ];

        this.#pack_count = packs_from_json.length;
        this.#packs = {};

        packs_from_json.forEach((pack_from_json) =>
        {
            if (this.#packs[pack_from_json.name] != null) {
                throw new Error(`Pack with the name "${pack_from_json.name}" already exists.`);
            } else {
                this.#packs[pack_from_json.name] = new Pack({
                    packs: this,
                    pack_from_json,
                });
            }
        });
    }

    Pack_Count()
    {
        return this.#pack_count;
    }

    Pack(name)
    {
        const pack = this.#packs[name];

        if (pack == null) {
            throw new Error("Invalid pack name.");
        } else {
            return pack;
        }
    }

    Random_Pack()
    {
        return this.Array()[Math.floor(Math.random() * this.Pack_Count())];
    }

    Array()
    {
        return Object.values(this.#packs); // probably want to sort
    }
}

/* Contains all the tiers and all their collectible cards. */
class Pack
{
    #packs;
    #name;
    #tiers;

    constructor({
        packs,
        pack_from_json,
    })
    {
        if (pack_from_json.data.length < 1) {
            throw new Error(`The pack ${pack_from_json.name} must have at least one tier.`);
        } else {
            this.#packs = packs;
            this.#name = pack_from_json.name;
            this.#tiers = pack_from_json.data.map((tier_from_json) =>
            {
                return new Tier({
                    pack: this,
                    tier_from_json,
                });
            });
        }
    }

    Packs()
    {
        return this.#packs;
    }

    Name()
    {
        return this.#name;
    }

    Tier_Count()
    {
        return this.#tiers.length;
    }

    Tier(index)
    {
        if (index < this.Tier_Count()) {
            return this.#tiers[index];
        } else {
            throw new Error("Invalid tier index.");
        }
    }

    Tiers()
    {
        return Array.from(this.#tiers);
    }
}

/* Contains all the collectible cards in a single tier of a pack. */
class Tier
{
    #pack;
    #cards;

    constructor({
        pack,
        tier_from_json,
    })
    {
        if (tier_from_json.length < 1) {
            throw new Error(`Each tier must have at least one card.`);
        } else {
            this.#pack = pack;
            this.#cards = tier_from_json.map((card_from_json) =>
            {
                return new Card({
                    tier: this,
                    card_from_json,
                });
            });
        }
    }

    Pack()
    {
        return this.#pack;
    }

    Card_Count()
    {
        return this.#cards.length;
    }

    Card(index)
    {
        if (index < this.Card_Count()) {
            return this.#cards[index];
        } else {
            throw new Error("Invalid card index.");
        }
    }

    Cards()
    {
        return Array.from(this.#cards);
    }
}

/* Contains the data for each individual card in a pack. */
class Card
{
    #tier;
    #data;

    constructor({
        tier,
        card_from_json,
    })
    {
        this.#tier = tier;
        this.#data = card_from_json;
    }

    Pack()
    {
        return this.#tier.Pack();
    }

    Tier()
    {
        return this.#tier;
    }

    Name()
    {
        return this.#data.name;
    }

    Image()
    {
        return this.#data.image;
    }

    Element()
    {
        return this.#data.element;
    }

    Left()
    {
        return this.#data.left;
    }

    Top()
    {
        return this.#data.top;
    }

    Right()
    {
        return this.#data.right;
    }

    Bottom()
    {
        return this.#data.bottom;
    }
}

/* Contains RGBA values for a color. */
export class Color
{
    #red;
    #green;
    #blue;
    #alpha;

    constructor({
        red = 0,
        green = 0,
        blue = 0,
        alpha = 1.0,
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

    Red()
    {
        return this.#red;
    }

    Green()
    {
        return this.#green;
    }

    Blue()
    {
        return this.#blue;
    }

    Alpha()
    {
        return this.#alpha;
    }
}

/* Contains a number of cards held by a player and several shuffles from which to generate cards. */
export class Collection
{
    #shuffle_count;
    #shuffles;
    #default_shuffle;
    #card_counts;

    constructor({
        default_shuffle,
    })
    {
        if (default_shuffle == null) {
            // if there aren't enough cards amoung the card_counts, then the shuffle is used.
            throw new Error(`There must be a default_shuffle in every collection.`);
        } else {
            this.#shuffle_count = 0;
            this.#shuffles = {}; // only one shuffle per pack allowed
            this.#default_shuffle = default_shuffle;
            this.#card_counts = {}; // this should be keyed by pack_name, and then the card_counts sorted in an array

            this.Add_Shuffle(default_shuffle);
        }
    }

    Shuffle_Count()
    {
        return this.#shuffle_count;
    }

    Shuffle(pack_name)
    {
        return this.#shuffles[pack_name];
    }

    Default_Shuffle()
    {
        return this.#default_shuffle;
    }

    Random_Shuffle()
    {
        return Object.values(this.#shuffles)[Math.floor(Math.random() * this.Shuffle_Count())];
    }

    Add_Shuffle(shuffle)
    {
        if (this.#shuffles[shuffle.Pack().Name()]) {
            throw new Error(`This collection already has a shuffle using the same pack.`);
        } else {
            this.#shuffle_count += 1;
            this.#shuffles[shuffle.Pack().Name()] = shuffle;
        }
    }

    Remove_Shuffle(pack_name)
    {
        if (this.#shuffles[pack_name]) {
            this.#shuffle_count -= 1;
            delete this.#shuffles[pack_name];
        }
    }

    Add_Card(card, count)
    {

    }

    Remove_Card(card, count)
    {

    }

    Random_Cards({
        card_count,
        allow_repeats = true,
        allow_multiple_packs = false,
    })
    {
        // we need to be able to select random cards from the card_counts too, but for now we'll keep it easy
        // we also need to add the functionality to use multiple packs, but one thing at a time here

        if (allow_repeats) {
            return this.Random_Shuffle().Cards(card_count);
        } else {
            return this.Random_Shuffle().Unique_Cards(card_count);
        }
    }

    Serialize()
    {
        // if we serialize by indices into a pack but the pack is changed, there's no way to know the difference.
        // we could serialize with card names, but that may be overkill here.
        return {};
    }

    Deserialize(data)
    {

    }
}

/* Contains a particular card and a count thereof. */
class Card_Count
{
    #card;
    #count;

    constructor({
        card,
        count,
    })
    {
        if (count < 0) {
            throw new Error(`Count must be greater than or equal to 0.`)
        } else {
            this.#card = card;
            this.#count = count;
        }
    }

    Card()
    {
        return this.#card;
    }

    Count()
    {
        return this.#count;
    }

    Add(count)
    {
        if (this.#count + count < this.#count) {
            throw new Error(`Cannot add ${count} to the count.`);
        } else {
            this.#count += count;
        }
    }

    Subtract(count)
    {
        if (this.#count - count > this.#count) {
            throw new Error(`Cannot subtract ${count} from the count.`);
        } else {
            this.#count -= count;
        }
    }

    Increment()
    {
        this.Add(1);
    }

    Decrement()
    {
        this.Subtract(1);
    }
}

/* Provides a fine-tuned way to randomly generate a list of cards from an individual pack. */
export class Shuffle
{
    #pack;
    #min_tier_index;
    #max_tier_index;

    constructor({
        pack,
        min_tier_index,
        max_tier_index,
    })
    {
        if (pack == null) {
            throw new Error(`Requires a pack.`);
        } else if (min_tier_index > max_tier_index) {
            throw new Error(`The min_tier_index is greater than the max_tier_index: ${min_tier_index} > ${max_tier_index}`);
        } else if (max_tier_index >= pack.Tier_Count()) {
            throw new Error(`The max_tier_index indicates a non-existant tier in the pack "${pack.Name()}"`);
        } else {
            this.#pack = pack;
            this.#min_tier_index = min_tier_index;
            this.#max_tier_index = max_tier_index;
        }
    }

    Pack()
    {
        return this.#pack;
    }

    Min_Tier_Index()
    {
        return this.#min_tier_index;
    }

    Max_Tier_Index()
    {
        return this.#max_tier_index;
    }

    Cards(count)
    {
        // It's guaranteed that at least one card exists in every tier, and that every pack has at least one tier.

        const tier_count = this.#max_tier_index + 1 - this.#min_tier_index;

        const results = [];
        for (let idx = 0, end = count; idx < end; idx += 1) {
            const tier_index = Math.floor(Math.random() * tier_count) + this.#min_tier_index;
            const tier = this.#pack.Tier(tier_index);
            results.push(tier.Card(Math.floor(Math.random() * tier.Card_Count())));
        }

        return results;
    }

    Unique_Cards(count)
    {
        const cards = [];
        for (let idx = this.#min_tier_index, end = this.#max_tier_index + 1; idx < end; idx += 1) {
            cards.push(...this.#pack.Tier(idx).Cards());
        }

        if (count > cards.length) {
            throw new Error(`The count exceeds the number of available unique cards.`);
        } else {
            const results = [];
            for (let idx = 0, end = count; idx < end; idx += 1) {
                const card_index = Math.floor(Math.random() * cards.length);
                results.push_back(cards[card_index]);
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
    #rules;
    #board;
    #players;
    #current_player_index;
    #is_input_enabled;

    constructor({
        rules,
        selections,
    })
    {
        if (rules == null) {
            throw new Error(`Must have a set of rules to play.`);
        } else if (selections == null) {
            throw new Error(`Must have an array of selections for each player.`);
        } else {
            //this.#rules = rules.Clone();
            this.#rules = rules;

            this.#board = new Board({
                arena: this,
            });

            const player_count = rules.Player_Count();
            if (selections.length !== player_count) {
                throw new Error(`Must have a selection for each player, no more and no less.`);
            } else {
                this.#players = [];
                for (let idx = 0, end = player_count; idx < end; idx += 1) {
                    this.#players.push(new Player({
                        arena: this,
                        arena_id: idx,
                        selection: selections[idx],
                    }));
                }

                this.#current_player_index = Math.floor(Math.random() * player_count);

                this.#is_input_enabled = true;
            }
        }
    }

    Rules()
    {
        return this.#rules;
    }

    Board()
    {
        return this.#board;
    }

    Player_Count()
    {
        return this.#players.length;
    }

    Player(index)
    {
        if (index < this.Player_Count()) {
            return this.#players[index];
        } else {
            throw new Error("Invalid player index.");
        }
    }

    Current_Player_Index()
    {
        return this.#current_player_index;
    }

    Is_Input_Enabled()
    {
        return this.#is_input_enabled;
    }

    Enable_Input()
    {
        this.#is_input_enabled = true;
    }

    Disable_Input()
    {
        this.#is_input_enabled = false;
    }
};

/* A selection of rules which an arena must abide by. */
export class Rules
{
    #row_count;
    #column_count;
    #cell_count;
    #player_count;
    #selection_count;

    #open;
    #random;

    constructor({
        row_count = 3,
        column_count = 3,
        player_count = 2,

        open = true,
        random = false,
    })
    {
        if (player_count < 2) {
            throw new Error(`Must have at least 2 players.`);
        } else {
            this.#row_count = row_count;
            this.#column_count = column_count;
            this.#player_count = player_count;

            this.#open = open;
            this.#random = random;

            this.#Update_Counts();

            if (this.Player_Count() > this.Cell_Count()) {
                throw new Error(`A cell count of ${this.Cell_Count()} is to few for ${player_count} players.`);
            }
        }
    }

    #Update_Counts()
    {
        this.#cell_count = this.#row_count * this.#column_count;
        this.#selection_count = Math.ceil(this.#cell_count / this.#player_count);
    }

    Clone()
    {
        const copy = Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            this
        );

        return copy;
    }

    Row_Count()
    {
        return this.#row_count;
    }

    Column_Count()
    {
        return this.#column_count;
    }

    Cell_Count()
    {
        return this.#cell_count;
    }

    Player_Count()
    {
        return this.#player_count;
    }

    Selection_Count()
    {
        return this.#selection_count;
    }

    Open()
    {
        return this.#open;
    }

    Random()
    {
        return this.#random;
    }

    Serialize()
    {
        return ({
            row_count: this.#row_count,
            column_count: this.#column_count,
            player_count: this.#player_count,

            open: this.#open,
            random: this.#random,
        });
    }

    Deserialize(data)
    {
        this.#row_count = data.row_count;
        this.#column_count = data.column_count;
        this.#player_count = data.player_count;

        this.#open = data.open;
        this.#random = data.random;

        this.#Update_Counts();
    }
}

/* Contains a list of individuals cards drawn from a collection, with possible repeats. */
export class Selection
{
    #collection;
    #color;
    #cards;

    // if given a cards array, it will accept that as the selection,
    // else it can generate a random selection from the collection
    constructor({
        collection,
        color,

        cards = null,

        random_card_count,
        allow_random_repeats = true,
        allow_random_multiple_packs = false,
    })
    {
        if (collection == null) {
            throw new Error(`Must have a collection.`);
        } else if (color == null) {
            throw new Error(`Must have a color.`);
        } else {
            this.#collection = collection;
            this.#color = color;

            if (cards != null) {
                if (cards.length < 1) {
                    throw new Error(`Must have a least one card in the selection.`);
                } else {
                    this.#cards = Array.from(cards);
                }
            } else {
                if (random_card_count < 1) {
                    throw new Error(`Must have a least one card in the selection.`);
                } else {
                    this.#cards = collection.Random_Cards({
                        card_count: random_card_count,
                        allow_repeats: allow_random_repeats,
                        allow_multiple_packs: allow_random_multiple_packs,
                    });
                }
            }
        }
    }

    Collection()
    {
        return this.#collection;
    }

    Color()
    {
        return this.#color;
    }

    Card_Count()
    {
        return this.#cards.length;
    }

    Card(index)
    {
        if (index < this.Card_Count()) {
            return this.#cards[index];
        } else {
            throw new Error("Invalid card index.");
        }
    }
}

/* Contains stakes actively in play. */
class Board
{
    #arena;

    #stake_count;
    #stakes;

    constructor({
        arena,
    })
    {
        this.#arena = arena;

        this.#stake_count = 0;
        this.#stakes = Array(this.Cell_Count()).fill(null);
    }

    Arena()
    {
        return this.#arena;
    }

    Rules()
    {
        return this.Arena().Rules();
    }

    Row_Count()
    {
        return this.Rules().Row_Count();
    }

    Column_Count()
    {
        return this.Rules().Column_Count();
    }

    Cell_Count()
    {
        return this.Rules().Cell_Count();
    }

    Stake_Count()
    {
        return this.#stake_count;
    }

    Stake(index)
    {
        if (index < 0 || index >= this.#stakes.length) {
            throw new Error(`Invalid stake index.`);
        } else {
            return this.#stakes[index];
        }

        /*
        if (row < this.Row_Count() && column < this.Column_Count()) {
            return this.#stakes[row * column + column];
        } else {
            throw new Error("Invalid stake coordinates.");
        }
        */
    }

    Place_Stake(player_index, stake_index)
    {
        // calls Evaluate_Stake after adding the stake.

        // maybe we should have this on the player type as well, because we'll have to track which stake is selected.
    }

    #Evaluate_Stake(row, column)
    {
        // this should update adjacents cards by evaluating the rules,
        // as if a card was just placed in this position.
        // however, it will be used recursively for cards that have already
        // been placed to detect if a combo should occur.
    }
}

/* Contains stakes selected for a player. */
class Player
{
    #arena;
    #arena_id;
    #selection;
    #stakes;
    #selected_stake_index;

    constructor({
        arena,
        arena_id,
        selection,
    })
    {
        this.#arena = arena;
        this.#arena_id = arena_id;
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

    ID()
    {
        return this.#arena_id;
    }

    Arena()
    {
        return this.#arena;
    }

    Arena_ID()
    {
        return this.#arena_id;
    }

    Rules()
    {
        return this.Arena().Rules();
    }

    Selection()
    {
        return this.#selection;
    }

    Color()
    {
        return this.Selection().Color();
    }

    Stake_Count()
    {
        return this.#stakes.length;
    }

    Stake(index)
    {
        if (index < this.Stake_Count()) {
            return this.#stakes[index];
        } else {
            throw new Error(`Invalid stake index.`);
        }
    }

    Has_Stake(stake)
    {
        return this.#stakes.includes(stake);
    }

    Select_Stake(index)
    {
        if (index == null) {
            this.#selected_stake_index = null;
        } else if (index < this.Stake_Count()) {
            this.#selected_stake_index = index;
        } else {
            throw new Error(`Invalid stake index.`);
        }
    }

    Selected_Stake()
    {
        if (this.#selected_stake_index != null) {
            return this.Stake(this.#selected_stake_index);
        } else {
            return null;
        }
    }

    Remove_Selected_Stake()
    {
        if (this.#selected_stake_index != null) {
            const selected_stake = this.#stakes[this.#selected_stake_index];

            if (this.Stake_Count() > 1) {
                for (let idx = this.#selected_stake_index + 1, end = this.Stake_Count(); idx < end; idx += 1) {
                    this.#stakes[idx - 1] = this.#stakes[idx];
                }
                this.#stakes.pop();
            } else {
                this.#stakes.pop();
            }

            this.#selected_stake_index = null;

            return selected_stake;
        } else {
            throw new Error(`No selected stake to remove.`);
        }
    }

    Is_On_Turn()
    {
        return true; // temp
        //return this.Arena().Current_Player_Index() == this.ID();
    }
}

/* Contains a card either on a player or on the board, and its current claimant. */
class Stake
{
    #claimant;
    #card;

    constructor({
        claimant,
        card,
    })
    {
        this.#claimant = claimant;
        this.#card = card;
    }

    Arena()
    {
        return this.Claimant().Arena();
    }

    Claimant()
    {
        return this.#claimant;
    }

    Card()
    {
        return this.#card;
    }

    Color()
    {
        return this.Claimant().Color();
    }

    Is_On_Player()
    {
        return this.#claimant.Has_Stake(this);
    }

    Is_On_Board()
    {
        return !this.Is_On_Player();
    }
}
