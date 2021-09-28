import Env from '../env.json';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName } from 'react-native-appearance';

export const storeTheme = async (fallback:ColorSchemeName):Promise<void> => {
    try{
      await AsyncStorage.setItem('theme', fallback);
      console.log("theme set to :",fallback);
    }catch(e){
      console.log("Error storing theme value ! : ",e);
    }
}

export const themeToBoolean = (theme:string):boolean => {
    /**
     * @param {string} theme expected to get either 'light' or 'dark'.
     */
    return Boolean(theme === 'dark');
}
export const themeToString = (darkmode:boolean) => {
    return (darkmode) ? 'dark':'light';
}
export const brandColor = (darkmode:boolean) => {
    return darkmode ? Env.brandText_Dark:Env.brandText_Light;
}
export const focusedColor = (darkmode:boolean) => {
    return darkmode ? Env.tab_focus_Dark:Env.tab_focus_Light;
}
// Bottom-tab navigator height
export const bottom_tab_nav_Height = () => {
    return (Platform.OS === 'ios') ? 100:65;
}
// Bottom-tab navigator height
export const dynamic_bottom_tab_Height = (adblock:boolean) => {
    if(adblock){
        return (Platform.OS === 'ios') ? 192:146;
    }else{
        return (Platform.OS === 'ios') ? 252:206;
    }
}

// Start - Main Controller
export const dynamicColor_marketChange = (i:number) => {return (i>=0) ? "#49c467":"#FF4343";}
export const bgColor = (darkmode:boolean) => {
    return darkmode ? "#000000":"#FFFFFF";
}
export const unfocusedColor = (darkmode:boolean) => {
    return darkmode ? "#DBDBDB":"#454545";
}
// End - Main Controller
// Start - PortfolioScreen
export const textColor = (darkmode:boolean) => {
    return darkmode ? "#FFFFFF":"#000000";
}
// End - PortfolioScreen
// Start - Settings
export const subTextColor = (darkmode:boolean) => {
    return darkmode ? "#B5B5B5":"#757575";
}
// End - Settings
// Start - AccountRemover
export const containerColor = (darkmode:boolean) => {
    return darkmode ? "#2E2E2E":"#E8E8E8";
}
export const containerRadiusColor = (darkmode:boolean) => {
    return darkmode ? "#CCCCCC":"#4A4A4A";
}
// End - AccountRemover
// Start - GlobalDetails
export const containerColor_bis = (darkmode:boolean) => {
    return darkmode ? "#1c1c1c":"#e8e8e8";
}
export const containerRadiusColor_bis = (darkmode:boolean) => {
    return darkmode ? "#a196b5":"#8c829e";
}
export const subTextColor_bis = (darkmode:boolean) => {
    return darkmode ? "#CCCCCC":"#8F8F8F";
}
export const buyColor = (darkmode:boolean) => {
    return darkmode ? Env.buyColor_dark:Env.buyColor_light;
}
export const sellColor = (darkmode:boolean) => {
    return darkmode ? Env.sellColor_dark:Env.sellColor_light;
}
export const dynamicColor = (darkmode:boolean,i:number) => {
    return (i>=0) ? buyColor(darkmode) : sellColor(darkmode);
}
// End - GlobalDetails
// Start - Portfolio
export const subTextColor_ter = (darkmode:boolean) => {
    return darkmode ? "#CCCCCC":"#737373";
}
// End - Portfolio
// Start - TradingScreen
export const buyColor_rgb = (darkmode:boolean) => {
    return darkmode ? "rgba(66,185,93,1)":"rgba(26,138,53,1)";
}
export const sellColor_rgb = (darkmode:boolean) => {
    return darkmode ? "rgba(255,90,74,1)":"rgba(255,67,48,1)";
}
export const unitContainerColor = (darkmode:boolean) => {
    return darkmode ? "white":"#2294DB";
}
export const unitTextColor = (darkmode:boolean) => {
    return darkmode ? "#468559":"white";
}
export const containerColor_ter = (darkmode:boolean) => {
    return darkmode ? "#333333":"#737373";
}
// End - TradingScreen

// AuthScreens
export const containerColor_quater = (darkmode:boolean) => {
    return darkmode ? "#404040":"#e8e8e8";
}

// Trader
export const containerColor_quinquies = (darkmode:boolean) => {
    return darkmode ? "#333333":"#5C5C5C";
}

// Trace_RenderGlobalChange
export const effectColor = (darkmode:boolean) => {
    return darkmode ? "#CCBB8B":"#947A2F";
}

// Prices
export const containerColor_sexies = (darkmode:boolean) => {
    return darkmode ? "#1A1A1A":"#E3E3E3";
}
export const inputRadiusColor = (darkmode:boolean) => {
    return darkmode ? "#383838":"#8c829e";
}
export const intervalContainerColor = (darkmode:boolean) => {
    return darkmode ? "#FFFFFF":"#bdbeff";
}

export const defaultBg = (darkmode:boolean) => {
    return darkmode ? "#121212":"#F2F2F2"
}
export const defaultBg_onlyDark = (darkmode:boolean) => {
    return darkmode ? "#121212":"#FFFFFF"
}