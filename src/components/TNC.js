import React from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '@react-navigation/native';

const TNC = ({candeleteacc}) => {
    const { colors } = useTheme();

    return (
    <View>
        <Text style={{fontSize: 20,fontWeight: "700",color:colors.text}}>Terms</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>This page ("Terms", "Conditions" or "Disclaimer") sets forth the general guidelines and terms of your ("user's") use of CoinTracer ("App", "this app" or "Service") created by Andy Lee (hereinafter reffered to as "CoinTracer", "I", "My", "Me" or "AndyLeeDev").</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>By downloading, accessing and using this app, you acknowledge that you ("user") have read, understood, and agree with the terms of the Disclaimer as well as those of the others below.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>I may modify or change these Terms at any time and at my sole discretion. If I do so, I will provide notice of such changes by sending an email ("legal notifications") to your provided email address in the fittest delay.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>If you are entering into this Disclaimer on behalf of a business or other legal entity, you represent that you have the authority to bind such entity to this Disclaimer, in which case the terms "User", "you" or "your" shall refer to such entity.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>If you do not have such authority, or if you do not agree with the terms of this Disclaimer, you must not accept this Disclaimer and may not access and use this app.</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:colors.text}}>Service & Disclaimer</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>CoinTracer is a mobile application that simulates cryptocurrency investment, using real-time data fetched from Coingecko.com. By registering, you get 1000 VUSD (Virtual US dollars or "virtual fiat currency") and an initialized portfolio. VUSD is not a real currency and cannot be withdrawn.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>This app does not operate actual cryptocurrency trading services and is built simply and purely for educational & recreational purposes to help people try out simulated cryptocurrency investment. This app does not charge anything and is completely free.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>To finance the backend server load, this app may display monetized advertisements ("ads") powered by AdMob. Users can deactivate these ads by upgrading their accounts. Upgrading costs only a certain amount of VUSD.</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:colors.text}}>Privacy & Account</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>To use the Service, you need to create an account. By doing so, you acknowledge that you fully understand and agree with the Terms of use.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>It is recommended to use a real email address in order to receive expected emails such as legal notifications and password reset requests. Any problem caused by disregarding this recommendation will be solely of your responsibility.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>This app stores data that is directly provided by the user in the backend server storage. The user data can be permanently deleted on demand by deleting user account. All deleted user data is irrecoverable. You can delete your account at any time. {candeleteacc}</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:colors.text}}>License</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>This License Agreement is between you and CoinTracer, and governs your use of the CoinTracer app made available for use on smartphones and other electronic devices.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>CoinTracer grants you a limited, non-exclusive, non-transferable and revocable license to use the CoinTracer App for your personal, non-commercial purposes. You may only use the CoinTracer app on a device that you own or control and that is permitted by any applicable usage rules applied by your device's manufacturer or by the marketplace at which I have made the app available.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>The terms of this license will also govern any updates provided by CoinTracer that replace and/or supplement the original app, unless such update is accompanied by a separate license, in which case the terms of that license will govern.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>However, unless I expressly state otherwise, your right to use the Service does not include: </Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>- reverse engineering, decompiling or access to the Service in order to build a competitive product or service.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>- downloading (other than page caching) of any portion of the Service or any information contained therein.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>- using the Service other than for its intended purposes</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:colors.text}}>Intellectual Property Rights</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>The design of the CoinTracer app along with the texts, scripts, graphics, interactive features and the like created by CoinTracer, as well as the trademarks, service marks and logos contained therein are owned by or licensed to CoinTracer, subject to copyright and other intellectual property rights and international conventions.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>CoinTracer provides the Service to you, as is, for your information and personal use only.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>CoinTracer reserves all rights not expressly granted in and to the Service. You agree to not engage in the use, copying, or distribution of any of the Service other than expressly permitted herein, including any use, copying or distribution of posts of your contacts obtained through the Service for any commercial purposes.</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>These terms shall be governed by and constructed in accordance with French law, and any dispute between you and CoinTracer relating to these Terms will be subject to the exclusive jurisdiction of the courts of France.</Text>
        <Text style={{fontSize: 20,fontWeight: "700",color:colors.text}}>Contacts</Text>
        <Text style={{fontSize: 14,fontWeight: "500",color:colors.text}}>You are always welcome to contact CoinTracer for any feedback, questions, complaints or claims you may have related to the Service. Please direct your requests to: @AndyLee_dev (Twitter)</Text>
    </View>
    )
}

export default TNC