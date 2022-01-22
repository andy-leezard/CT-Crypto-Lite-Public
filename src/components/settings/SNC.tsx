import React, { useContext } from "react"
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
} from "react-native"
import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
} from "../../ContextManager"
import { textColor } from "../../lib/StyleLib"
import I18n from "i18n-js"
import { db, auth } from "../../../firebase"
import { removeFromArray } from "../../lib/JSFuncLib"
import {
  followTwitter,
  inAppReview,
  joinDiscord,
  viewGit,
} from "../../lib/FuncLib"

interface Props {
  navigate_to: (address: string) => void
}

const SNC: React.FC<Props> = ({ navigate_to }) => {
  const globalContext = useContext(
    GlobalContext
  ) as GlobalContextInterfaceAsReducer

  const firebaseSignOut = async () => {
    try {
      const ref = db
        .collection("users")
        .doc(globalContext.state.auth.userEmail!)
      const doc = await ref.get()
      const data = doc.data()!
      let field = data.push_notif_tokens ?? []
      if (field.includes(globalContext.state.env.notification.tokenID)) {
        field = removeFromArray(
          field,
          globalContext.state.env.notification.tokenID
        )
      }
      await ref.update({
        push_notif_tokens: field,
      })
    } catch (e) {
    } finally {
      auth.signOut()
    }
  }

  return (
    <View style={{ marginVertical: 10, paddingHorizontal: 20 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          paddingTop: 10,
          color: textColor(globalContext.state.env.darkmode!),
        }}
      >
        {I18n.t("snc")}
      </Text>
      <TouchableOpacity
        onPress={() => navigate_to("Stack_Settings_SC")}
        style={{ marginTop: 30 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 30,
          }}
        >
          <Text
            style={{
              flexWrap: "wrap",
              fontSize: 17,
              fontWeight: "300",
              letterSpacing: 0.5,
              color: textColor(globalContext.state.env.darkmode!),
            }}
          >
            {I18n.t("about")}
          </Text>
          <Image
            source={require("../../assets/icons/1x/arrow_darkmode.png")}
            style={[
              { width: 10, height: 10 },
              !globalContext.state.env.darkmode && { tintColor: "#000000" },
            ]}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigate_to("Stack_Settings_FAQ")}>
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
              color: textColor(globalContext.state.env.darkmode!),
            }}
          >
            {I18n.t("faq")}
          </Text>
          <Image
            source={require("../../assets/icons/1x/arrow_darkmode.png")}
            style={[
              { width: 10, height: 10 },
              !globalContext.state.env.darkmode && { tintColor: "#000000" },
            ]}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigate_to("Stack_Settings_TNC")}>
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
              color: textColor(globalContext.state.env.darkmode!),
            }}
          >
            {I18n.t("d_tnc")}
          </Text>
          <Image
            source={require("../../assets/icons/1x/arrow_darkmode.png")}
            style={[
              { width: 10, height: 10 },
              !globalContext.state.env.darkmode && { tintColor: "#000000" },
            ]}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={inAppReview}>
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
              color: textColor(globalContext.state.env.darkmode!),
            }}
          >
            {I18n.t("rate_me")}
          </Text>
          {Platform.OS === "ios" ? (
            <Image
              source={require("../../assets/icons/1x/appstore.png")}
              style={{ width: 25, height: 25 }}
            />
          ) : (
            <Image
              source={require("../../assets/icons/1x/playstore2.png")}
              style={{ width: 25, height: 25 }}
            />
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={joinDiscord}>
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
              color: textColor(globalContext.state.env.darkmode!),
            }}
          >
            {I18n.t("discord")}
          </Text>
          <Image
            source={require("../../assets/icons/1x/discord.png")}
            style={{ width: 25, height: 25 }}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={followTwitter}>
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
              color: textColor(globalContext.state.env.darkmode!),
            }}
          >
            {I18n.t("twitter")}
          </Text>
          <Image
            source={require("../../assets/icons/1x/twitter.png")}
            style={{ width: 25, height: 25 }}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={viewGit}>
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
              color: textColor(globalContext.state.env.darkmode!),
            }}
          >
            {I18n.t("git")}
          </Text>
          <Image
            source={require("../../assets/icons/1x/github.png")}
            style={{ width: 25, height: 25 }}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.appButtonContainer}
        onPress={() => firebaseSignOut()}
      >
        <Text style={styles.appButtonText}>{I18n.t("signout")}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default SNC

const styles = StyleSheet.create({
  appButtonContainer: {
    height: 45,
    width: "100%",
    backgroundColor: "#9772FF",
    borderRadius: 10,
    justifyContent: "center",
    marginBottom: 10,
  },
  appButtonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    alignSelf: "center",
  },
})
