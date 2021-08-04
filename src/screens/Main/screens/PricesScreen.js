import React from 'react'
import { createStackNavigator } from "@react-navigation/stack";
import Prices from '../../../components/Prices';
import TradingScreen from './TradingScreen';

const Stack = createStackNavigator();

const globalScreenOptions ={headerShown: false}

const PricesScreen = ({userEmail,fav,coindata,changeData,ispro,bannerID,upgraded}) => {

    return (
        <Stack.Navigator initialRouteName="Stack_Prices" screenOptions={globalScreenOptions}>
            <Stack.Screen name='Stack_Prices'
                children={()=><Prices userEmail={userEmail}fav={fav}coindata={coindata}changeData={changeData}ispro={ispro}bannerID={bannerID}upgraded={upgraded}/>}
            />
            <Stack.Screen name='Stack_Prices_Trading' component={TradingScreen}/>
        </Stack.Navigator>
    )
}

export default PricesScreen