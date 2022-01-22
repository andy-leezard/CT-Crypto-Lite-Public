import React from "react"
import { AdMobBanner } from "expo-ads-admob"
import { View } from "react-native"
import { bottom_tab_nav_Height } from "./Constants"

interface BannerProps {
  inset: number
  bannerID: string
  errorCallback: (e: any) => void
  noMargin?: boolean
  trackingPermitted: boolean
}

export const BannerAD: React.FC<BannerProps> = ({
  inset,
  bannerID,
  errorCallback,
  noMargin,
  trackingPermitted,
}) => {
  return (
    <View
      style={{
        alignSelf: "center",
        position: "absolute",
        bottom: noMargin ? 0 : bottom_tab_nav_Height + inset * 2,
      }}
    >
      <AdMobBanner
        bannerSize="fullBanner"
        adUnitID={bannerID}
        servePersonalizedAds={trackingPermitted}
        onDidFailToReceiveAdWithError={errorCallback}
      />
    </View>
  )
}
