import AsyncStorage from "@react-native-async-storage/async-storage";
import I18n from "i18n-js";
import { Coin, Coin_Asso, CT_Wallet, MainContextInterface, Obj, PieData } from "./Types";
import Env from '../env.json';
import { textColor } from "./StyleLib";
import stablecoins from '../stablecoins.json';

export const storeLanguage = async (langCode:any):Promise<void> => {
    try{
        await AsyncStorage.setItem('language', langCode);
        console.log("language set to :",langCode);
        I18n.locale = langCode;
    }catch(e){
        console.log("Error storing language value ! : ",e);
        I18n.locale = "en-US";
    }
}

export const isInList = (arr:string[],name:string):boolean => {
    return arr.some(item => item === name);
}

export const isStableCoin = (id:string) => {
    /**
     * @param {string} id name or symbol
     */
    return Boolean(stablecoins.some(item => item.name === id) || stablecoins.some(item => item.symbol === id.toLowerCase()));
}

export const isValidEmailAddress = (address:string):boolean => {
    return !! address.match(/.+@.+/);
}

export const isNumber = (i:string):boolean => {
    return /^\d+$/.test(i);
}

export const returnPNL = (totaloutput:number,totalinput:number):number => {
    if(totalinput<=0){
        console.log("Error-dividing by zero - returning error")
        return 0;
    }
    let ratio = (totaloutput/totalinput) - 1 ;
    ratio = Math.round(ratio * 10000) / 100;
    return ratio;
}

export const dynamicRound = (i:number,j:number):number => {
    return (Math.round(i * Math.pow(10,j)) / Math.pow(10,j));
}

export const fastRound = (i:number):number => {
    return Math.round(i * 100) / 100;
}

export const addZeroes = (num:number):string => {
    /**
     * show unconditionally 2 decimals at least
     */
    return num.toFixed(Math.max(((num+'').split(".")[1]||"").length, 2));
}

export const determineDecimals = (i:number) => {
    if(Math.abs(i)<=10){
        if(Math.abs(i)<=0.000001){return 11;}
        else if(Math.abs(i)<=0.00001){return 9;}
        else if(Math.abs(i)<=0.001){return 8;}
        else if(Math.abs(i)<=0.01){return 7;}
        else if(Math.abs(i)<=0.1){return 6;}
        else if(Math.abs(i)<=1){return 5;}
        else{return 4;}
    }else{return 2;}
}

// Prices.tsx
export const avoidScientificNotation = (i:number):string|number => {
    let x:number|string = i;
    if(Math.abs(x) < 1.0){
      let e = parseInt(x.toString().split('e-')[1]);
      if(e){
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    }
    return x;
}

export const avoidScientificNotation_withSign = (i:number):string|number => {
    let x:number|string = i;
    let sign = x>0 ? "":"-"
    if(Math.abs(x) < 1.0){
        let e = parseInt(x.toString().split('e-')[1]);
        if(e){
            x *= Math.pow(10,e-1);
            x = Math.abs(x);
            x = dynamicRound(x, determineDecimals(x));
            x = sign+'0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }else{
            x = dynamicRound(x, determineDecimals(x));
        }
    }else{
        x = dynamicRound(x, determineDecimals(x));
    }
    return x;
}

export const avoidScientificNotation_andRound = (i:number):string|number => {
    let x:number|string = i;
    if(Math.abs(x) < 1.0){
      let e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = dynamicRound(x, determineDecimals(x));
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }else{
        x = dynamicRound(x, determineDecimals(x));
      }
    }else{
        x = dynamicRound(x, determineDecimals(x));
    }
    return x;
}

export const autoRound = (i:number) => {
    if(i>100000){
        return Math.floor(i);
    }else if(i>1000){
        return (Math.round(i * Math.pow(10,2)) / Math.pow(10,2));
    }else if(i>100){
        return (Math.round(i * Math.pow(10,3)) / Math.pow(10,3));
    }else if(i>1){
        return (Math.round(i * Math.pow(10,6)) / Math.pow(10,6));
    }else{
        return (Math.round(i * Math.pow(10,8)) / Math.pow(10,8));
    }
}

export const displayVolume = (vol:number):string => {
    if(vol < 1000000000){//less than a billion
        let inmillion = vol / 1000000; // divide by a million
        inmillion = Math.round(inmillion * 100) / 100 ; // round to 2 decimals
        return "$"+inmillion.toString()+"M";
    }else if(vol < 1000000000000){//less than a trillion
        let inbillion = vol / 1000000000; // divide by a billion
        inbillion = Math.round(inbillion * 100) / 100 ; // round to 2 decimals
        return "$"+inbillion.toString()+"B";
    }else{
        let intrillion = vol / 1000000000000; // divide by a trillion
        intrillion = Math.round(intrillion * 100) / 100 ; // round to 2 decimals
        return "$"+intrillion.toString()+"T";
    }
}

export const percentageAsDelta = (i:number):string => {
    const asString = i.toString();
    return (i>=0) ? "+"+asString+"%" : asString+"%"
}

export const numberWithCommas = (i:number):string => {
    if(i<1000){
        return i.toString();
    }else{
        let j = i.toString();
        let k = j.split(".");
        let intpart = Number(k[0])
        let intAsString = intpart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        if(k.length>1){
            let decimalpart = Number(k[1]);
            return intAsString+"."+ decimalpart.toString();
        }else{
            return intAsString.toString();
        }
    }
}

// portfolio_screen
const sliceColor = ['#3684CB','#3FB2AB','#6CD293', '#C7F5D6', '#CBD5E0', '#FFFFFF'];

export const post_to_portfolio = (mainContext:MainContextInterface,darkmode:boolean):Obj => {
    const pieSeries = [];const completeData:CT_Wallet[] = [];let desc = [];const delistedData:CT_Wallet[] = [];let delisted_desc = [];//const chartkeys = [];
    let thesum = mainContext.seed;
    mainContext.postdata.forEach((i) => {
        let onceonly = mainContext.coindata.filter(j => i.id === j.name);
        if(onceonly.length>0){
            let data = onceonly[0];
            let subsum = i.quantity * data.current_price;
            let symb = data.symbol;
            thesum += subsum;
            //let rank = data.market_cap_rank ?? 9999;
            completeData.push({...i,
                appreciation: subsum,
                symbol: symb.toUpperCase(),
                img:data.image,
                crntPrice:data.current_price,
                name:data.name,
                rank:data.market_cap_rank,
                url:data.id,
            });
        }else{
            delistedData.push({...i,appreciation:0,symbol:i.symbol,img:Env.delistedIcon,crntPrice:0,name:i.id,rank:9999});
            console.log("warning - coin [",i.id,"] has been delisted !");
        }
    })
    completeData.push({id:"VUSD",symbol:"VUSD",name:"VUSD",appre:mainContext.seed,appreciation:mainContext.seed,avg_price:1,img:Env.fiatCoinIcon,crntPrice:1,rank:9999,url:'usdt',quantity:mainContext.seed});
    delisted_desc = delistedData.sort((a, b) => b.quantity - a.quantity);
    desc = completeData.sort((a, b) => b.appreciation! - a.appreciation!);
    let t = 5; let etcsum = 0;
    for (let j = 0; j < desc.length; j++) {
        if(t>0){
            t--;pieSeries.push({name:completeData[j].symbol.toUpperCase(),
                                appreciation:completeData[j].appreciation,
                                color:sliceColor[4+(t*-1)],
                                legendFontColor: textColor(darkmode),
                                legendFontSize: 15});
        }else{
            etcsum += completeData[j].appreciation!;
        }
    }
    if(etcsum>0){
      pieSeries.push({name:I18n.t('other'),appreciation:etcsum,color:sliceColor[5],legendFontColor: textColor(darkmode),legendFontSize: 15});
    }
    const asso:Coin_Asso[] = [];
    desc.forEach((i) => {
        asso.push({
            id:i.symbol,
            avg_price:i.avg_price,
            index:t,
            quantity:i.quantity,
            img:i.img!,
            crntPrice:i.crntPrice!,
            name:i.name!,
            rank:i.rank!,
            url:i.url!
        });
    })
    const total = dynamicRound(thesum,2);
    const normalpnl = returnPNL(total,mainContext.totalbuyin);
    const constpnl = returnPNL(total,mainContext.totalbuyin_const);
    const obj:Obj = {"piedata":pieSeries,"associatedData":asso,
    "totalAppreciation":total,"pnl":normalpnl,"pnl_const":constpnl,"delisted":delisted_desc};
    console.log("updated portfolio");
    return obj
}

// Trader

export const lengthOfDecimal = (i:number|string):number => {
    let asStr = i.toString();
    if(char_count(asStr,".")<1 || asStr[asStr.length-1]==="."){
        return 0;
    }else{
        let j = i.toString();
        let k = j.split(".");
        let decimalpart = k[1].toString();
        return decimalpart.length;
    }
}

export const char_count = (str:string, letter:string):number => {
    var letter_Count = 0;
    for (var position = 0; position < str.length; position++) {
        if (str.charAt(position) == letter) {
            letter_Count += 1;
        }
    }
    return letter_Count;
}

// global_details
const _sliceColor = ['#303f9f','#1976d2','#0288d1', '#0097a7', '#009688', '#4caf50', '#8bc34a', '#aed581', '#009688', '#4caf50'];

export const cal_global_details = (darkmode:boolean, bigcaps:any, coindata:Coin[]):{'desc':Coin[],'pie':PieData[]} => {
    const symbols = Object.keys(bigcaps);
    let _coinData = [];
    let _allData:Coin[] = [];
    let pie:PieData[] = [];
    let percentage = 100;
    let limit = 7;
    for(let i = 0; i < symbols.length; i++){
        let symb = symbols[i];
        let coin = coindata.find(i => i.symbol.toLowerCase() === symb.toLowerCase());
        if(coin){
            percentage -= bigcaps[symb];
            _coinData.push({name:coin!.symbol.toUpperCase(),dominance:fastRound(bigcaps[symb]), legendFontColor:textColor(darkmode), legendFontSize: 15});
            _allData.push(coin!)
        }
    }
    let desc = _allData.sort((a, b) => b!.market_cap! - a!.market_cap!);
    _coinData.sort((a, b) => b.dominance - a.dominance);
    for (let i = 0; i < limit; i++) {
        pie.push(_coinData[i])
        pie[i]['color'] = _sliceColor[i];
    }
    pie.push({name:I18n.t('other'),dominance:percentage, color: '#d9e3f0', legendFontColor: textColor(darkmode), legendFontSize: 15});
    return {'desc':desc,'pie':pie}
}