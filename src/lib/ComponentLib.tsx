import React from 'react';
import { AdMobBanner } from 'expo-ads-admob';
import { View } from 'react-native';
import { bottom_tab_nav_Height } from './StyleLib';

interface BannerProps {
    adblock:boolean
    bannerID:string
    errorCallback:(e:any)=>void
    noMargin:boolean
}

export const BannerAD:React.FC<BannerProps> = ({adblock,bannerID,errorCallback,noMargin}) => {
    if(adblock){
        return(<></>)
    }else{
        return(
            <View style={{alignSelf:"center",position:"absolute",bottom:noMargin?0:bottom_tab_nav_Height()}}>
                <AdMobBanner
                    bannerSize="fullBanner"
                    adUnitID={bannerID} // Test ID, Replace with your-admob-unit-id
                    servePersonalizedAds={true} // true or false
                    onDidFailToReceiveAdWithError={errorCallback}
                />
            </View>
        )
    }
}