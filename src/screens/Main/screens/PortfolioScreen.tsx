import React, { useEffect, useState, useContext } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStackNavigator } from "@react-navigation/stack";
import HistoryScreen from './HistoryScreen';
import Portfolio from '../../../components/Portfolio';
import Loading from '../../../components/Loading';
import I18n from 'i18n-js';
import { GlobalContext, MainContext, PortfolioContext, TradingContext } from '../../../StateManager';
import { textColor } from '../../../lib/StyleLib';
import { post_to_portfolio } from '../../../lib/FuncLib';
import { GlobalContextInterfaceAsReducer, MainContextInterface, Obj, TradingContextInterfaceAsReducer } from '../../../lib/Types';

const Stack = createStackNavigator();
const globalScreenOptions_dark ={
    headerTitleStyle: {color:"#FFFFFF"},
    headerTintColor: "#FFFFFF"
}
const globalScreenOptions_light ={
    headerTitleStyle: {color:"#000000"},
    headerTintColor: "#000000"
}

const PortfolioScreen:React.FC = () => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const mainContext = useContext<MainContextInterface>(MainContext);
    const tradingContext = useContext<TradingContextInterfaceAsReducer>(TradingContext);
    const [portfolio, setPortfolio] = useState<Obj|null>(null);

    useEffect(() => {
        setPortfolio(post_to_portfolio(mainContext,globalContext.state.env.darkmode!));
    }, [mainContext])

    if(portfolio===null){
        return(
            <SafeAreaView style={{flex:1,justifyContent:"center",alignItems:"center"}}>
                <Text style={{color:textColor(globalContext.state.env.darkmode!)}}>{I18n.t('s_processing')}...</Text>
                <Loading width={40} height={40}/>
            </SafeAreaView>
        )
    }

    const dynamicTitle = () => {
        if(tradingContext.state){
            return I18n.t('trading')
        }
        if(I18n.currentLocale().includes('en')){
            return (mainContext.username[mainContext.username.length-1]!=='s')?(mainContext.username+"'s "+I18n.t('portfolio')):(mainContext.username+"' "+I18n.t('portfolio'))
        }else if(I18n.currentLocale().includes('fr')){
            return (mainContext.username[0]!=='a' && mainContext.username[0]!=='o' && mainContext.username[0]!=='e' && mainContext.username[0]!=='i' && mainContext.username[0]!=='u')?(I18n.t('portfolio')+" de "+mainContext.username):(I18n.t('portfolio')+" d'"+mainContext.username)
        }else{
            return (mainContext.username + I18n.t('portfolio'))
        }
    }

    return (
        <PortfolioContext.Provider value={{portfolio:portfolio}}>
            <Stack.Navigator initialRouteName="Stack_Portfolio" screenOptions={globalContext.state.env.darkmode ? globalScreenOptions_dark : globalScreenOptions_light}>
                <Stack.Screen name='Stack_Portfolio' options={{title:`${dynamicTitle()}`}} component={Portfolio}/>
                <Stack.Screen name='Stack_History' options={{title:`${I18n.t('history')}`,headerBackTitle:I18n.t('cancel')}} component={HistoryScreen}/>
            </Stack.Navigator>
        </PortfolioContext.Provider>
    )
}

export default PortfolioScreen
