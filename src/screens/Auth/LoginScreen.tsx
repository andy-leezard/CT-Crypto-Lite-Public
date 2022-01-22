import React, { useState, useContext } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native"
import { Button, Image } from "react-native-elements"
import { auth } from "../../../firebase"
import Env from "../../env.json"
import i18n from "i18n-js"
import {
  bgColor,
  brandColor,
  subTextColor,
  textColor,
} from "../../lib/StyleLib"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
} from "../../ContextManager"

interface Props {
  navigation: any
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [redoInfo, setRedoInfo] = useState<boolean>(false)
  const [msg_error, setmsg_error] = useState<string>("Incorrect information")
  const [hidepw, setHidePw] = useState<boolean>(true)

  const displayError = (msg: string) => {
    setRedoInfo(true)
    setmsg_error(msg)
  }
  const togglePW = () => {
    setHidePw(!hidepw)
  }
  const navigateTo = (address: string) => {
    setRedoInfo(false)
    navigation.navigate(address)
  }
  const firebaseSignIn = async () => {
    try {
      await auth.signInWithEmailAndPassword(
        email.toLowerCase().trim(),
        password
      )
    } catch (e) {
      handleError(e)
    }
  }
  const handleError = (e: any) => {
    const errorCode = e.code
    switch (errorCode) {
      case "auth/invalid-email":
        displayError(i18n.t("case1"))
        break
      case "auth/wrong-password":
        displayError(i18n.t("case2"))
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
            style={{ width: 40, height: 40, marginBottom: 5 }}
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
          {i18n.t("welcome")}
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
          <View style={{ justifyContent: "center" }}>
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
              secureTextEntry={hidepw}
              placeholder={i18n.t("password")}
              placeholderTextColor={subTextColor(!gc.state.env.darkmode!)}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={firebaseSignIn}
              maxLength={64}
            />
            <TouchableOpacity
              style={{ position: "absolute", alignSelf: "flex-end" }}
              onPress={togglePW}
            >
              {hidepw ? (
                <Image
                  source={require("../../assets/icons/1x/hide.png")}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: brandColor(gc.state.env.darkmode!),
                    marginRight: 25,
                  }}
                />
              ) : (
                <Image
                  source={require("../../assets/icons/1x/view.png")}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: brandColor(gc.state.env.darkmode!),
                    marginRight: 25,
                  }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.btn}>
          <Button
            buttonStyle={{ backgroundColor: "#5dbed4", borderRadius: 5 }}
            titleStyle={{ color: "#ffffff", fontSize: 18, fontWeight: "bold" }}
            title={i18n.t("signin")}
            onPress={firebaseSignIn}
          />
        </View>
        <View style={styles.btn}>
          <Button
            buttonStyle={{ backgroundColor: "#5d9cd4", borderRadius: 5 }}
            titleStyle={{ color: "#ffffff", fontSize: 19, fontWeight: "bold" }}
            title={i18n.t("signup")}
            onPress={() => navigateTo("Approval")}
          />
        </View>
        <TouchableOpacity onPress={() => navigateTo("PW")}>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 16,
              fontWeight: "600",
              marginTop: 20,
              alignSelf: "center",
            }}
          >
            {i18n.t("needhelp")}
          </Text>
        </TouchableOpacity>
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

export default LoginScreen

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
    borderRadius: 5,
    fontSize: 20,
  },
  btn: {
    marginBottom: 10,
    marginTop: 5,
    minWidth: 160,
    height: 40,
  },
})
