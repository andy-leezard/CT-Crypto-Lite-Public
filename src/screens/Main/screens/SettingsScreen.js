import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import { useColorScheme } from "react-native-appearance";
import Settings from '../../../components/Settings';
import TNCPhase from '../../../components/TNCPhase';
import SCPhase from '../../../components/SCPhase';
import AccountRemover from '../../../components/AccountRemover';
import EditUsername from '../../../components/EditUsername';
import ConfigurePin from '../../../components/ConfigurePin';
import AdRemover from '../../../components/AdRemover';

const Stack = createStackNavigator();

const PricesScreen = ({ userEmail, username, requirePIN, ispro, bannerID, boughtPro }) => {
    const scheme = useColorScheme();

    const globalScreenOptions_dark ={
        headerStyle: {backgroundColor: "#8374e3"},
        headerTitleStyle: {color:"#FFFFFF"},
        headerTintColor: "#FFFFFF"
    }
    const globalScreenOptions_light ={
        headerStyle: {backgroundColor: "#8681FF"},
        headerTitleStyle: {color:"#000000"},
        headerTintColor: "#000000"
    }
    const bool_isDarkMode = () => {
        return scheme === "dark";
    }

    return (
        <Stack.Navigator initialRouteName="Stack_Settings" screenOptions={bool_isDarkMode() ? globalScreenOptions_dark : globalScreenOptions_light}>
            <Stack.Screen name='Stack_Settings' options={{title:"Settings"}}
                children={()=><Settings userEmail={userEmail} username={username} requirePIN={requirePIN} ispro={ispro} bannerID={bannerID} boughtPro={boughtPro}/>}
            />
            <Stack.Screen name='Stack_Settings_TNC' options={{title:"Data & Terms of Use"}} component={TNCPhase}/>
            <Stack.Screen name='Stack_Settings_SC' options={{title:"Support & Contact"}} component={SCPhase}/>
            <Stack.Screen name='Stack_Settings_AR' options={{title:"Advanced Options"}} component={AccountRemover}/>
            <Stack.Screen name='Stack_Settings_NU' options={{title:"Edit Profile"}} component={EditUsername}/>
            <Stack.Screen name='Stack_Settings_CP' options={{title:"PIN Configuration"}} component={ConfigurePin}/>
            <Stack.Screen name='Stack_Settings_UP' options={{title:"Upgrade"}} component={AdRemover}/>
        </Stack.Navigator>
    )
}

export default PricesScreen