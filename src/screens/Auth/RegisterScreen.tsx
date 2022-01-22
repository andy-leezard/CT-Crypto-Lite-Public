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
import { isEmailConstructor, isValidEmailAddress } from "../../lib/FuncLib"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
} from "../../ContextManager"
import axios from "axios"

interface Props {
  navigation: any
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [redoInfo, setRedoInfo] = useState<boolean>(false)
  const [username, setUsername] = useState<string>("")
  const [msg_error, setmsg_error] = useState<string>("Incorrect information")
  const [hidepw, setHidePw] = useState<boolean>(true)
  const [processing, setProcessing] = useState<boolean>(false)

  const handleEmailInput = (str: string) => {
    if (!str) {
      setEmail("")
      return
    }
    if (isEmailConstructor(str)) {
      setEmail(str.trim())
    }
  }

  const handleUsernameInput = (str: string) => {
    if (str.length < 2) {
      setUsername(str)
    } else {
      if (str[str.length - 1] === " " && str[str.length - 2] === " ") {
        return
      } else {
        setUsername(str)
      }
    }
  }

  const handlePasswordInput = (str: string) => {
    if (str.includes(" ")) {
      return
    } else {
      setPassword(str)
    }
  }

  const registerHandler = async (): Promise<void> => {
    let email_normalized = email.toLowerCase()
    let username_trimmed = username.trim()
    if (username_trimmed.length < 2) {
      setRedoInfo(true)
      setmsg_error(i18n.t("regi_er4"))
      return
    } else if (
      email_normalized.length < 6 ||
      !isValidEmailAddress(email_normalized)
    ) {
      setRedoInfo(true)
      setmsg_error(i18n.t("regi_er2"))
      return
    } else if (password.length < 6) {
      setRedoInfo(true)
      setmsg_error(i18n.t("regi_er3"))
      return
    } else {
      setProcessing(true)

      const body = { username: username_trimmed, userEmail: email_normalized }
      try {
        const response = await axios.post(Env.cfapi_registerUsername, body)
        if (response.data === "ref/success") {
          let authUser = await auth.createUserWithEmailAndPassword(
            email_normalized,
            password
          )
          authUser.user && authUser.user.sendEmailVerification()
        } else if (response.data === "ref/duplicate") {
          setRedoInfo(true)
          setmsg_error(i18n.t("regi_er5"))
          setProcessing(false)
        } else {
          handleError({ code: false })
          setProcessing(false)
        }
      } catch (error) {
        handleError({ code: false })
        setProcessing(false)
      }
    }
  }
  const togglePW = (): void => {
    setHidePw(!hidepw)
  }
  const handleError = (e: any) => {
    setRedoInfo(true)
    const errorCode = e.code
    if (errorCode) {
      switch (errorCode) {
        case "auth/email-already-in-use":
          setmsg_error(i18n.t("regi_er1"))
          break
        case "auth/invalid-email":
          setmsg_error(i18n.t("regi_er2"))
          break
        case "auth/weak-password":
          setmsg_error(i18n.t("regi_er3"))
          break
        case "auth/too-many-requests":
          setmsg_error(i18n.t("case4"))
          break
        default:
          setmsg_error(i18n.t("p_upgrade.er_1"))
      }
    } else {
      setmsg_error(i18n.t("p_upgrade.er_1"))
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor(gc.state.env.darkmode!) },
      ]}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
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
          }}
        >
          {i18n.t("title_register")}
        </Text>
        <View style={{ width: 300, alignItems: "center", marginTop: 40 }}>
          {redoInfo && (
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                borderWidth: 1,
                borderColor: "#FDD7D8",
                borderRadius: 5,
                padding: 5,
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
            placeholder={i18n.t("username")}
            placeholderTextColor={subTextColor(!gc.state.env.darkmode!)}
            value={username}
            onChangeText={handleUsernameInput}
            maxLength={20}
          />
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
            placeholder={i18n.t("email")}
            placeholderTextColor={subTextColor(!gc.state.env.darkmode!)}
            value={email}
            onChangeText={handleEmailInput}
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
              onChangeText={handlePasswordInput}
              onSubmitEditing={registerHandler}
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
                    tintColor: "white",
                    marginRight: 25,
                  }}
                />
              ) : (
                <Image
                  source={require("../../assets/icons/1x/view.png")}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: "white",
                    marginRight: 25,
                  }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.btn}>
          <Button
            disabled={processing}
            buttonStyle={{ backgroundColor: "#5d9cd4", borderRadius: 5 }}
            titleStyle={{ color: "#ffffff", fontSize: 19, fontWeight: "bold" }}
            title={processing ? i18n.t("s_processing") : i18n.t("register")}
            onPress={registerHandler}
          />
        </View>
        <View style={styles.btn}>
          {!processing && (
            <Button
              buttonStyle={{ backgroundColor: "#69648f", borderRadius: 5 }}
              titleStyle={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "bold",
              }}
              title={i18n.t("cancel")}
              onPress={() => navigation.goBack()}
            />
          )}
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
            © 2021 | {i18n.t("developed_by")} by Andy Lee
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

export default RegisterScreen

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
    width: 170,
    height: 40,
  },
})
