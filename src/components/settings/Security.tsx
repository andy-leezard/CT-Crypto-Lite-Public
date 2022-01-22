import React, { useContext, useState, useEffect } from "react"
import { Alert, Switch, Text, TouchableOpacity, View } from "react-native"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
} from "../../ContextManager"
import { subTextColor, textColor } from "../../lib/StyleLib"
import I18n from "i18n-js"
import { db, auth } from "../../../firebase"

interface Props {
  openModal_pin: () => void
}

const Security: React.FC<Props> = ({ openModal_pin }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const [processing_pin, setProcessing_pin] = useState<boolean>(false)
  const [switchState_pin, setSwitchState_pin] = useState<boolean>(
    mc.user.requirePIN
  )

  useEffect(() => {
    setSwitchState_pin(mc.user.requirePIN)
  }, [mc])

  const toggleUsePin = (param: boolean): void => {
    setProcessing_pin(true)
    setSwitchState_pin(param)
    db.collection("users")
      .doc(gc.state.auth.userEmail!)
      .update({
        requirepin: param,
      })
      .catch(() => {})
      .finally(() => {
        setProcessing_pin(false)
      })
  }

  const tryResetPW = () => {
    Alert.alert(I18n.t("s_reset_pw"), I18n.t("r_u_sure_reset_pw"), [
      { text: I18n.t("confirm"), onPress: () => requestResetPassword() },
      { text: I18n.t("s_cancel"), style: "cancel" },
    ])
  }

  const requestResetPassword = () => {
    auth
      .sendPasswordResetEmail(gc.state.auth.userEmail!)
      .then(() => {
        Alert.alert(
          I18n.t("notification"),
          I18n.t("notif_reset_pw") + " : " + gc.state.auth.userEmail,
          [{ text: I18n.t("ok") }]
        )
      })
      .catch((error) => {
        Alert.alert(I18n.t("error"), error, [{ text: I18n.t("retry") }])
      })
  }

  return (
    <View style={{ marginTop: 10, paddingHorizontal: 20 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginTop: 10,
          color: textColor(gc.state.env.darkmode!),
        }}
      >
        {I18n.t("security")}
      </Text>
      <View style={{ marginTop: 30, flexDirection: "column" }}>
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
            {I18n.t("require_pin")}
          </Text>
          <Switch
            value={switchState_pin}
            trackColor={{ false: "#545254", true: "#34CC90" }}
            thumbColor={switchState_pin ? "#faffb0" : "#e8e8e8"}
            disabled={processing_pin}
            onValueChange={(i) => toggleUsePin(i)}
          />
        </View>
        <View>
          {mc.user.requirePIN ? (
            <TouchableOpacity onPress={openModal_pin}>
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
                  {I18n.t("configure_pin")}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
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
                  color: subTextColor(gc.state.env.darkmode!),
                }}
              >
                {I18n.t("configure_pin")}
              </Text>
            </View>
          )}
        </View>
        <View>
          <TouchableOpacity onPress={tryResetPW}>
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
                {I18n.t("s_reset_pw")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Security
