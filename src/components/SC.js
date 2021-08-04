import React from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '@react-navigation/native';
import Env from '../env.json';

const SC = () => {
    const { colors } = useTheme();
    const env = Env.currentVersion;

    return (
    <View>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}>Version {env} (July 30 2021)</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}>Share this application to support this project.</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}>Potential new features in development : ranking system, futures, stop limit orders, messages and notifications</Text>
        <Text style={{fontSize: 16,fontWeight: "500",marginBottom:5,color:colors.text}}>Feedbacks & Collaboration : @AndyLee_dev (Twitter)</Text>
    </View>
    )
}

export default SC
