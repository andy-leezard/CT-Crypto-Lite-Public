import React, {
  useEffect,
  useContext,
  useState,
  useImperativeHandle,
} from "react"
import { Platform } from "react-native"
import { AdMobRewarded } from "expo-ads-admob"
import { db } from "../../firebase"
import Env from "../env.json"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
} from "../ContextManager"
import { Rewards } from "../lib/Types"
import { dynamicRound } from "../lib/FuncLib"

interface Props {
  innerRef?: any
}

const AdMobRewardedFC: React.FC<Props> = (props: Props) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const [loadedAD, setLoadedAD] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)

  const requestAd = async () => {
    try {
      await AdMobRewarded.requestAdAsync()
      setLoadedAD(true)
      mc.update_rewarded_ad_state(true)
    } catch (error: any) {
      const fallback = Boolean(error.code === "E_AD_ALREADY_LOADED")
      setLoadedAD(fallback)
      mc.update_rewarded_ad_state(fallback)
      Env.dev && console.log(error.message)
    }
  }

  const reportError = async (e: any) => {
    try {
      const msg = e.name ?? e.message ?? JSON.stringify(e)
      const reporter = gc.state.auth.userEmail ?? "anonymous"
      const timestamp = new Date().toUTCString()
      await db
        .collection("globalEnv")
        .doc("ad_controller")
        .collection("logs")
        .doc(timestamp)
        .set({ type: "Video", error: msg, reporter: reporter })
    } catch (e) {
      Env.dev && console.log(e)
    }
  }

  const _set = async () => {
    try {
      if (Env.Test_ads || mc.adEnv.testAD_video) {
        AdMobRewarded.setAdUnitID(
          Platform.OS === "ios"
            ? Env.ios_rewarded_test
            : Env.android_rewarded_test
        )
      } else {
        AdMobRewarded.setAdUnitID(
          Platform.OS === "ios" ? Env.ios_rewarded : Env.android_rewarded
        )
      }
      AdMobRewarded.addEventListener("rewardedVideoDidFailToLoad", (e) => {
        setError(true)
        reportError(e)
      })
      AdMobRewarded.addEventListener("rewardedVideoDidDismiss", () => {
        requestAd()
      })
      AdMobRewarded.addEventListener("rewardedVideoUserDidEarnReward", () => {
        Env.dev && console.log("User Did Earn Reward")
        giveReward(getReward(mc.adEnv.rewards))
      })
      AdMobRewarded.addEventListener("rewardedVideoDidLoad", () => {
        Env.dev &&
          console.log(
            "VideoLoaded with test status : ",
            Env.Test_ads || mc.adEnv.testAD_video
          )
        setLoadedAD(true)
        mc.update_rewarded_ad_state(true)
      })
    } catch (e) {
      reportError(e)
    } finally {
      requestAd()
    }
  }

  useEffect(() => {
    _set()
    return () => {
      AdMobRewarded.removeAllListeners()
    }
  }, [])

  const _handlePress = () => {
    if (error) {
    } else if (loadedAD) {
      showAd()
    }
  }

  const showAd = async () => {
    setLoadedAD(false)
    mc.update_rewarded_ad_state(false)
    try {
      AdMobRewarded.showAdAsync().catch(console.warn)
    } catch (e) {
      reportError(e)
    }
  }

  const getReward = (rewards: Rewards): number => {
    const rndInt = Math.random()
    let bonus = Math.floor(Math.random() * 50 + 1)
    if (rndInt <= 0.01) {
      return rewards._1
    } else if (rndInt <= 0.02) {
      return rewards._2
    } else if (rndInt <= 0.07) {
      return rewards._7
    } else if (rndInt <= 0.3) {
      return rewards._20 + bonus
    } else {
      return rewards._70 + bonus
    }
  }

  const giveReward = async (reward: number) => {
    const userdocRef = db.collection("users").doc(gc.state.auth.userEmail!)
    const userdoc = await userdocRef.get()
    if (!userdoc.exists) {
      return
    }
    const userdata = userdoc.data()!
    const time = new Date().getTime()
    const new_times_watched_ads = (userdata.times_watched_ads ?? 0) + 1
    Env.dev && console.log("REWARD SET TO : ", reward)
    try {
      await Promise.all([
        userdocRef.update({
          seed: dynamicRound(userdata.seed + reward, 2),
          totalbuyin: dynamicRound(userdata.totalbuyin + reward, 2),
          totalbuyin_constant: dynamicRound(
            userdata.totalbuyin_constant + reward,
            2
          ),
          reward_acc: dynamicRound((userdata.reward_acc ?? 0) + reward, 2),
          times_watched_ads: new_times_watched_ads,
        }),
        userdocRef.collection("history").add({
          type: "Earned",
          target: "VUSD",
          targetName: "Virtual USD",
          quantity: reward,
          fiat: 0,
          price: 1,
          imgsrc: Env.fiatCoinIcon,
          orderNum: time,
        }),
      ])
      Env.dev &&
        console.log(
          "User has earned [",
          reward,
          "] VUSD with the rewarded video ad."
        )
      mc.show_rewarded_ad_alert(reward)
    } catch (e) {
      Env.dev &&
        console.log("Error - User did not earn the reward because :", e)
    }
  }

  useImperativeHandle(
    props.innerRef,
    () => ({
      access: () => {
        _handlePress()
      },
    }),
    [loadedAD, error]
  )

  return <></>
}

export default AdMobRewardedFC
