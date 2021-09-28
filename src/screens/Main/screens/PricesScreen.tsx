import React, { useContext } from 'react'
import { createStackNavigator } from "@react-navigation/stack";
import Prices from '../../../components/Prices';
import GlobalDetails from '../../../components/GlobalDetails';
import i18n from 'i18n-js';
import { GlobalContext, TradingContext } from '../../../StateManager';
import { GlobalContextInterfaceAsReducer, TradingContextInterfaceAsReducer } from '../../../lib/Types';
import { defaultBg_onlyDark, textColor } from '../../../lib/StyleLib';

const Stack = createStackNavigator();

const PricesScreen:React.FC = () => {
    const globalContext = useContext<GlobalContextInterfaceAsReducer>(GlobalContext);
    const tradingContext = useContext<TradingContextInterfaceAsReducer>(TradingContext);

    return (
        <Stack.Navigator initialRouteName="Stack_Prices" screenOptions={{
            headerTitleStyle: {color:textColor(globalContext.state.env.darkmode!)},
            headerTintColor: textColor(globalContext.state.env.darkmode!),
            /*headerStyle: {
                backgroundColor: (tradingContext.state) ? '#7F7F7F':defaultBg_onlyDark(globalContext.state.env.darkmode!),
            }*/
          }}>
            <Stack.Screen name='Stack_Prices' component={Prices}/>
            <Stack.Screen name='Stack_Prices_Global' options={{title:i18n.t('global_details'),headerBackTitle:i18n.t('cancel')}} component={GlobalDetails}/>
        </Stack.Navigator>
    )
}

export default PricesScreen