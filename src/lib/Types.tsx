// import firebase from "firebase/app"
import { User } from '@firebase/auth-types'
import { APP_ACTIONTYPE, COIN_ACTIONTYPE } from "./Reducers"

//export type User = firebase.User | null;

export type ServerSide = {
    r_interval: number;
    r_interval_g: number;
    f_c_render: boolean;
    maintenance: boolean;
}
  
export interface GlobalContextInterface {
    auth: {
        user: User | null;
        userEmail: string | null;
    }
    env: {
        screenWidth: number;
        screenHeight: number;
        darkmode: boolean | null;
        lang: string;
        isTablet: boolean | null;
    }
    serverSide: ServerSide;
}

export interface GlobalContextInterfaceAsReducer {
    state: GlobalContextInterface;
    dispatch:(param:APP_ACTIONTYPE)=>void;
}

export interface MainContextInterface {
    rerender:()=>void;
    extend:()=>void;
    reload:(all:boolean)=>void;
    fetching:boolean;
    coindata:Coin[];
    bannerID:string;
    changedata:any;
    vip:boolean;
    adblock:boolean;
    requirePIN:boolean;
    username:string;
    postdata:CT_Wallet[];
    fav:string[];
    pnldate:string|number;
    totalbuyin:number;
    totalbuyin_const:number;
    seed:number;
}

export interface TradingContextInterfaceAsReducer {
    state: Coin|null;
    dispatch:(param:COIN_ACTIONTYPE)=>void;
}

export type CT_Wallet = {
    // Client-side
    id:string; // coin (document) name
    // Server-side
    appre:number;
    avg_price:number; //average purchase price
    quantity:number;
    symbol:string;
    // Extended in Portfolio analysis
    appreciation?: number;
    img?:string;
    crntPrice?:number;
    name?:string;
    rank?:number;
    url?:string;
}

export type Coin_Asso = {
    id:string;
    index:number;
    img:string;
    quantity:number;
    crntPrice:number;
    name:string;
    rank:number;
    avg_price:number;
    url:string;
}

export type Obj = {
    piedata:any[];
    associatedData:Coin_Asso[];
    totalAppreciation:number;
    pnl:number;
    pnl_const:number;
    delisted:CT_Wallet[];
}

export type Coin = {
    current_price : number;
    id : string;
    image : string;
    name : string;
    symbol : string;
    market_cap_rank : number;

    ath? : number;
    ath_change_percentage? : number;
    ath_date? : string;
    atl? : number;
    atl_change_percentage? : number;
    atl_date? : string;
    circulating_supply? : number;
    fully_diluted_valuation? : number;
    high_24h? : number;
    last_updated? : string;
    low_24h? : number;
    market_cap? : number;
    market_cap_change_24h? : number;
    market_cap_change_percentage_24h? : number;
    max_supply? : number;
    price_change_24h? : number;
    price_change_percentage_24h? : number;
    total_supply? : number;
    total_volume? : number;
    roi? : any;
    price_change_percentage_14d_in_currency?:number;
    price_change_percentage_1h_in_currency?:number;
    price_change_percentage_1y_in_currency?:number;
    price_change_percentage_200d_in_currency?:number;
    price_change_percentage_30d_in_currency?:number;
    price_change_percentage_7d_in_currency?:number;
}

export type PieData = {
    name:string,
    dominance:number,
    legendFontColor:string,
    legendFontSize:number,
    color?:string
}