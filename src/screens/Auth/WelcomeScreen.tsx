import React, { useEffect, useState, useContext } from "react"
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native"
import { Image } from "react-native-elements"
import Env from "../../env.json"
import { db, auth } from "../../../firebase"
import I18n from "i18n-js"
import { bgColor, brandColor } from "../../lib/StyleLib"
import { DocumentSnapshot } from "@firebase/firestore-types"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
} from "../../ContextManager"

const screenWidth = Dimensions.get("window").width

interface Props {
  username: string
  email: string
}

const WelcomeScreen: React.FC<Props> = ({ username, email }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const [startingBonus, setStartingBonus] = useState<number>(1000)
  const langid = I18n.currentLocale()

  useEffect(() => {
    db.collection("globalEnv")
      .doc("variables")
      .get()
      .then((doc: DocumentSnapshot) => {
        doc.exists
          ? setStartingBonus(doc.data()!.starting_bonus ?? 1000)
          : setStartingBonus(1000)
      })
      .catch(() => {
        setStartingBonus(1000)
      })
  }, [])

  const single_alert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: I18n.t("ok") }])
  }

  const handleError = (e: any) => {
    const errorCode = e.code
    if (errorCode == "auth/too-many-requests") {
      single_alert(I18n.t("error"), I18n.t("case4"))
    } else {
      single_alert(I18n.t("error"), I18n.t("p_upgrade.er_1"))
    }
  }

  const resend = (): void => {
    if (auth.currentUser) {
      let mail = auth.currentUser.email!
      auth.currentUser
        .sendEmailVerification()
        .then(() => {
          single_alert(
            I18n.t("p_welcome.mail_verif"),
            I18n.t("p_welcome.mail_verif_msg") + " : " + mail
          )
        })
        .catch(handleError)
    } else {
      single_alert(I18n.t("error"), I18n.t("p_upgrade.er_1"))
    }
  }
  const BonusMessage = (): JSX.Element => {
    if (langid.includes("ko") || langid.includes("ja")) {
      //inverse sentence order
      return (
        <>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 18,
              fontWeight: "600",
              marginTop: 5,
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {startingBonus} {I18n.t("p_welcome.bonus")}
          </Text>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 17,
              fontWeight: "600",
              marginTop: 10,
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {I18n.t("p_welcome.begin_1")}
          </Text>
        </>
      )
    } else {
      return (
        <>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 17,
              fontWeight: "600",
              marginTop: 10,
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {I18n.t("p_welcome.begin_1")}
          </Text>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 18,
              fontWeight: "600",
              marginTop: 5,
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {I18n.t("p_welcome.with")} {startingBonus}{" "}
            {I18n.t("p_welcome.bonus")}
          </Text>
        </>
      )
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          height: Dimensions.get("window").height - 75,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../assets/icon_rounded.png")}
            style={{ width: 50, height: 50, marginBottom: 5, marginTop: 100 }}
          />
          <View style={{ width: screenWidth - 20, alignItems: "center" }}>
            <Text
              style={{
                color: brandColor(gc.state.env.darkmode!),
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              {I18n.t("welcome").toUpperCase()},
            </Text>
            <Text
              style={{
                color: brandColor(gc.state.env.darkmode!),
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              {username.toUpperCase()}!
            </Text>
          </View>
          <BonusMessage />
        </View>

        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 22,
              fontWeight: "700",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {I18n.t("p_welcome.pls_verif")}
          </Text>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 20,
              fontWeight: "700",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {" "}
            - {email} -{" "}
          </Text>
        </View>

        <TouchableOpacity onPress={resend}>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 14,
              fontWeight: "600",
              alignSelf: "center",
            }}
          >
            {I18n.t("p_welcome.er1")}
          </Text>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 16,
              fontWeight: "bold",
              marginTop: 10,
              alignSelf: "center",
            }}
          >
            {I18n.t("p_welcome.resend")}
          </Text>
        </TouchableOpacity>
        <View>
          <TouchableOpacity onPress={() => auth.signOut()}>
            <Text
              style={{
                color: brandColor(gc.state.env.darkmode!),
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 70,
                alignSelf: "center",
              }}
            >
              {I18n.t("p_welcome.try_diff")}
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 14,
              fontWeight: "600",
              alignSelf: "center",
            }}
          >
            © 2021 | {I18n.t("developed_by")} Andy Lee
          </Text>
          <Text
            style={{
              color: brandColor(gc.state.env.darkmode!),
              fontSize: 12,
              fontWeight: "600",
              marginTop: 10,
              alignSelf: "center",
            }}
          >
            {Env.currentVersion}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
})
