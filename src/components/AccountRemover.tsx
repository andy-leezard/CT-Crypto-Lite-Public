import React, { useState, useContext, useEffect } from "react"
import { StyleSheet, Text, View, Alert, TouchableOpacity, TextInput, Dimensions, Platform } from "react-native"
import { auth, db } from "../../firebase"
import { KeyboardAvoidingView } from "react-native"
import i18n from "i18n-js"
import { GlobalContext, GlobalContextInterfaceAsReducer } from "../ContextManager"
import { bgColor, containerColor, containerRadiusColor } from "../lib/StyleLib"
import { timeDifference } from "../lib/FuncLib"
import { clamp } from "../lib/JSFuncLib"

interface Props {
  route: any
  navigation: any
}

const AccountRemover: React.FC<Props> = ({ route, navigation }) => {
  const globalContext = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const [pw, setpw] = useState<string>("")
  const [msg_error, setmsg_error] = useState<string>(i18n.t("er_pw"))
  const [loaded, setLoaded] = useState(false)
  const [formerRequest, setFormerRequest] = useState<number | null>(null)
  const [timeDiff, setTimeDiff] = useState<number | null>(null)

  const initialize = async () => {
    const doc = await db.collection("requests").doc(auth.currentUser!.email!).get()
    if (doc.exists) {
      const data = doc.data()
      if (data?.timestamp) {
        setFormerRequest(data.timestamp)
        const { days } = timeDifference(new Date().getTime(), data.timestamp)
        setTimeDiff(clamp(30 - days, 30, 1))
      }
    }
    setLoaded(true)
  }

  useEffect(() => {
    initialize()
  }, [])

  const requestDialogue = () => {
    Alert.alert(i18n.t("warning"), i18n.t("r_u_sure_remove_acc"), [
      { text: i18n.t("yes"), onPress: () => deleteUser() },
      { text: i18n.t("no"), style: "cancel" },
    ])
  }

  const revokeDialogue = () => {
    Alert.alert(i18n.t("revoke"), i18n.t("r_u_sure_revoke"), [
      { text: i18n.t("yes"), onPress: () => revoke() },
      { text: i18n.t("no"), style: "cancel" },
    ])
  }

  const deleteUser = async () => {
    if (pw) {
      const email = auth.currentUser!.email!
      try {
        await auth.signInWithEmailAndPassword(email, pw)
        const timestamp = new Date().getTime()
        await db.collection("requests").doc(auth.currentUser!.email!).set({
          timestamp: timestamp,
        })
        setFormerRequest(timestamp)
        setTimeDiff(30)
        Alert.alert(i18n.t("information"), i18n.t("removed_acc"), [{ text: i18n.t("ok") }])
      } catch (e: any) {
        handleError(e)
      }
    }
  }

  const revoke = async () => {
    await db.collection("requests").doc(auth.currentUser!.email!).delete()
    setFormerRequest(null)
    setTimeDiff(null)
    Alert.alert(i18n.t("information"), i18n.t("revoked_removal"), [{ text: i18n.t("ok") }])
  }

  const handleError = (e: any) => {
    const errorCode = e.code
    if (errorCode == "auth/invalid-email") {
      setmsg_error(i18n.t("case1"))
    } else if (errorCode == "auth/wrong-password") {
      setmsg_error(i18n.t("case2"))
    } else if (errorCode == "auth/user-not-found") {
      setmsg_error(i18n.t("case3"))
    } else {
      setmsg_error(e.message)
    }
  }

  const onPressButton = () => {
    if (formerRequest) {
      revokeDialogue()
    } else {
      requestDialogue()
    }
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        paddingTop: 15,
        alignItems: "center",
        backgroundColor: bgColor(globalContext.state.env.darkmode!),
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          borderWidth: 1,
          borderColor: "#FDD7D8",
          borderRadius: 5,
          padding: 5,
          width: Dimensions.get("window").width - 40,
          marginBottom: 10,
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: timeDiff ? 20 : 15, fontWeight: "500" }}>
          {Boolean(formerRequest && timeDiff)
            ? `${i18n.t("remaining_days_pre")} ${timeDiff}${i18n.t("remaining_days_suf")}`
            : msg_error}{" "}
        </Text>
      </View>
      {loaded && !formerRequest ? (
        <TextInput
          secureTextEntry={true}
          style={{
            backgroundColor: containerColor(globalContext.state.env.darkmode!),
            borderWidth: 1,
            borderColor: containerRadiusColor(globalContext.state.env.darkmode!),
            borderRadius: 5,
            color: "#ffffff",
            height: 35,
            width: Dimensions.get("window").width - 40,
            marginHorizontal: 14,
            fontSize: 15,
            marginBottom: 10,
            paddingHorizontal: 5,
          }}
          value={pw}
          onChangeText={setpw}
          maxLength={48}
          onSubmitEditing={deleteUser}
          autoFocus={true}
        />
      ) : (
        <></>
      )}
      <TouchableOpacity
        disabled={Boolean(!formerRequest && !pw.length)}
        style={{
          height: 45,
          width: Dimensions.get("window").width - 40,
          borderRadius: 10,
          backgroundColor: Boolean(!formerRequest && !pw.length) ? "#CCCCCC" : "#FF72CF",
          justifyContent: "center",
        }}
        onPress={onPressButton}
      >
        <Text style={styles.appButtonText}>{formerRequest ? i18n.t("revoke") : i18n.t("delete_acc")}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

export default AccountRemover

const styles = StyleSheet.create({
  appButtonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    alignSelf: "center",
  },
})
