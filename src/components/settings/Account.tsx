import React, { useContext, useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native"
import I18n from "i18n-js"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
} from "../../ContextManager"
import { storeTheme, textColor, themeToString } from "../../lib/StyleLib"
import * as Device from "expo-device"
import { removeFromArray } from "../../lib/JSFuncLib"
import { db } from "../../../firebase"
import { registerForPushNotificationsAsync } from "../../lib/FuncLib"
import { Enum_app_actions } from "../../lib/Reducers"

interface Props {
  openModal_username: () => void
  navigate_to: (address: string) => void
}

const Account: React.FC<Props> = ({ openModal_username, navigate_to }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const [processing_pro, setProcessing_pro] = useState<boolean>(false)
  const [processing_darkmode, setProcessing_darkmode] = useState<boolean>(false)
  const [processing_notif, setProcessing_notif] = useState<boolean>(false)
  const [switchState_pro, setSwitchState_pro] = useState<boolean>(
    mc.user.adblock
  )
  const [switchState_darkmode, setSwitchState_darkmode] = useState<
    boolean | null
  >(gc.state.env.darkmode)
  const [switchState_notif, setSwitchState_notif] = useState<boolean>(
    Boolean(gc.state.env.notification.subscribed)
  )

  useEffect(() => {
    setSwitchState_pro(mc.user.adblock)
    setSwitchState_darkmode(gc.state.env.darkmode)
    setSwitchState_notif(gc.state.env.notification.subscribed)
  }, [gc, mc])

  const handleToggleNotification = (param: boolean) => {
    gc.state.env.notification.tokenID
      ? toggleNotification(param)
      : requestPermission_notif()
  }

  const toggleNotification = async (param: boolean) => {
    const ref = db.collection("users").doc(gc.state.auth.userEmail!)
    setProcessing_notif(true)
    setSwitchState_notif(param)
    try {
      const doc = await ref.get()
      const data = doc.data()!
      let field = data.push_notif_tokens ?? []
      let un_field = data.push_notif_tokens_unsubscribed ?? []
      if (!param) {
        if (field.includes(gc.state.env.notification.tokenID)) {
          field = removeFromArray(field, gc.state.env.notification.tokenID)
        }
        if (!un_field.includes(gc.state.env.notification.tokenID)) {
          un_field = [...un_field, gc.state.env.notification.tokenID]
        }
      } else {
        if (!field.includes(gc.state.env.notification.tokenID)) {
          field = [...field, gc.state.env.notification.tokenID]
        }
        if (un_field.includes(gc.state.env.notification.tokenID)) {
          un_field = removeFromArray(
            un_field,
            gc.state.env.notification.tokenID
          )
        }
      }
      await ref.update({
        push_notif_tokens: field,
        push_notif_tokens_unsubscribed: un_field,
      })
    } catch (e) {
      setSwitchState_notif(!param)
    } finally {
      setProcessing_notif(false)
    }
  }

  const requestPermission_notif = async () => {
    registerForPushNotificationsAsync(gc.state.auth.userEmail!).then(
      (notification) => {
        if (typeof notification.token === "string") {
          gc.dispatch({
            type: Enum_app_actions.SET_NOTIF_TOKEN,
            payload: {
              tokenID: notification.token,
              subscribed: notification.subscribed,
            },
          })
        }
      }
    )
  }

  const unsubscribe_adblock = (param: boolean) => {
    setProcessing_pro(true)
    setSwitchState_pro(param)
    db.collection("users")
      .doc(gc.state.auth.userEmail!)
      .update({
        adblock: false,
      })
      .catch(() => {})
      .finally(() => {
        setProcessing_pro(false)
      })
  }

  const toggleAdBlock = (param: boolean): void => {
    if (!mc.user.adblock) {
      navigate_to("Stack_Settings_UP")
      setSwitchState_pro(false)
    } else {
      Alert.alert(I18n.t("warning"), I18n.t("unsubscribe_adblock"), [
        { text: I18n.t("confirm"), onPress: () => unsubscribe_adblock(param) },
        { text: I18n.t("s_cancel"), style: "cancel" },
      ])
    }
  }

  const toggleTheme = (i: boolean): void => {
    setProcessing_darkmode(true)
    setSwitchState_darkmode(i)
    gc.dispatch({ type: Enum_app_actions.SET_THEME, payload: i })
    storeTheme(themeToString(i)).finally(() => {
      setProcessing_darkmode(false)
    })
  }

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: textColor(gc.state.env.darkmode!),
        }}
      >
        {I18n.t("anp")}
      </Text>
      <View style={{ flexDirection: "column", marginTop: 30 }}>
        <TouchableOpacity onPress={() => navigate_to("Stack_Settings_RF")}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 25,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "300",
                letterSpacing: 0.5,
                color: textColor(gc.state.env.darkmode!),
              }}
            >
              {I18n.t("tier_n_referrals")}
            </Text>
            <Image
              source={require("../../assets/icons/1x/arrow_darkmode.png")}
              style={[
                { width: 10, height: 10 },
                !gc.state.env.darkmode && { tintColor: "#000000" },
              ]}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigate_to("Stack_Settings_MR")}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 25,
            }}
          >
            <Text
              style={{
                flexWrap: "wrap",
                fontSize: 17,
                fontWeight: "300",
                letterSpacing: 0.5,
                color: textColor(gc.state.env.darkmode!),
              }}
            >
              {I18n.t("my_rewards")}
            </Text>
            <Image
              source={require("../../assets/icons/1x/arrow_darkmode.png")}
              style={[
                { width: 10, height: 10 },
                !gc.state.env.darkmode && { tintColor: "#000000" },
              ]}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigate_to("Stack_Settings_L")}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 25,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "300",
                letterSpacing: 0.5,
                color: textColor(gc.state.env.darkmode!),
              }}
            >
              {I18n.t("language")}
            </Text>
            <Image
              source={require("../../assets/icons/1x/arrow_darkmode.png")}
              style={[
                { width: 10, height: 10 },
                !gc.state.env.darkmode && { tintColor: "#000000" },
              ]}
            />
          </View>
        </TouchableOpacity>
        {Device.isDevice && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 25,
            }}
          >
            <Text
              style={{
                flexWrap: "wrap",
                fontSize: 17,
                fontWeight: "300",
                letterSpacing: 0.5,
                color: textColor(gc.state.env.darkmode!),
              }}
            >
              {I18n.t("notification")}
            </Text>
            <Switch
              value={
                gc.state.env.notification.tokenID ? switchState_notif : false
              }
              trackColor={{ false: "#545254", true: "#34CC90" }}
              thumbColor={switchState_notif ? "#faffb0" : "#e8e8e8"}
              disabled={processing_notif}
              onValueChange={(i) => handleToggleNotification(i)}
            />
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 25,
          }}
        >
          <Text
            style={{
              flexWrap: "wrap",
              fontSize: 17,
              fontWeight: "300",
              letterSpacing: 0.5,
              color: textColor(gc.state.env.darkmode!),
            }}
          >
            {I18n.t("adblock")}
          </Text>
          <Switch
            value={switchState_pro}
            trackColor={{ false: "#545254", true: "#34CC90" }}
            thumbColor={switchState_pro ? "#faffb0" : "#e8e8e8"}
            disabled={processing_pro}
            onValueChange={(i) => toggleAdBlock(i)}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 25,
          }}
        >
          <Text
            style={{
              flexWrap: "wrap",
              fontSize: 17,
              fontWeight: "300",
              letterSpacing: 0.5,
              color: textColor(gc.state.env.darkmode!),
            }}
          >
            {I18n.t("darkmode")}
          </Text>
          <Switch
            value={switchState_darkmode!}
            trackColor={{ false: "#545254", true: "#34CC90" }}
            thumbColor={switchState_darkmode ? "#faffb0" : "#e8e8e8"}
            disabled={processing_darkmode}
            onValueChange={(i) => toggleTheme(i)}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(I18n.t("title_switch_pro"), I18n.t("text_switch_pro"), [
              { text: I18n.t("ok") },
            ])
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 25,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "300",
                letterSpacing: 0.5,
                color: textColor(gc.state.env.darkmode!),
              }}
            >
              {I18n.t("switch_to_paid_version")}
            </Text>
            <View
              style={{
                width: 30,
                height: 30,
                backgroundColor: "#FFFFFF",
                borderRadius: 5,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../assets/icons/1x/paidVersionIcon.png")}
                style={{ width: 25, height: 25 }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Account
