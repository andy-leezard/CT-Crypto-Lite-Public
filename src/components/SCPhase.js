import React from 'react';
import { View, ScrollView } from 'react-native';
import { useColorScheme } from "react-native-appearance";
import SC from './SC';
import Env from '../env.json';

const SCPhase = ({route, navigation}) => {
    const scheme = useColorScheme();
    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const bgColor = () => {
        return bool_isDarkMode() ? "#000000":"#FFFFFF";
    }

    return (
        <View style={{flex:1,backgroundColor:bgColor(),paddingTop:15}}>
            <View style={{paddingHorizontal: 20}}>
                <ScrollView>
                    <SC crntversion={Env.currentVersion}/>
                </ScrollView>
            </View>
        </View>
    )
}

export default SCPhase
