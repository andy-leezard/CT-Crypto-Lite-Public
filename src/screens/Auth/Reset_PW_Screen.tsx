import React, { useState, useContext } from "react"
import { StyleSheet, Text, View, TextInput, Alert } from "react-native"
import { Button, Image } from "react-native-elements"
import Env from "../../env.json"
import { auth } from "../../../firebase"
import i18n from "i18n-js"
import {
  bgColor,
  brandColor,
  subTextColor,
  textColor,
} from "../../lib/StyleLib"
import { isValidEmailAddress } from "../../lib/FuncLib"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
} from "../../ContextManager"

interface Props {
  navigation: any
}

const Reset_PW_Screen: React.FC<Props> = ({ navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const [email, setEmail] = useState<string>("")
  const [redoInfo, setRedoInfo] = useState<boolean>(false)
  const [msg_error, setmsg_error] = useState<string>("Incorrect information")
  const [processing, setProcessing] = useState<boolean>(false)

  const displayError = (msg: string): void => {
    setRedoInfo(true)
    setmsg_error(msg)
  }

  const handleError = (e: any) => {
    const errorCode = e.code
    switch (errorCode) {
      case "auth/invalid-email":
        displayError(i18n.t("case1"))
        break
      case "auth/user-not-found":
        displayError(i18n.t("case3"))
        break
      case "auth/too-many-requests":
        displayError(i18n.t("case4"))
        break
      default:
        displayError(i18n.t("p_upgrade.er_1"))
    }
  }

  const resetPW = (): void => {
    const loweremail = email.toLowerCase()
    if (email.length < 6 || !isValidEmailAddress(email)) {
      setRedoInfo(true)
      setmsg_error(i18n.t("case1"))
      return
    } else {
      setProcessing(true)
      auth
        .sendPasswordResetEmail(loweremail)
        .then(() => {
          Alert.alert(i18n.t("title_alert"), i18n.t("msg_alert") + loweremail, [
            { text: i18n.t("ok") },
          ])
          setRedoInfo(false)
        })
        .catch(handleError)
        .finally(() => {
          setProcessing(false)
        })
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor(gc.state.env.darkmode!) },
      ]}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: 100,
        }}
      >
        <View>
          <Image
            source={require("../../assets/icon_rounded.png")}
            style={{ width: 40, height: 40, marginBottom: 5, marginTop: 80 }}
          />
        </View>
        <Text
          style={{
            color: brandColor(gc.state.env.darkmode!),
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 40,
          }}
        >
          {i18n.t("title_alert")}
        </Text>
        <View style={{ width: 300, alignItems: "center" }}>
          {redoInfo && (
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                borderWidth: 1,
                borderColor: "#FDD7D8",
                borderRadius: 5,
                padding: 5,
                marginBottom: 10,
              }}
            >
              <Text
                style={{ color: "#ffffff", fontSize: 15, fontWeight: "700" }}
              >
                {msg_error}
              </Text>
            </View>
          )}
          <TextInput
            style={[
              styles.input,
              {
                color: textColor(gc.state.env.darkmode!),
                borderStyle: "solid",
                borderWidth: 2,
                borderColor: brandColor(gc.state.env.darkmode!),
              },
            ]}
            autoFocus={true}
            placeholder={i18n.t("email")}
            placeholderTextColor={subTextColor(!gc.state.env.darkmode!)}
            value={email}
            onChangeText={setEmail}
            maxLength={32}
          />
        </View>
        <View style={styles.btn}>
          <Button
            disabled={processing}
            buttonStyle={{ backgroundColor: "#5dbed4", borderRadius: 5 }}
            titleStyle={{ color: "#FFFFFF", fontSize: 17, fontWeight: "bold" }}
            title={i18n.t("reset_pw")}
            onPress={resetPW}
          />
        </View>
        <View style={styles.btn}>
          <Button
            buttonStyle={{
              backgroundColor: "rgba(147, 105, 219,0.75)",
              borderRadius: 5,
            }}
            titleStyle={{ color: "#ffffff", fontSize: 17, fontWeight: "bold" }}
            title={i18n.t("cancel")}
            onPress={() => navigation.goBack()}
          />
        </View>
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 14,
              fontWeight: "600",
              marginTop: 20,
            }}
          >
            © 2021 | {i18n.t("developed_by")} Andy Lee
          </Text>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 14,
              fontWeight: "600",
              marginTop: 10,
            }}
          >
            {Env.currentVersion}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default Reset_PW_Screen

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
  btn: {
    marginBottom: 10,
    marginTop: 5,
    minWidth: 160,
    height: 40,
  },
})
