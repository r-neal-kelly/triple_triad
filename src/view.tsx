import "./view.css";

import React from "react";
import ReactDom from "react-dom";
import ReactDOM_Client from "react-dom/client";

import * as Event from "./event";
import * as Model from "./model";

const PLAYER_STAKE_HEIGHT_MULTIPLIER: number = 0.48;
const PLAYER_ALPHA_HIGHLIGHT_MULTIPLIER: number = 0.7;
const AI_SELECTION_WAIT_MILLISECONDS: number = 667;
const TURN_RESULT_WAIT_MILLISECONDS: number = 667;
const TURN_RESULT_TRANSITION_RATIO: number = 1 / 2;

const BEFORE: Event.Name_Prefix = Event.BEFORE;
const ON: Event.Name_Prefix = Event.ON;
const AFTER: Event.Name_Prefix = Event.AFTER;

const GAME_START: Event.Name_Affix = `Game_Start`;
const GAME_STOP: Event.Name_Affix = `Game_Stop`;
const PLAYER_START_TURN: Event.Name_Affix = `Player_Start_Turn`;
const PLAYER_STOP_TURN: Event.Name_Affix = `Player_Stop_Turn`;
const PLAYER_SELECT_STAKE: Event.Name_Affix = `Player_Select_Stake`;
const PLAYER_PLACE_STAKE: Event.Name_Affix = `Player_Place_Stake`;

// might want to turn these into full classes so that the sender has to fill out the info properly.
// that would mean changing how the event types add the event instance to the data
type Game_Start_Data = {
}

type Game_Stop_Data = {
    scores: Model.Scores,
}

type Player_Start_Turn_Data = {
    player_index: Model.Player_Index,
}

type Player_Stop_Turn_Data = {
    player_index: Model.Player_Index,
}

type Player_Select_Stake_Data = {
    player_index: Model.Player_Index,
    stake_index: Model.Stake_Index,
}

type Player_Place_Stake_Data = {
    player_index: Model.Player_Index,
    stake_index: Model.Stake_Index,
    cell_index: Model.Cell_Index,
}

async function Wait(milliseconds: number):
    Promise<void>
{
    return new Promise(function (resolve, reject):
        void
    {
        setTimeout(resolve, milliseconds);
    });
}

/*
    For use with inheriting Component.
*/
interface Component_Props
{
    model: any;
    parent: any;
    event_grid: Event.Grid;
}

/*
    A simplification of the React life-cycle.
    Allows for all async event handlers, including
    for On_Render() which replaces render().

    Method Overrides/Event Handlers in the Life-Cycle:
        Before_Mount
            Before_Add_Listeners
            On_Add_Listeners
            After_Add_Listeners

            Before_Render
            On_Render
            After_Render
        After_Mount

        Before_Update
            Before_Render
            On_Render
            After_Render
        After_Update

        Before_Unmount
            Before_Remove_Listeners
            After_Remove_Listeners
        After_Unmount

    Each method can be overridden by a derived class.

    Is_Mounting is true during Before_Mount and After_Mount.
    Is_Updating is true during Before_Update and After_Update.
    Is_Unmounting is true during Before_Unmount and After_Unmount.

    It's safe to call Update() during Listener events or even other updates.
    Using async calls, it's now easy to set up a simple loop of updates.
*/
class Component<T extends Component_Props> extends React.Component<T>
{
    private is_locked: boolean = false;
    private is_mounted: boolean = false;

    private renderable: JSX.Element | null = null;
    private element: HTMLElement | null = null;

    private was_component_did_mount_called: boolean = false;
    private was_render_called: boolean = false;
    private was_component_did_update_called: boolean = false;
    private was_component_will_unmount_called: boolean = false;

    constructor(props: T)
    {
        super(props);

        this.Mount();
    }

    Model():
        typeof this.props.model
    {
        return this.props.model;
    }

    Parent():
        typeof this.props.parent
    {
        return this.props.parent;
    }

    Event_Grid():
        Event.Grid
    {
        return this.props.event_grid;
    }

    Element():
        HTMLElement | null
    {
        return this.element as HTMLElement;
    }

    Error_Not_Rendered():
        Error
    {
        return new Error(`Component is not rendered.`);
    }

    Is_Locked():
        boolean
    {
        return this.is_locked;
    }

    Is_Unlocked():
        boolean
    {
        return !this.is_locked;
    }

    /*
        Locks both the async frame that calls it and
        every other frame after it until Unlock is called.
    */
    async Lock():
        Promise<void>
    {
        while (this.Is_Locked()) {
            await Wait(1);
        }

        this.is_locked = true;
    }

    /*
        Locks just the async frame that calls it.
        Does not require an Unlock call. Can still
        call Lock afterward to fully lock without any
        real penalty to efficiency, but will then require
        a call to Unlock.
    */
    async Lock_Frame():
        Promise<void>
    {
        while (this.Is_Locked()) {
            await Wait(1);
        }
    }

    Unlock():
        void
    {
        this.is_locked = false;
    }

    Is_Mounted():
        boolean
    {
        return this.is_mounted;
    }

    Is_Unmounted():
        boolean
    {
        return !this.is_mounted;
    }

    // not sure this is useful, because it can't be called during mount, update, or unmount cycles,
    // however it should be safe during any other events, I think, that is with listeners
    async Is_Ready():
        Promise<boolean>
    {
        await this.Lock_Frame();

        return this.Is_Mounted();
    }

    /* Events */
    async Send(event_info: Event.Info):
        Promise<void>
    {
        await this.Event_Grid().Send_Event(event_info);
    }

    private async Mount():
        Promise<void>
    {
        await this.Lock();
        try {
            if (this.Is_Mounted()) {
                throw new Error(`This component is already mounted.`);
            } else {
                await this.Before_Mount();
                {
                    await this.Before_Add_Listeners();
                    this.Event_Grid().Add(this);
                    this.Event_Grid().Add_Many_Listeners(this, await this.On_Add_Listeners());
                    await this.After_Add_Listeners();

                    await this.Render_();

                    while (this.was_component_did_mount_called === false) {
                        await Wait(1);
                    }

                    if (this.was_component_will_unmount_called === false) {
                        this.element = ReactDom.findDOMNode(this) as HTMLElement;
                    } else {
                        this.element = null;
                    }
                }
                await this.After_Mount();

                this.is_mounted = true;
            }

            this.Unlock();
        } catch (error) {
            this.Unlock();
            throw error;
        }
    }

    async Update(after_milliseconds: number = 0):
        Promise<void>
    {
        await Wait(after_milliseconds);

        await this.Lock();
        try {
            if (this.Is_Mounted()) {
                await this.Before_Update();
                {
                    this.was_component_did_update_called = false;
                    await this.Render_();

                    while (
                        this.was_component_will_unmount_called === false &&
                        this.was_component_did_update_called === false
                    ) {
                        await Wait(1);
                    }

                    if (this.was_component_will_unmount_called === false) {
                        this.element = ReactDom.findDOMNode(this) as HTMLElement;
                    } else {
                        this.element = null;
                    }
                }
                await this.After_Update();
            }

            this.Unlock();
        } catch (error) {
            this.Unlock();
            throw error;
        }
    }

    private async Render_():
        Promise<void>
    {
        if (this.was_component_will_unmount_called === false) {
            await this.Before_Render();
            {
                this.renderable = await this.On_Render();

                if (this.was_component_will_unmount_called === false) {
                    this.was_render_called = false;
                    this.forceUpdate();

                    while (
                        this.was_component_will_unmount_called === false &&
                        this.was_render_called === false
                    ) {
                        await Wait(1);
                    }
                }

                this.renderable = null;
            }
            await this.After_Render();
        }
    }

    private async Unmount():
        Promise<void>
    {
        await this.Lock();
        try {
            if (this.was_component_will_unmount_called === false) {
                throw new Error(`componentWillUnmount() must be called before this function`);
            } else if (this.Is_Unmounted()) {
                throw new Error(`This component is already unmounted.`);
            } else {
                await this.Before_Unmount();
                {
                    await this.Before_Remove_Listeners();
                    this.Event_Grid().Remove(this);
                    await this.After_Remove_Listeners();

                    this.element = null;
                }
                await this.After_Unmount();

                this.is_mounted = false;
            }

            this.Unlock();
        } catch (error) {
            this.Unlock();
            throw error;
        }
    }

    /* Mounting */
    async Before_Mount():
        Promise<void>
    {
    }

    async Before_Add_Listeners():
        Promise<void>
    {
    }

    async On_Add_Listeners():
        Promise<Event.Listener_Info[]>
    {
        return [];
    }

    async After_Add_Listeners():
        Promise<void>
    {
    }

    async After_Mount():
        Promise<void>
    {
    }

    /* Updating */
    async Before_Update():
        Promise<void>
    {
    }

    async Before_Render():
        Promise<void>
    {
    }

    async On_Render():
        Promise<JSX.Element | null>
    {
        return null;
    }

    async After_Render():
        Promise<void>
    {
    }

    async After_Update():
        Promise<void>
    {
    }

    /* Unmounting */
    async Before_Unmount():
        Promise<void>
    {
    }

    async Before_Remove_Listeners():
        Promise<void>
    {
    }

    async After_Remove_Listeners():
        Promise<void>
    {
    }

    async After_Unmount():
        Promise<void>
    {
    }

    /* React */
    componentDidMount():
        void
    {
        this.was_component_did_mount_called = true;
    }

    render():
        JSX.Element | null
    {
        this.was_render_called = true;

        return this.renderable;
    }

    componentDidUpdate():
        void
    {
        this.was_component_did_update_called = true;
    }

    componentWillUnmount():
        void
    {
        this.was_component_will_unmount_called = true;
        this.Unmount();
    }
}

type Main_Props = {
    model: Model.Main;
    parent: ReactDOM_Client.Root;
    event_grid: Event.Grid;
}

export class Main extends Component<Main_Props>
{
    private menu: Menu | null;
    private arena: Arena | null;

    constructor(props: Main_Props)
    {
        super(props);

        this.menu = null;
        this.arena = null;
    }

    /* Children */
    Menu():
        Menu
    {
        if (this.menu != null) {
            return this.menu;
        } else {
            throw this.Error_Not_Rendered();
        }
    }

    Arena():
        Arena
    {
        if (this.arena != null) {
            return this.arena;
        } else {
            throw this.Error_Not_Rendered();
        }
    }

    /* Events */
    async On_Render():
        Promise<JSX.Element>
    {
        this.Update(3000);

        return (
            <div
                className={`Main`}
            >
                <Menu
                    key={`menu`}
                    parent={this}
                    ref={ref => this.menu = ref}
                    event_grid={this.Event_Grid()}
                    model={this.Model().Menu()}
                />
                <Arena
                    key={`arena_${Date.now()}_${Math.random()}`}
                    parent={this}
                    ref={ref => this.arena = ref}
                    event_grid={new Event.Grid()}
                    model={this.Model().Random_Arena()}
                />
            </div>
        );
    }
}

type Menu_Props = {
    parent: Main;
    event_grid: Event.Grid;
    model: Model.Menu;
}

class Menu extends React.Component<Menu_Props>
{
    #element: HTMLElement | null;

    constructor(props: Menu_Props)
    {
        super(props);

        this.#element = null;
    }

    Event_Grid():
        Event.Grid
    {
        return this.props.event_grid;
    }

    Model():
        Model.Menu
    {
        return this.props.model;
    }

    Element():
        HTMLElement
    {
        if (!this.#element) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#element as HTMLElement;
        }
    }

    Main():
        Main
    {
        return this.props.parent;
    }

    componentDidMount():
        void
    {
        this.Event_Grid().Add(this);
        this.Event_Grid().Add_Many_Listeners(
            this,
            [
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.Event_Grid().Remove(this);
    }

    render():
        JSX.Element
    {
        return (
            <div
                className="Menu"
            >
            </div>
        );
    }
}

type Arena_Props = {
    parent: Main;
    event_grid: Event.Grid;
    model: Model.Arena;
}

class Arena extends React.Component<Arena_Props>
{
    #element: HTMLElement | null;
    #players: Array<Player | null>;
    #board: Board | null;
    #results: Results | null;

    #animation_stylesheet: HTMLStyleElement | null;
    #animation_name_prefix: string;
    #animation_names: Set<string>;

    constructor(props: Arena_Props)
    {
        super(props);

        this.#element = null;
        this.#players = new Array(this.Model().Player_Count()).fill(null);
        this.#board = null;
        this.#results = null;

        this.#animation_stylesheet = null;
        this.#animation_name_prefix = ``;
        this.#animation_names = new Set();
    }

    Event_Grid():
        Event.Grid
    {
        return this.props.event_grid;
    }

    Model():
        Model.Arena
    {
        return this.props.model;
    }

    Element():
        HTMLElement
    {
        if (!this.#element) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#element as HTMLElement;
        }
    }

    Main():
        Main
    {
        return this.props.parent;
    }

    Player(player_index: Model.Player_Index):
        Player
    {
        if (player_index < 0 || player_index >= this.#players.length) {
            throw new Error(`'player_index' of '${player_index}' is invalid.`);
        } else if (!this.#players[player_index]) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#players[player_index] as Player;
        }
    }

    Players():
        Array<Player>
    {
        const players: Array<Player> = [];
        for (const player of this.#players) {
            if (!player) {
                throw new Error(`Component has not yet been rendered.`);
            } else {
                players.push(player);
            }
        }

        return players;
    }

    Board():
        Board
    {
        if (!this.#board) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#board as Board;
        }
    }

    Results():
        Results
    {
        if (!this.#results) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#results as Results;
        }
    }

    #Create_Animations():
        void
    {
        this.#animation_stylesheet = document.createElement(`style`);
        document.head.appendChild(this.#animation_stylesheet);

        this.#animation_name_prefix = `_${(Math.ceil(Date.now() + Math.random())).toString()}`;

        if (this.#animation_stylesheet.sheet == null ||
            this.#animation_stylesheet.parentNode == null) {
            throw new Error(`Could not successfully create an animation_stylesheet.`);
        } else {
            for (const [name_affix, from, to] of [
                [
                    `left_to_right`,
                    `left`,
                    `right`,
                ],
                [
                    `top_to_bottom`,
                    `top`,
                    `bottom`,
                ],
                [
                    `right_to_left`,
                    `right`,
                    `left`,
                ],
                [
                    `bottom_to_top`,
                    `bottom`,
                    `top`,
                ],
            ] as Array<[
                string,
                string,
                string,
            ]>) {
                const animation_name: string = this.#Animation_Name(name_affix);
                this.#animation_names.add(animation_name);
                this.#animation_stylesheet.sheet.insertRule(
                    `@keyframes ${animation_name} {
                        0% {
                            background-position: ${from};
                        }
                        100% {
                            background-position: ${to};
                        }
                    }`,
                    0
                );
            }

            {
                const animation_name: string = this.#Animation_Name(`twinkle_border`);
                this.#animation_names.add(animation_name);
                this.#animation_stylesheet.sheet.insertRule(
                    `@keyframes ${animation_name} {
                        0% {
                            border-color: white;
                        }
                        25% {
                            border-color: black;
                        }
                        50% {
                            border-color: white;
                        }
                        75% {
                            border-color: black;
                        }
                        100% {
                            border-color: white;
                        }
                    }`,
                    0
                );
            }

            {
                const animation_name: string = this.#Animation_Name(`twinkle_border_once`);
                this.#animation_names.add(animation_name);
                this.#animation_stylesheet.sheet.insertRule(
                    `@keyframes ${animation_name} {
                        0% {
                            border-color: black;
                        }
                        50% {
                            border-color: white;
                        }
                        100% {
                            border-color: black;
                        }
                    }`,
                    0
                );
            }
        }
    }

    #Destroy_Animations():
        void
    {
        if (this.#animation_stylesheet != null &&
            this.#animation_stylesheet.parentNode != null) {
            this.#animation_stylesheet.parentNode.removeChild(this.#animation_stylesheet);
        }

        this.#animation_names = new Set();
        this.#animation_name_prefix = ``;
        this.#animation_stylesheet = null;
    }

    #Animation_Name(name_affix: string):
        string
    {
        return `${this.#animation_name_prefix}_${name_affix}`;
    }

    Animation_Name(name_affix: string):
        string
    {
        const animation_name: string = this.#Animation_Name(name_affix);
        if (!this.#animation_names.has(animation_name)) {
            throw new Error(`Animation does not exist with the name_affix of ${name_affix}.`);
        } else {
            return animation_name;
        }
    }

    async On_Game_Start(
        {
        }: Game_Start_Data,
    ):
        Promise<void>
    {
        const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();
        this.props.event_grid.Send_Event({
            name_affix: PLAYER_START_TURN,
            name_suffixes: [
                current_player_index.toString(),
            ],
            data: {
                player_index: current_player_index,
            } as Player_Start_Turn_Data,
            is_atomic: true,
        });
    }

    async On_Player_Stop_Turn(
        {
        }: Player_Stop_Turn_Data,
    ):
        Promise<void>
    {
        this.Model().Next_Turn();

        if (this.Model().Is_Game_Over()) {
            this.props.event_grid.Send_Event({
                name_affix: GAME_STOP,
                name_suffixes: [
                ],
                data: {
                    scores: this.Model().Scores(),
                } as Game_Stop_Data,
                is_atomic: true,
            });
        } else {
            const current_player_index: Model.Player_Index = this.Model().Current_Player_Index();
            this.props.event_grid.Send_Event({
                name_affix: PLAYER_START_TURN,
                name_suffixes: [
                    current_player_index.toString(),
                ],
                data: {
                    player_index: current_player_index,
                } as Player_Start_Turn_Data,
                is_atomic: true,
            });
        }
    }

    componentDidMount():
        void
    {
        const root_element = document.querySelector(`:root`) as HTMLElement;
        if (root_element == null) {
            throw new Error(`Could not find root_element.`);
        } else {
            root_element.style.setProperty(`--board_grid_column_count`, `${this.Model().Rules().Column_Count()}`);
            root_element.style.setProperty(`--board_grid_row_count`, `${this.Model().Rules().Row_Count()}`);

            this.#Create_Animations();

            this.props.event_grid.Add(this);
            this.props.event_grid.Add_Many_Listeners(
                this,
                [
                    {
                        event_name: new Event.Name(ON, GAME_START),
                        event_handler: this.On_Game_Start,
                    },
                    {
                        event_name: new Event.Name(ON, PLAYER_STOP_TURN),
                        event_handler: this.On_Player_Stop_Turn,
                    },
                ],
            );

            this.props.event_grid.Send_Event({
                name_affix: GAME_START,
                name_suffixes: [
                ],
                data: {
                } as Game_Start_Data,
                is_atomic: true,
            });
        }
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);

        this.#Destroy_Animations();
    }

    render():
        JSX.Element
    {
        const styles: any = {};
        if (this.Model().Rules().Is_Large_Board()) {
            styles.backgroundImage = `url("img/boards/pexels-fwstudio-172296.jpg")`;
        }

        const player_count: number = this.Model().Player_Count();
        const left_player_count: number = Math.floor(player_count / 2);
        const right_player_count: number = player_count - left_player_count;

        return (
            <div
                ref={ref => this.#element = ref}
                className="Arena"
                style={styles}
            >
                <div
                    className={`Player_Grid`}
                    style={{
                        gridTemplateColumns: `repeat(${left_player_count}, 1fr)`,
                    }}
                >
                    {
                        Array(left_player_count).fill(null).map((_, index: Model.Player_Index) =>
                        {
                            const player_index: Model.Player_Index = index + 0;

                            return (
                                <Player
                                    key={`player_${player_index}`}
                                    parent={this}
                                    ref={ref => this.#players[player_index] = ref}
                                    event_grid={this.props.event_grid}
                                    model={this.Model().Player(player_index)}
                                    index={player_index}
                                />
                            );
                        })
                    }
                </div>
                <Board
                    key={`board`}
                    parent={this}
                    ref={ref => this.#board = ref}
                    event_grid={this.props.event_grid}
                    model={this.Model().Board()}
                />
                <div
                    className={`Player_Grid`}
                    style={{
                        gridTemplateColumns: `repeat(${right_player_count}, 1fr)`,
                    }}
                >
                    {
                        Array(right_player_count).fill(null).map((_, index: Model.Player_Index) =>
                        {
                            const player_index: Model.Player_Index = index + left_player_count;

                            return (
                                <Player
                                    key={`player_${player_index}`}
                                    parent={this}
                                    ref={ref => this.#players[player_index] = ref}
                                    event_grid={this.props.event_grid}
                                    model={this.Model().Player(player_index)}
                                    index={player_index}
                                />
                            );
                        })
                    }
                </div>
                <Results
                    key={`results`}
                    parent={this}
                    ref={ref => this.#results = ref}
                    event_grid={this.props.event_grid}
                    model={this.Model()}
                />
            </div>
        );
    }
}

type Player_Props = {
    parent: Arena,
    event_grid: Event.Grid,
    model: Model.Player,
    index: Model.Player_Index,
}

class Player extends React.Component<Player_Props>
{
    #element: HTMLElement | null;
    #bumper: Player_Bumper | null;
    #hand: Player_Hand | null;

    constructor(props: Player_Props)
    {
        super(props);

        this.#element = null;
        this.#bumper = null;
        this.#hand = null;
    }

    Model():
        Model.Player
    {
        return this.props.model;
    }

    Index():
        Model.Player_Index
    {
        return this.props.index;
    }

    Element():
        HTMLElement
    {
        if (!this.#element) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#element as HTMLElement;
        }
    }

    Arena():
        Arena
    {
        return this.props.parent;
    }

    Bumper():
        Player_Bumper
    {
        if (!this.#bumper) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#bumper as Player_Bumper;
        }
    }

    Hand():
        Player_Hand
    {
        if (!this.#hand) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#hand as Player_Hand;
        }
    }

    async On_This_Player_Start_Turn(
        {
            player_index,
        }: Player_Start_Turn_Data,
    ):
        Promise<void>
    {
        this.forceUpdate();

        const color: Model.Color = this.Model().Color();
        this.Element().style.backgroundColor =
            `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha() * PLAYER_ALPHA_HIGHLIGHT_MULTIPLIER})`;

        if (this.Model().Is_Computer()) {
            const computer_player: Model.Computer_Player = this.Model() as Model.Computer_Player;
            const {
                selection_indices,
                cell_index,
            } = await computer_player.Choose_Stake_And_Cell();

            // we may need to while away at this until the computer chooses its stake and cell,
            // that way there is no visual hiccup if the computer takes a bit of time
            for (const selection_index of selection_indices) {
                this.props.event_grid.Send_Event({
                    name_affix: PLAYER_SELECT_STAKE,
                    name_suffixes: [
                        player_index.toString(),
                    ],
                    data: {
                        player_index,
                        stake_index: selection_index,
                    } as Player_Select_Stake_Data,
                    is_atomic: true,
                });

                await Wait(AI_SELECTION_WAIT_MILLISECONDS);
            }

            this.props.event_grid.Send_Event({
                name_affix: PLAYER_PLACE_STAKE,
                name_suffixes: [
                    player_index.toString(),
                ],
                data: {
                    player_index,
                    stake_index: selection_indices[selection_indices.length - 1],
                    cell_index,
                } as Player_Place_Stake_Data,
                is_atomic: true,
            });
        }
    }

    async On_This_Player_Select_Stake(
        {
            stake_index,
        }: Player_Select_Stake_Data,
    ):
        Promise<void>
    {
        const previous_selected_stake_index: Model.Stake_Index | null = this.Model().Selected_Stake_Index();
        if (previous_selected_stake_index !== stake_index) {
            this.Model().Select_Stake(stake_index);
            this.Hand().Stake(stake_index).forceUpdate();

            if (previous_selected_stake_index != null) {
                this.Hand().Stake(previous_selected_stake_index).forceUpdate();
            }
        }
    }

    async On_This_Player_Place_Stake(
        {
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        this.Element().style.backgroundColor = `transparent`;
    }

    componentDidMount():
        void
    {
        const player_index: Model.Player_Index = this.props.index;

        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(ON, PLAYER_START_TURN, player_index.toString()),
                    event_handler: this.On_This_Player_Start_Turn,
                },
                {
                    event_name: new Event.Name(ON, PLAYER_SELECT_STAKE, player_index.toString()),
                    event_handler: this.On_This_Player_Select_Stake,
                },
                {
                    event_name: new Event.Name(ON, PLAYER_PLACE_STAKE, player_index.toString()),
                    event_handler: this.On_This_Player_Place_Stake,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        return (
            <div
                ref={ref => this.#element = ref}
                className="Player"
            >
                <Player_Bumper
                    key={`player_bumper_${this.props.index}`}
                    parent={this}
                    ref={ref => this.#bumper = ref}
                    event_grid={this.props.event_grid}
                    model={this.Model()}
                    index={this.props.index}
                />
                <Player_Hand
                    key={`player_hand_${this.props.index}`}
                    parent={this}
                    ref={ref => this.#hand = ref}
                    event_grid={this.props.event_grid}
                    model={this.Model()}
                    index={this.props.index}
                />
            </div>
        );
    }
}

type Player_Bumper_Props = {
    parent: Player,
    event_grid: Event.Grid,
    model: Model.Player,
    index: Model.Player_Index,
}

class Player_Bumper extends React.Component<Player_Bumper_Props>
{
    #element: HTMLElement | null;
    #name: Player_Name | null;
    #score: Player_Score | null;

    constructor(props: Player_Bumper_Props)
    {
        super(props);

        this.#element = null;
        this.#name = null;
        this.#score = null;
    }

    Model():
        Model.Player
    {
        return this.props.model;
    }

    Index():
        Model.Player_Index
    {
        return this.props.index;
    }

    Element():
        HTMLElement
    {
        if (!this.#element) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#element as HTMLElement;
        }
    }

    Player():
        Player
    {
        return this.props.parent;
    }

    Name():
        Player_Name
    {
        if (!this.#name) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#name as Player_Name;
        }
    }

    Score():
        Player_Score
    {
        if (!this.#score) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#score as Player_Score;
        }
    }

    async On_Game_Stop(
        {
        }: Game_Stop_Data
    ):
        Promise<void>
    {
        const color: Model.Color = this.Model().Color();
        this.Element().style.backgroundColor =
            `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha() * PLAYER_ALPHA_HIGHLIGHT_MULTIPLIER})`;

        this.Score().forceUpdate();
    }

    async After_This_Player_Place_Stake(
        {
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        this.Name().forceUpdate();
    }

    componentDidMount():
        void
    {
        const player_index: Model.Player_Index = this.props.index;

        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(ON, GAME_STOP),
                    event_handler: this.On_Game_Stop,
                },
                {
                    event_name: new Event.Name(AFTER, PLAYER_PLACE_STAKE, player_index.toString()),
                    event_handler: this.After_This_Player_Place_Stake,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        return (
            <div
                ref={ref => this.#element = ref}
                className="Player_Bumper"
            >
                <Player_Name
                    key={`player_name_${this.props.index}`}
                    parent={this}
                    ref={ref => this.#name = ref}
                    event_grid={this.props.event_grid}
                    model={this.Model()}
                    index={this.props.index}
                />
                <Player_Score
                    key={`player_score_${this.props.index}`}
                    parent={this}
                    ref={ref => this.#score = ref}
                    event_grid={this.props.event_grid}
                    model={this.Model()}
                    index={this.props.index}
                />
            </div>
        );
    }
}

type Player_Name_Props = {
    parent: Player_Bumper,
    event_grid: Event.Grid,
    model: Model.Player,
    index: Model.Player_Index,
}

class Player_Name extends React.Component<Player_Name_Props>
{
    Model():
        Model.Player
    {
        return this.props.model;
    }

    Index():
        Model.Player_Index
    {
        return this.props.index;
    }

    Player_Bumper():
        Player_Bumper
    {
        return this.props.parent;
    }

    componentDidMount():
        void
    {
        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        return (
            <div
                className="Player_Name"
            >
                {
                    this.Model().Name()
                }
            </div>
        );
    }
}

type Player_Score_Props = {
    parent: Player_Bumper,
    event_grid: Event.Grid,
    model: Model.Player,
    index: Model.Player_Index,
}

class Player_Score extends React.Component<Player_Score_Props>
{
    Model():
        Model.Player
    {
        return this.props.model;
    }

    Index():
        Model.Player_Index
    {
        return this.props.index;
    }

    Player():
        Player_Bumper
    {
        return this.props.parent;
    }

    async On_Player_Stop_Turn(
        {
        }: Player_Stop_Turn_Data,
    ):
        Promise<void>
    {
        this.forceUpdate();
    }

    componentDidMount():
        void
    {
        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(ON, PLAYER_STOP_TURN),
                    event_handler: this.On_Player_Stop_Turn,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        return (
            <div
                className="Player_Score"
            >
                {
                    this.Model().Score()
                }
            </div>
        );
    }
}

type Player_Hand_Props = {
    parent: Player,
    event_grid: Event.Grid,
    model: Model.Player,
    index: Model.Player_Index,
}

class Player_Hand extends React.Component<Player_Hand_Props>
{
    #element: HTMLElement | null;
    #stakes: Array<Player_Stake | null>;

    constructor(props: Player_Hand_Props)
    {
        super(props);

        this.#element = null;
        this.#stakes = new Array(this.Model().Stake_Count()).fill(null);
    }

    Model():
        Model.Player
    {
        return this.props.model;
    }

    Index():
        Model.Player_Index
    {
        return this.props.index;
    }

    Element():
        HTMLElement
    {
        if (!this.#element) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#element as HTMLElement;
        }
    }

    Player():
        Player
    {
        return this.props.parent;
    }

    Stake(stake_index: Model.Stake_Index):
        Player_Stake
    {
        if (stake_index < 0 || stake_index >= this.#stakes.length) {
            throw new Error(`'stake_index' of '${stake_index}' is invalid.`);
        } else if (!this.#stakes[stake_index]) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#stakes[stake_index] as Player_Stake;
        }
    }

    Stakes():
        Array<Player_Stake>
    {
        const stakes: Array<Player_Stake> = [];
        for (const stake of this.#stakes) {
            if (!stake) {
                throw new Error(`Component has not yet been rendered.`);
            } else {
                stakes.push(stake);
            }
        }

        return stakes;
    }

    async Before_This_Player_Place_Stake(
        {
            stake_index,
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        await this.Stake(stake_index).Twinkle_Border(500);
        await Wait(100);
    }

    async On_This_Player_Place_Stake(
        {
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        this.forceUpdate();
    }

    componentDidMount():
        void
    {
        const player_index: Model.Player_Index = this.Index();

        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(BEFORE, PLAYER_PLACE_STAKE, player_index.toString()),
                    event_handler: this.Before_This_Player_Place_Stake,
                },
                {
                    event_name: new Event.Name(ON, PLAYER_PLACE_STAKE, player_index.toString()),
                    event_handler: this.On_This_Player_Place_Stake,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        const stake_count: Model.Stake_Count = this.Model().Stake_Count();

        return (
            <div
                ref={ref => this.#element = ref}
                className="Player_Hand"
            >
                {
                    Array(stake_count).fill(null).map((_, stake_index: Model.Stake_Index) =>
                    {
                        return (
                            <Player_Stake
                                key={`player_stake_${stake_index}`}
                                parent={this}
                                ref={ref => this.#stakes[stake_index] = ref}
                                event_grid={this.props.event_grid}
                                model={this.Model().Stake(stake_index)}
                                index={stake_index}
                            />
                        );
                    })
                }
            </div>
        );
    }
}

type Player_Stake_Props = {
    parent: Player_Hand,
    event_grid: Event.Grid,
    model: Model.Stake,
    index: Model.Stake_Index,
}

class Player_Stake extends React.Component<Player_Stake_Props>
{
    #element: HTMLElement | null;

    constructor(props: Player_Stake_Props)
    {
        super(props);

        this.#element = null;
    }

    Model():
        Model.Stake
    {
        return this.props.model;
    }

    Index():
        Model.Stake_Index
    {
        return this.props.index;
    }

    Element():
        HTMLElement
    {
        if (!this.#element) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#element as HTMLElement;
        }
    }

    Arena():
        Arena
    {
        return this.Player_Hand().Player().Arena();
    }

    Player():
        Player
    {
        return this.Player_Hand().Player();
    }

    Player_Hand():
        Player_Hand
    {
        return this.props.parent;
    }

    async Twinkle_Border(for_milliseconds: number):
        Promise<void>
    {
        const element: HTMLElement = this.Element();

        element.style.animationName = this.Arena().Animation_Name(`twinkle_border`);
        element.style.animationDuration = `${for_milliseconds}ms`;
        element.style.animationTimingFunction = `ease-in-out`;
        element.style.animationIterationCount = `1`;
        element.style.animationDirection = `normal`;

        await Wait(for_milliseconds);

        element.style.animationName = '';
        element.style.animationDuration = '';
        element.style.animationTimingFunction = '';
        element.style.animationIterationCount = '';
        element.style.animationDirection = '';
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        event.stopPropagation();

        const arena: Model.Arena = this.Model().Arena();
        if (arena.Is_Input_Enabled()) {
            arena.Disable_Input();

            if (this.Model().Is_On_Player()) {
                const player: Model.Player = this.Model().Origin();
                if (player.Is_On_Turn()) {
                    const player_index: Model.Player_Index = player.Index();
                    const stake_index: Model.Stake_Index = this.props.index;

                    this.props.event_grid.Send_Event({
                        name_affix: PLAYER_SELECT_STAKE,
                        name_suffixes: [
                            player_index.toString(),
                        ],
                        data: {
                            player_index,
                            stake_index,
                        } as Player_Select_Stake_Data,
                        is_atomic: true,
                    });
                }
            }

            arena.Enable_Input();
        }
    }

    async On_This_Player_Start_Turn(
        {
        }: Player_Start_Turn_Data
    ):
        Promise<void>
    {
        if (this.Model().Is_Of_Human()) {
            this.Element().style.cursor = `pointer`;
        }
    }

    async On_This_Player_Select_Stake(
        {
            stake_index,
        }: Player_Select_Stake_Data
    ):
        Promise<void>
    {
        if (this.Model().Is_Of_Human()) {
            if (this.Index() === stake_index) {
                this.Element().style.cursor = `default`;
            } else {
                this.Element().style.cursor = `pointer`;
            }
        }
    }

    async On_This_Player_Place_Stake(
        {
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Model().Is_Of_Human()) {
            this.Element().style.cursor = `default`;
        }
    }

    componentDidMount():
        void
    {
        const player_index: Model.Player_Index = this.Player().Index();

        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(ON, PLAYER_START_TURN, player_index.toString()),
                    event_handler: this.On_This_Player_Start_Turn,
                },
                {
                    event_name: new Event.Name(ON, PLAYER_SELECT_STAKE, player_index.toString()),
                    event_handler: this.On_This_Player_Select_Stake,
                },
                {
                    event_name: new Event.Name(ON, PLAYER_PLACE_STAKE, player_index.toString()),
                    event_handler: this.On_This_Player_Place_Stake,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        const color: Model.Color = this.Model().Color();
        const is_of_human: boolean = this.Model().Is_Of_Human();
        const is_selectable: boolean = this.Model().Is_Selectable();

        return (
            <div
                ref={ref => this.#element = ref}
                className={
                    this.Model().Is_Selected() ?
                        `Player_Stake_Selected` :
                        `Player_Stake`
                }
                style={{
                    backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                    backgroundImage: `url("${this.Model().Card().Image()}")`,
                    top: `calc(var(--card_height) * ${PLAYER_STAKE_HEIGHT_MULTIPLIER} * ${this.props.index})`,
                    zIndex: `${this.props.index}`,
                }}
                onClick={
                    is_of_human && is_selectable ?
                        event => this.On_Click.bind(this)(event) :
                        () => { }
                }
            >
            </div>
        );
    }
}

type Board_Props = {
    parent: Arena,
    event_grid: Event.Grid,
    model: Model.Board,
}

class Board extends React.Component<Board_Props>
{
    #element: HTMLElement | null;
    #cells: Array<Board_Cell | null>;

    constructor(props: Board_Props)
    {
        super(props);

        this.#element = null;
        this.#cells = new Array(this.Model().Cell_Count()).fill(null);
    }

    Model():
        Model.Board
    {
        return this.props.model;
    }

    Element():
        HTMLElement
    {
        if (!this.#element) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#element as HTMLElement;
        }
    }

    Arena():
        Arena
    {
        return this.props.parent;
    }

    Cell(cell_index: Model.Cell_Index):
        Board_Cell
    {
        if (cell_index < 0 || cell_index >= this.#cells.length) {
            throw new Error(`'cell_index' of '${cell_index}' is invalid.`);
        } else if (!this.#cells[cell_index]) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#cells[cell_index] as Board_Cell;
        }
    }

    async On_Player_Place_Stake(
        {
            player_index,
            cell_index,
        }: Player_Place_Stake_Data,
    ):
        Promise<void>
    {
        const turn_result_steps: Model.Turn_Result_Steps =
            await this.Model().Place_Current_Player_Selected_Stake(cell_index);

        for (const turn_result_step of turn_result_steps) {
            await Promise.all(turn_result_step.map(function (
                this: Board,
                turn_result: Model.Turn_Result,
            ):
                Promise<void>
            {
                return this.Cell(turn_result.cell_index).Update(turn_result);
            }, this));
        }

        this.props.event_grid.Send_Event({
            name_affix: PLAYER_STOP_TURN,
            name_suffixes: [
                player_index.toString(),
            ],
            data: {
                player_index,
            } as Player_Stop_Turn_Data,
            is_atomic: true,
        });
    }

    componentDidMount():
        void
    {
        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(ON, PLAYER_PLACE_STAKE),
                    event_handler: this.On_Player_Place_Stake,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        const styles: any = {};
        if (this.Model().Rules().Is_Small_Board()) {
            styles.backgroundImage = `url("img/boards/pexels-fwstudio-172296.jpg")`;
        }

        return (
            <div
                ref={ref => this.#element = ref}
                className="Board"
                style={styles}
            >
                <div
                    className="Board_Bumper"
                >
                </div>
                <div
                    className="Board_Grid"
                >
                    {
                        Array(this.Model().Cell_Count()).fill(null).map((_, cell_index: Model.Cell_Index) =>
                        {
                            return (
                                <Board_Cell
                                    key={cell_index}
                                    parent={this}
                                    ref={ref => this.#cells[cell_index] = ref}
                                    event_grid={this.props.event_grid}
                                    index={cell_index}
                                />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

type Board_Cell_Props = {
    parent: Board,
    event_grid: Event.Grid,
    index: Model.Cell_Index,
}

class Board_Cell extends React.Component<Board_Cell_Props>
{
    #element: HTMLElement | null;
    #popups: Array<JSX.Element> | null;

    constructor(props: Board_Cell_Props)
    {
        super(props);

        this.#element = null;
        this.#popups = null;
    }

    Model():
        Model.Cell
    {
        return this.Board().Model().Cell(this.props.index);
    }

    Index():
        Model.Cell_Index
    {
        return this.props.index;
    }

    Element():
        HTMLElement
    {
        if (!this.#element) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#element as HTMLElement;
        }
    }

    Arena():
        Arena
    {
        return this.Board().Arena();
    }

    Board():
        Board
    {
        return this.props.parent;
    }

    async Update(turn_result: Model.Turn_Result):
        Promise<void>
    {
        if (turn_result.old_color != null) {
            const old_color: Model.Color = turn_result.old_color;
            const new_color: Model.Color = this.Model().Color();
            const old_background_color: string =
                `rgba(${old_color.Red()}, ${old_color.Green()}, ${old_color.Blue()}, ${old_color.Alpha()})`;
            const new_background_color: string =
                `rgba(${new_color.Red()}, ${new_color.Green()}, ${new_color.Blue()}, ${new_color.Alpha()})`;

            let background_size: string = ``;
            let old_background_position: string = ``;
            let new_background_position: string = ``;
            if (turn_result.direction === Model.Direction_e.LEFT) {
                background_size = `1000% 100%`;
                old_background_position = `left`;
                new_background_position = `right`;
            } else if (turn_result.direction === Model.Direction_e.TOP) {
                background_size = `100% 1000%`;
                old_background_position = `top`;
                new_background_position = `bottom`;
            } else if (turn_result.direction === Model.Direction_e.RIGHT) {
                background_size = `1000% 100%`;
                old_background_position = `right`;
                new_background_position = `left`;
            } else if (turn_result.direction === Model.Direction_e.BOTTOM) {
                background_size = `100% 1000%`;
                old_background_position = `bottom`;
                new_background_position = `top`;
            }

            const animation_name: string =
                this.Arena().Animation_Name(`${old_background_position}_to_${new_background_position}`);
            const animation_duration: number =
                Math.ceil(TURN_RESULT_WAIT_MILLISECONDS * TURN_RESULT_TRANSITION_RATIO);
            const animation_delay: string =
                `0ms`;
            const element: HTMLElement = this.Element();
            element.style.backgroundColor =
                `transparent`;
            element.style.backgroundImage =
                `linear-gradient(to ${new_background_position}, ${old_background_color}, ${new_background_color})`;
            element.style.backgroundSize =
                background_size;
            element.style.animation =
                `${animation_name} ${animation_duration}ms ease-in-out ${animation_delay} 1 normal`;

            await Wait(animation_duration);

            element.style.backgroundColor =
                new_background_color;
            element.style.backgroundImage =
                ``;
            element.style.backgroundSize =
                `100% 100%`;
            element.style.animation =
                ``;

            await Wait(200);

            element.style.animationName = this.Arena().Animation_Name(`twinkle_border_once`);
            element.style.animationDuration = `${300}ms`;
            element.style.animationTimingFunction = `ease-in`;
            element.style.animationIterationCount = `1`;
            element.style.animationDirection = `normal`;

            await Wait(300);

            element.style.animationName = '';
            element.style.animationDuration = '';
            element.style.animationTimingFunction = '';
            element.style.animationIterationCount = '';
            element.style.animationDirection = '';

            await Wait(TURN_RESULT_WAIT_MILLISECONDS);
        } else {
            this.forceUpdate();
            await Wait(TURN_RESULT_WAIT_MILLISECONDS);
        }

        if (turn_result.combo ||
            turn_result.same.left ||
            turn_result.same.top ||
            turn_result.same.right ||
            turn_result.same.bottom ||
            turn_result.plus.left ||
            turn_result.plus.top ||
            turn_result.plus.right ||
            turn_result.plus.bottom) {
            this.#popups = [];

            if (turn_result.combo) {
                this.#popups.push(
                    <div
                        key={`center`}
                        className={`Board_Cell_Center`}
                    >
                        <div>COMBO</div>
                    </div>
                );
            }
            for (const [class_name, key, has_same, has_plus] of [
                [
                    `Board_Cell_Left`,
                    `left`,
                    turn_result.same.left,
                    turn_result.plus.left,
                ],
                [
                    `Board_Cell_Top`,
                    `top`,
                    turn_result.same.top,
                    turn_result.plus.top,
                ],
                [
                    `Board_Cell_Right`,
                    `right`,
                    turn_result.same.right,
                    turn_result.plus.right,
                ],
                [
                    `Board_Cell_Bottom`,
                    `bottom`,
                    turn_result.same.bottom,
                    turn_result.plus.bottom,
                ],
            ] as Array<
                [
                    string,
                    string,
                    boolean,
                    boolean,
                ]
            >) {
                if (has_same) {
                    if (has_plus) {
                        this.#popups.push(
                            <div
                                key={key}
                                className={class_name}
                            >
                                <div>=</div>
                                <div>+</div>
                            </div>
                        );
                    } else {
                        this.#popups.push(
                            <div
                                key={key}
                                className={class_name}
                            >
                                <div>=</div>
                            </div>
                        );
                    }
                } else if (has_plus) {
                    this.#popups.push(
                        <div
                            key={key}
                            className={class_name}
                        >
                            <div>+</div>
                        </div>
                    );
                }
            }

            this.forceUpdate();
            await Wait(TURN_RESULT_WAIT_MILLISECONDS);
            this.#popups = null;
            this.forceUpdate();
        }
    }

    async On_Click(event: React.SyntheticEvent):
        Promise<void>
    {
        event.stopPropagation();

        const arena: Model.Arena = this.Board().Model().Arena();
        if (arena.Is_On_Human_Turn() && arena.Is_Input_Enabled()) {
            arena.Disable_Input();

            if (this.Board().Model().Is_Cell_Selectable(this.props.index)) {
                const player_index: Model.Player_Index = this.Board().Model().Current_Player_Index();
                const stake_index: Model.Stake_Index = this.Arena().Model().Current_Player().Selected_Stake_Index() as Model.Stake_Index;
                const cell_index: Model.Cell_Index = this.props.index;

                await this.props.event_grid.Send_Event({
                    name_affix: PLAYER_PLACE_STAKE,
                    name_suffixes: [
                        player_index.toString(),
                    ],
                    data: {
                        player_index,
                        stake_index,
                        cell_index,
                    } as Player_Place_Stake_Data,
                    is_atomic: true,
                });
            }

            arena.Enable_Input();
        }
    }

    async After_Player_Select_Stake(
        {
        }: Player_Select_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Board().Model().Is_Cell_Selectable(this.props.index)) {
            // we only need to update the cursor for empty cells
            this.forceUpdate();
        }
    }

    async Before_Player_Place_Stake(
        {
        }: Player_Select_Stake_Data,
    ):
        Promise<void>
    {
        if (this.Model().Is_Empty()) {
            // we only need to update the cursor for empty cells
            this.Element().style.cursor = `default`;
        }
    }

    componentDidMount():
        void
    {
        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(AFTER, PLAYER_SELECT_STAKE),
                    event_handler: this.After_Player_Select_Stake,
                },
                {
                    event_name: new Event.Name(BEFORE, PLAYER_PLACE_STAKE),
                    event_handler: this.Before_Player_Place_Stake,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element
    {
        if (this.Model().Is_Empty()) {
            const is_on_human_turn: boolean = this.Board().Model().Is_On_Human_Turn();
            const is_selectable: boolean = this.Board().Model().Is_Cell_Selectable(this.props.index);

            return (
                <div
                    ref={ref => this.#element = ref}
                    className="Board_Cell_Empty"
                    style={{
                        cursor: `${is_on_human_turn && is_selectable ? `pointer` : `default`}`,
                    }}
                    onClick={event => this.On_Click.bind(this)(event)}
                >
                </div>
            );
        } else {
            const color: Model.Color = this.Model().Color();

            return (
                <div
                    ref={ref => this.#element = ref}
                    className="Board_Cell_Occupied"
                    style={{
                        backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                    }}
                >
                    <div
                        className={`Board_Cell_Card`}
                        style={{
                            backgroundImage: `url("${this.Model().Stake().Card().Image()}")`,
                        }}
                    >
                    </div>
                    {
                        this.#popups ?
                            this.#popups :
                            []
                    }
                </div>
            );
        }
    }
}

type Results_Props = {
    parent: Arena,
    event_grid: Event.Grid,
    model: Model.Arena,
}

class Results extends React.Component<Results_Props>
{
    #element: HTMLElement | null;
    #scores: Model.Scores | null;

    constructor(props: Results_Props)
    {
        super(props);

        this.#element = null;
        this.#scores = null;
    }

    Model():
        Model.Arena
    {
        return this.props.model;
    }

    Element():
        HTMLElement
    {
        if (!this.#element) {
            throw new Error(`Component has not yet been rendered.`);
        } else {
            return this.#element as HTMLElement;
        }
    }

    Arena():
        Arena
    {
        return this.props.parent;
    }

    async On_Game_Start(
        {
        }: Game_Start_Data,
    ):
        Promise<void>
    {
        this.forceUpdate();
    }

    async On_Game_Stop(
        {
            scores,
        }: Game_Stop_Data,
    ):
        Promise<void>
    {
        this.#scores = scores;
        this.forceUpdate();
        while (this.#scores) {
            await Wait(1);
        }
    }

    componentDidMount():
        void
    {
        this.props.event_grid.Add(this);
        this.props.event_grid.Add_Many_Listeners(
            this,
            [
                {
                    event_name: new Event.Name(ON, GAME_START),
                    event_handler: this.On_Game_Start,
                },
                {
                    event_name: new Event.Name(ON, GAME_STOP),
                    event_handler: this.On_Game_Stop,
                },
            ],
        );
    }

    componentWillUnmount():
        void
    {
        this.props.event_grid.Remove(this);
    }

    render():
        JSX.Element | null
    {
        if (this.#scores != null) {
            const scores: Model.Scores = this.#scores;
            this.#scores = null;

            if (scores.Has_Winner()) {
                const winner: Model.Player_And_Score = scores.Winner();
                const color: Model.Color = winner.player.Color();

                return (
                    <div
                        ref={ref => this.#element = ref}
                        className={`Results`}
                        style={{
                            zIndex: `${this.Model().Rules().Selection_Card_Count()}`,
                        }}
                    >
                        <div
                            className={`Results_Banner`}
                        >
                            <div
                                className={`Results_Winner`}
                                style={{
                                    backgroundColor: `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()})`,
                                }}
                            >
                                <div
                                    className={`Results_Winner_Message`}
                                >
                                    {`${winner.player.Name()} Wins!`}
                                    <div>
                                        {`Refresh the page to play again`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            } else {
                const draws: Array<Model.Player_And_Score> = scores.Draws();
                const color_stop_percent: number = 100 / draws.length;
                const linear_gradient_colors: string = draws.map(function (
                    draw: Model.Player_And_Score,
                    index: Model.Player_Index,
                ):
                    string
                {
                    const color: Model.Color = draw.player.Color();
                    const color_stop: string = `${index * color_stop_percent}% ${(index + 1) * color_stop_percent}%`;
                    return `rgba(${color.Red()}, ${color.Green()}, ${color.Blue()}, ${color.Alpha()}) ${color_stop}`;
                }).join(`, `);

                return (
                    <div
                        ref={ref => this.#element = ref}
                        className={`Results`}
                        style={{
                            zIndex: `${this.Model().Rules().Selection_Card_Count()}`,
                        }}
                    >
                        <div
                            className={`Results_Banner`}
                        >
                            <div
                                className={`Results_Draws`}
                                style={{
                                    backgroundImage: `linear-gradient(to right, ${linear_gradient_colors})`,
                                }}
                            >
                                <div
                                    className={`Results_Draws_Message`}
                                >
                                    {`Draw`}
                                    <div>
                                        {`Refresh the page to play again`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        } else {
            return null;
        }
    }
}
