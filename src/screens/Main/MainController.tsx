import React, {
  useEffect,
  useState,
  useContext,
  useReducer,
  useMemo,
  forwardRef,
  useRef,
} from "react"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  TradingContext,
} from "../../ContextManager"
import { DocumentSnapshot } from "@firebase/firestore-types"
import * as StyleLib from "../../lib/StyleLib"
import { AD_controller, UserSnapshot } from "../../lib/Types"
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native"
import { Image } from "react-native-elements"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Env from "../../env.json"
import { db, auth, rdb } from "../../../firebase"
import SettingsScreen from "./screens/SettingsScreen"
import PricesScreen from "./screens/PricesScreen"
import PortfolioScreen from "./screens/PortfolioScreen"
import LoadingScreen from "../Auth/LoadingScreen"
import axios from "axios"
import WelcomeScreen from "../Auth/WelcomeScreen"
import i18n from "i18n-js"
import { parse_global_data } from "../../lib/JSFuncLib"
import { BannerAD } from "../../lib/ComponentLib"
import { coin_reducer, Enum_app_actions } from "../../lib/Reducers"
import { bannerAdId, baseapi, range, sleep, _getAPI } from "../../lib/FuncLib"
import { banner_ad_height, bottom_tab_nav_Height } from "../../lib/Constants"
import AdMobRewardedFC from "../../components/AdMobRewardedFC"

const Tab = createBottomTabNavigator()
let mounted = true
let verificationRequired = false
let verified = false
let bypass_email_verification = false

const MainController: React.FC = () => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const [coinState, coinDispatch] = useReducer(coin_reducer, null)

  const [pinAnswer, setPinAnswer] = useState<string>("")
  const [postdata, setPostData] = useState<any[]>([])
  const [processing, setProcessing] = useState<boolean>(false)
  const [fetching, setFetching] = useState<boolean>(false)
  const [fetching_g, setFetching_g] = useState<boolean>(false)
  const [pinValidated, setPinValidated] = useState<boolean>(false)
  const [bannerID, setBannerID] = useState<string | null>(null)
  const [forceRerender, setForceRerender] = useState(false)
  const [coindata, setCoindata] = useState<any>() // spot
  const [changedata, setChangedata] = useState<any>()
  const [extra, setExtra] = useState<boolean>(false)
  const [usingFullData, setUsingFullData] = useState<boolean>(false)
  const [sentLog, setSentLog] = useState<boolean>(false)
  const [adEnv, setAdEnv] = useState<AD_controller | null>(null)

  const [user, setUser] = useState<UserSnapshot | null>(null)
  const insets = useSafeAreaInsets()
  const [rewarded_ad_available, set_rewarded_ad_available] =
    useState<boolean>(false)
  const adControllerRef = useRef<any>(null)

  const adblock = useMemo(() => {
    return Boolean(
      user?.adblock || adEnv?.globalAdBlock || adEnv?.globalAdBlock || sentLog
    )
  }, [user, adEnv, sentLog])

  const dynamic_banner_ad_height = useMemo(() => {
    return adblock ? 0 : banner_ad_height
  }, [adblock])

  const handlePinAnswer = (i: string) => {
    setPinAnswer(i)
    if (!pinValidated && i === user?.pin) {
      setPinValidated(true)
    }
  }
  const tryQueryPin = () => {
    Alert.alert(i18n.t("pin_recovery"), i18n.t("pin_recovery_msg"), [
      { text: i18n.t("confirm"), onPress: () => queryPIN() },
      { text: i18n.t("s_cancel"), style: "cancel" },
    ])
  }
  const queryPIN = async () => {
    setProcessing(true)
    Alert.alert(
      i18n.t("pin_recovery"),
      i18n.t("pin_recovery_msg_done") + " : " + gc.state.auth.userEmail,
      [{ text: i18n.t("ok") }]
    )
    try {
      axios.post(Env.cfapi_queryPIN, { userEmail: gc.state.auth.userEmail })
    } catch (e) {
      Env.dev && console.log(e)
    } finally {
      mounted && setProcessing(false)
    }
  }
  const useAllData = (): void => {
    if (!usingFullData) {
      setUsingFullData(true)
      updatePriceData(true)
    }
  }
  const reloadAll = (all: boolean): void => {
    if (all) {
      setExtra(!extra)
      return
    } else {
      updateGlobalData()
      updatePriceData()
    }
  }
  const setPriceData = (_res: any) => {
    let _arr = [..._res[0], ..._res[1], ..._res[2], ..._res[3]]
    let _celo = _arr.find((i) => i.symbol === "celo")
    let celo = { ..._celo }
    if (celo) {
      celo.name = "Feel coin"
      celo.symbol = "FEEL"
      celo.image = Env.feelcoinIcon
      celo.id = "feel"
      _arr.push(celo)
    }
    setCoindata(_arr)
  }
  const updateGlobalData = async () => {
    if (fetching_g) {
      return
    } else {
      setFetching_g(true)
    }
    try {
      let res = await axios.get(Env.cgapi_global)
      const _res = res.data.data
      mounted && setChangedata(parse_global_data(_res))
      Env.dev &&
        console.log(
          "Main Controller - Global Data fetched at :" +
            new Date().toLocaleString()
        )
    } catch (e) {
      Env.dev && console.log(e)
    } finally {
      mounted && setFetching_g(false)
    }
  }
  const updatePriceData = async (extended?: boolean) => {
    if (fetching) {
      return
    } else {
      setFetching(true)
      try {
        let result = await Promise.all(
          range(4).map((i) =>
            _getAPI(baseapi({ page: i, useFullData: usingFullData, extended }))
          )
        )
        mounted && setPriceData(result)
        Env.dev &&
          console.log(
            "Main Controller - Refreshed Coin Data at :" +
              new Date().toLocaleString()
          )
      } catch (e) {
        Env.dev &&
          console.log(
            "Main Controller - Could not fetch coin data because : " + e
          )
      } finally {
        mounted && setFetching(false)
      }
    }
  }
  const validate_email = async () => {
    Env.dev && console.log("start loop")
    while (!verified && !bypass_email_verification) {
      Env.dev &&
        console.log(
          "checking if " +
            gc.state.auth.userEmail +
            " is a verified email address..."
        )
      if (auth.currentUser) {
        if (auth.currentUser.emailVerified) {
          bypass_email_verification = true
          verified = true
          Env.dev &&
            console.log(gc.state.auth.userEmail + "is a verified email address")
        } else {
          await auth.currentUser.reload()
          let state = auth.currentUser.emailVerified ?? false
          Env.dev &&
            console.log(
              "checked email verification status as [" +
                state +
                "] at :" +
                new Date().toLocaleString()
            )
          verified = state
          if (state) {
            Env.dev &&
              console.log(
                "Email successfully verified at :" + new Date().toLocaleString()
              )
          } else {
            verificationRequired = true
          }
        }
      }
      await sleep(2500)
    }
    Env.dev && console.log("LOOP OVER")
  }
  const adError = (e: any) => {
    Env.dev && console.log("Error showing banner ad ! : ", e)
    if (!sentLog) {
      setSentLog(true)
      const timestamp = new Date().toUTCString()
      db.collection("globalEnv")
        .doc("ad_controller")
        .collection("logs")
        .doc(timestamp)
        .set({
          type: "Banner",
          error: e,
          reporter: gc.state.auth.userEmail,
        })
    }
  }

  useEffect(() => {
    Env.dev &&
      console.log(
        "Main Controller - useEffect with Interval - interval is : ",
        gc.state.serverSide.r_interval,
        "(coins) and ",
        gc.state.serverSide.r_interval_g,
        " (global)."
      )
    const interval_g = setInterval(() => {
      if (!fetching_g && gc.state.serverSide.f_c_render) {
        updateGlobalData()
        Env.dev &&
          console.log(
            "Main Controller - useEffect with Interval - trigger update global data"
          )
      } else {
        Env.dev &&
          console.log(
            "Main Controller - useEffect with Interval - did not trigger update global data"
          )
      }
    }, gc.state.serverSide.r_interval_g)
    const interval = setInterval(() => {
      if (usingFullData) {
        updatePriceData()
        Env.dev &&
          console.log(
            "Main Controller - useEffect with Interval - trigger update price data - using full data"
          )
      } else if (!fetching && gc.state.serverSide.f_c_render) {
        updatePriceData()
        Env.dev &&
          console.log(
            "Main Controller - useEffect with Interval - trigger update price data"
          )
      } else {
        Env.dev &&
          console.log(
            "Main Controller - useEffect with Interval - did not trigger update price data"
          )
      }
    }, gc.state.serverSide.r_interval)
    return () => {
      clearInterval(interval)
      clearInterval(interval_g)
      Env.dev &&
        console.log(
          "Main Controller - useEffect with Interval - cleared intervals"
        )
    }
  }, [gc, extra, usingFullData])

  useEffect(() => {
    if (gc.state.serverSide.f_c_render) {
      updatePriceData()
      updateGlobalData()
    }
    const dbRef = rdb.ref("coins") // deprecated due to expensive costs
    const dbRef_g = rdb.ref("global") // deprecated due to expensive costs
    const ad_env_snapshot = db
      .collection("globalEnv")
      .doc("ad_controller")
      .onSnapshot((doc: DocumentSnapshot) => {
        const data = doc.data()!
        const override_ = data.always_test_banner ?? false
        Env.dev &&
          console.log(
            "Main Controller - AD config : banner id test status is : ",
            override_
          )
        if (Env.Test_ads) {
          setBannerID(bannerAdId(true))
        } else {
          setBannerID(bannerAdId(override_))
        }
        setAdEnv({
          testAD_video: data.always_test ?? false,
          testAD_banner: data.always_test_banner ?? false,
          globalAdBlock: data.globalAdBlock ?? false,
          rewards: {
            _1: data.video_reward_1 ?? 750,
            _2: data.video_reward_2 ?? 500,
            _7: data.video_reward_7 ?? 350,
            _20: data.video_reward_20 ?? 250,
            _70: data.video_reward_70 ?? 100,
          },
        })
      })
    dbRef.on("value", (snapshot) => {
      if (
        !fetching &&
        typeof snapshot != "undefined" &&
        !gc.state.serverSide.f_c_render
      ) {
        const changedPost = snapshot.val()
        if (changedPost) {
          setCoindata(changedPost)
          Env.dev &&
            console.log(
              "Main Controller - RDB Snapshot : Coin Data fetched at :" +
                new Date().toLocaleString()
            )
        } else {
          Env.dev &&
            console.warn(
              "Main Controller - RDB Snapshot : Error : Coin Data undefined :"
            )
        }
      } else {
        Env.dev &&
          console.log(
            "Main Controller - RDB Snapshot triggered for [coin data] but the user chose to manually refresh at :" +
              new Date().toLocaleString()
          )
      }
    })
    dbRef_g.on("value", (snapshot) => {
      if (
        typeof snapshot != "undefined" &&
        !gc.state.serverSide.f_c_render &&
        !usingFullData
      ) {
        const changedPost = snapshot.val()
        if (changedPost) {
          setChangedata(parse_global_data(changedPost))
          Env.dev &&
            console.log(
              "Main Controller - RDB Snapshot : Global Data fetched at :" +
                new Date().toLocaleString()
            )
        } else {
          Env.dev &&
            console.warn(
              "Main Controller - RDB Snapshot : Error : Global Data undefined :"
            )
        }
      } else {
        Env.dev &&
          console.log(
            "Main Controller - RDB Snapshot triggered for [global data] but the user chose to manually refresh at :" +
              new Date().toLocaleString()
          )
      }
    })
    return () => {
      dbRef.off()
      dbRef_g.off()
      ad_env_snapshot()
    }
  }, [extra])

  useEffect(() => {
    const ref = db.collection("users").doc(gc.state.auth.userEmail!)
    const query = db
      .collection("users")
      .doc(gc.state.auth.userEmail!)
      .collection("wallet")
      .where("quantity", ">", 0)
    const unsubscribe_user = ref.onSnapshot((doc: DocumentSnapshot) => {
      if (doc.exists) {
        const data = doc.data()!
        Env.dev &&
          console.log(
            "Main Controller - user snapshot triggered at",
            new Date().toLocaleString()
          )
        let __override = data.override ?? false
        if (__override) {
          bypass_email_verification = __override
          verified = __override
        }
        setUser({
          vip: data.boughtPro ?? false,
          fav: data.favorites ?? [],
          pin: data.pin ?? "",
          pnldate: data.pnldate ?? new Date().getTime(),
          adblock: data.adblock ?? false,
          referrals: data.referrals ?? [],
          requirePIN: data.requirepin ?? false,
          seed: data.seed ?? 0,
          totalbuyin: data.totalbuyin ?? 0,
          totalbuyin_const: data.totalbuyin_constant ?? 0,
          username: data.username ?? "Trader",

          override: __override,
          platform: data.platform ?? "unknown",
          lastActivity: new Date().toUTCString(),
          referral_code: data.referral_code ?? "",
          reward_acc: data.reward_acc ?? 0,
          times_watched_ads: data.times_watched_ads ?? 0,
          push_notif_tokens: data.push_notif_tokens ?? [],
          push_notif_tokens_unsubscribed:
            data.push_notif_tokens_unsubscribed ?? [],
          custom_profile_image: data.image_uri ?? "",
          status_msg: data.status_msg ?? "",
          bullish_index: data.bullish_index ?? 0,
          referral: data.referral ?? "",
        })
        if (gc.state.env.notification.tokenID && data.push_notif_tokens) {
          gc.dispatch({
            type: Enum_app_actions.SET_NOTIF_SUBSCRIBED,
            payload: data.push_notif_tokens.includes(
              gc.state.env.notification.tokenID
            ),
          })
        }
      } else {
        Env.dev && console.log("Tried snapshot but the document does not exist")
      }
    })
    const unsubscribe_wallet = query.onSnapshot((qs) => {
      let postData_local: any[] = []
      qs.forEach((doc: any) => {
        postData_local.push({ ...doc.data(), id: doc.id })
        // removed { ... symbol:doc.data().symbol ?? doc.id} cause there is already a symbol fetched from the server
        // doc.data() is never undefined for query doc snapshots
      })
      Env.dev &&
        console.log(
          "Main Controller - wallet snapshot triggered at",
          new Date().toLocaleString()
        )
      setPostData(postData_local)
    })
    return () => {
      unsubscribe_user()
      unsubscribe_wallet()
    }
  }, [extra])

  useEffect(() => {
    if (forceRerender) {
      setForceRerender(false)
      Env.dev && console.log("force rerender")
    }
  }, [forceRerender])

  useEffect(() => {
    validate_email()
    return () => {
      mounted = false
    }
  }, [])

  const show_rewarded_ad_alert = (message_reward: string | number) => {
    Alert.alert(
      `${i18n.t("random_reward_pre")} ${i18n.t("random_reward_suf")}`,
      `${i18n.t("you_earned_pre")} ${message_reward} ${i18n.t(
        "you_earned_suf"
      )}`,
      [{ text: i18n.t("cool") }]
    )
  }

  const show_rewarded_ad_error_message = () => {
    Alert.alert(i18n.t("reward_er1_alert"), i18n.t("reward_er1_msg"), [
      { text: i18n.t("ok") },
    ])
  }

  if (
    user === null ||
    bannerID === null ||
    !coindata ||
    !changedata ||
    adEnv === null
  ) {
    return (
      <LoadingScreen
        darkmode={gc.state.env.darkmode!}
        reloadable={true}
        reload={() => reloadAll(true)}
      />
    )
  }

  const securityScreen = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: StyleLib.bgColor(gc.state.env.darkmode!),
          paddingBottom: 100,
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <View>
        <Image
          source={require("../../assets/icon_rounded.png")}
          style={{ width: 40, height: 40, marginBottom: 5 }}
        />
      </View>
      <Text
        style={[
          {
            color: StyleLib.brandColor(gc.state.env.darkmode!),
            fontSize: 24,
            fontWeight: "bold",
          },
        ]}
      >
        {i18n.t("hello")}
        {user.username}
        {i18n.t("hello_suf")}
      </Text>
      <View style={{ width: 300, alignItems: "center", marginTop: 50 }}>
        <TextInput
          style={[
            styles.input,
            {
              color: StyleLib.textColor(gc.state.env.darkmode!),
              borderStyle: "solid",
              borderWidth: 2,
              borderColor: StyleLib.brandColor(gc.state.env.darkmode!),
            },
          ]}
          autoCorrect={false}
          autoFocus={true}
          placeholder={i18n.t("pin_code")}
          secureTextEntry={true}
          placeholderTextColor={StyleLib.subTextColor(!gc.state.env.darkmode!)}
          keyboardType="numeric"
          value={pinAnswer}
          onChangeText={handlePinAnswer}
          maxLength={8}
        />
      </View>
      {!processing && (
        <TouchableOpacity
          style={{ marginBottom: 50 }}
          onPress={tryQueryPin}
          disabled={processing}
        >
          <Text
            style={{
              color: StyleLib.brandColor(gc.state.env.darkmode!),
              fontSize: 14,
              fontWeight: "800",
              marginTop: 20,
              alignSelf: "center",
            }}
          >
            {i18n.t("needhelp_pin")}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => auth.signOut()}>
        <Text
          style={{
            color: StyleLib.brandColor(gc.state.env.darkmode!),
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 70,
            alignSelf: "center",
          }}
        >
          {i18n.t("try_diffID")}
        </Text>
      </TouchableOpacity>

      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            color: StyleLib.brandColor(gc.state.env.darkmode!),
            fontSize: 14,
            fontWeight: "600",
            marginTop: 20,
          }}
        >
          © 2021 | {i18n.t("developed_by")} Andy Lee
        </Text>
        <Text
          style={{
            color: StyleLib.brandColor(gc.state.env.darkmode!),
            fontSize: 14,
            fontWeight: "600",
            marginTop: 10,
          }}
        >
          {Env.currentVersion}
        </Text>
      </View>
    </View>
  )

  const body = (
    <Tab.Navigator
      initialRouteName="Prices"
      screenOptions={{
        tabBarShowLabel: true,
        headerShown: false,
        tabBarStyle: {
          display: coinState ? "none" : "flex",
          position: "absolute",
          elevation: 0,
          backgroundColor: StyleLib.bgColor(gc.state.env.darkmode!),
          height: bottom_tab_nav_Height + insets.bottom,
        },
        tabBarHideOnKeyboard: false,
        tabBarLabelStyle: {
          bottom: 5,
        },
        tabBarLabelPosition: gc.state.env.isTablet
          ? "beside-icon"
          : "below-icon",
      }}
    >
      <Tab.Screen
        name={i18n.t("market")}
        component={PricesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/1x/prices.png")}
              resizeMode="contain"
              style={{
                width: 18,
                height: 18,
                tintColor: focused
                  ? StyleLib.focusedColor(gc.state.env.darkmode!)
                  : StyleLib.unfocusedColor(gc.state.env.darkmode!),
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name={i18n.t("portfolio_s")}
        component={PortfolioScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/1x/portfolio.png")}
              resizeMode="contain"
              style={{
                width: 25,
                height: 25,
                tintColor: focused
                  ? StyleLib.focusedColor(gc.state.env.darkmode!)
                  : StyleLib.unfocusedColor(gc.state.env.darkmode!),
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name={i18n.t("settings")}
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/1x/settings2.png")}
              resizeMode="contain"
              style={{
                width: 18,
                height: 18,
                tintColor: focused
                  ? StyleLib.focusedColor(gc.state.env.darkmode!)
                  : StyleLib.unfocusedColor(gc.state.env.darkmode!),
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )

  const wrapper = (
    <TradingContext.Provider
      value={{
        state: coinState,
        dispatch: coinDispatch,
      }}
    >
      {body}
      {!adblock && (
        <BannerAD
          inset={insets.bottom}
          bannerID={bannerID}
          errorCallback={adError}
          noMargin={Boolean(coinState)}
          trackingPermitted={gc.state.env.trackingPermitted!}
        />
      )}
    </TradingContext.Provider>
  )

  if (
    Boolean(!bypass_email_verification && !verified && verificationRequired)
  ) {
    return (
      <WelcomeScreen
        username={user.username}
        email={gc.state.auth.userEmail!}
      />
    )
  }

  return (
    <MainContext.Provider
      value={{
        rerender: () => setForceRerender(true),
        extend: useAllData,
        reload: reloadAll,
        adEnv: adEnv,
        user: user,
        adBlock: adblock,
        rewardedVideoIsTestID: Boolean(adEnv?.testAD_video),
        fetching: fetching,
        coindata: coindata,
        postdata: postdata,
        changedata: changedata,
        topInset: insets.top,
        bottomInset: insets.bottom,
        banner_ad_height: dynamic_banner_ad_height,
        tab_bar_height: bottom_tab_nav_Height,
        rewarded_ad_available: rewarded_ad_available,
        update_rewarded_ad_state: set_rewarded_ad_available,
        show_rewarded_ad_alert: show_rewarded_ad_alert,
        show_rewarded_ad_error_message: show_rewarded_ad_error_message,
        show_ad: () => {
          if (adControllerRef?.current?.access) {
            adControllerRef.current.access()
          }
        },
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: gc.state.env.darkmode ? "#000000" : "#FFFFFF",
        }}
      >
        {user.requirePIN && pinAnswer !== user.pin && !pinValidated ? (
          securityScreen
        ) : forceRerender ? (
          <LoadingScreen
            darkmode={gc.state.env.darkmode!}
            reloadable={true}
            reload={() => reloadAll(true)}
          />
        ) : (
          wrapper
        )}
      </SafeAreaView>
      <RewardedAdController ref={adControllerRef} />
    </MainContext.Provider>
  )
}

const RewardedAdController = forwardRef((props, ref) => (
  <AdMobRewardedFC {...props} innerRef={ref} />
))

export default MainController

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  input: {
    paddingHorizontal: 10,
    height: 40,
    width: 300,
    margin: 12,
    borderRadius: 10,
    fontSize: 20,
  },
})
