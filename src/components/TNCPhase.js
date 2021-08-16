import React from 'react'
import { Text, View, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native-appearance";
import TNC from './TNC';

const TNCPhase = ({route, navigation}) => {
    const scheme = useColorScheme();

    const bool_isDarkMode = () => {
        return scheme === "dark";
    }
    const textColor = () => {
        return bool_isDarkMode() ? "#FFFFFF":"#000000";
    }

    return (
        <SafeAreaView style={{flex:1, paddingHorizontal: 20}}>
            <TouchableOpacity onPress={()=>navigation.navigate("Stack_Settings_AR")}>
                <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:15}}>
                    <Text style={{flexWrap:"wrap",fontSize:18,fontWeight:"bold",letterSpacing:0.5,color:textColor()}}>Delete Account</Text>
                    <Image
                        source={require("../assets/icons/1x/arrow_darkmode.png")}
                        style={[{width:10,height:10},(!bool_isDarkMode()&&{tintColor:"#000000"})]}
                    />
                </View>
            </TouchableOpacity>
            <View style={{height:Dimensions.get("window").height/1.4, marginBottom:10}}>
                <ScrollView>
                    <TNC candeleteacc={"This option is available in this screen."}/>
                    <View style={{height:100}}/>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default TNCPhase
