import React from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '@react-navigation/native';
import Env from '../env.json';

const SC = () => {
    const { colors } = useTheme();
    const env = Env.currentVersion;

    return (
    <View>
        <Text style={{fontSize: 19,fontWeight: "700",marginBottom:10,color:colors.text}}>Version & Future updates</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}>Version {env} (August 8 2021)</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}>Potential new features in development :</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}> - Futures & Margin trading</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}> - Orders (stop & limit)</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}> - Notifications</Text>
        <Text style={{fontSize: 19,fontWeight: "700",marginBottom:10,color:colors.text}}>Support</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:0,color:colors.text}}>If you like this app, you can support it by kindly sharing it with fellow traders & investors.</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}>Every impression means a lot, and helps the project move forward</Text>
        <Text style={{fontSize: 19,fontWeight: "700",marginBottom:10,color:colors.text}}>Contact</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}>Feedbacks & Collaboration</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}> - @AndyLee_dev (Twitter)</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}> - Hiiya_Dev#6179 (Discord)</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}>Thank you for using my app. If you are interested in working for this project, feel free to contact me for a collaboration.</Text>
    </View>
    )
}

export default SC
