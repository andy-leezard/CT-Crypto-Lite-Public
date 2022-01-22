import React, { useContext, useMemo } from "react"
import { Text, View, TouchableOpacity, Image, Alert, ScrollView } from "react-native"
import i18n from "i18n-js"
import { GlobalContext, GlobalContextInterfaceAsReducer, MainContext, MainContextInterface } from "../ContextManager"
import { Enum_app_actions } from "../lib/Reducers"
import { bgColor, containerColor_bis, textColor } from "../lib/StyleLib"
import { storeLanguage } from "../lib/FuncLib"
import { bottom_tab_nav_Height } from "../lib/Constants"

interface Props {
  route: any
  navigation: any
}

const LanguageChanger: React.FC<Props> = ({ route, navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface

  const supported_lang = useMemo(() => {
    return [
      { langname: i18n.t("english"), code: "en-US", country: "usa", region: "(US)" },
      { langname: i18n.t("english"), code: "en-UK", country: "uk", region: "(UK)" },
      { langname: i18n.t("english"), code: "en-CA", country: "ca", region: "(CA)" },
      { langname: i18n.t("french"), code: "fr-FR", country: "fr", region: "(FR)" },
      { langname: i18n.t("korean"), code: "ko-KR", country: "ko", region: "(KR)" },
    ]
  }, [gc])

  const unsupported_lang = useMemo(() => {
    return [
      { langname: i18n.t("german"), code: "de-DE", country: "de", region: "(DE)" },
      { langname: i18n.t("indonesian"), code: "id-ID", country: "id", region: "(ID)" },
      { langname: i18n.t("italian"), code: "it-IT", country: "it", region: "(IT)" },
      { langname: i18n.t("japanese"), code: "ja-JP", country: "jp", region: "(JP)" },
      { langname: i18n.t("portuguese"), code: "pt-PT", country: "pt", region: "(PT)" },
      { langname: i18n.t("russian"), code: "ru-RU", country: "ru", region: "(RU)" },
      { langname: i18n.t("spanish"), code: "es-ES", country: "es", region: "(ES)" },
      { langname: i18n.t("chinese"), code: "zh-CN", country: "cn", region: "(CN)" },
    ]
  }, [gc])

  const setLanguage = async (langCode: any) => {
    await storeLanguage(langCode)
    gc.dispatch({ type: Enum_app_actions.SET_LANG, payload: langCode })
    navigation.goBack()
  }
  const unsupported = () => {
    Alert.alert(i18n.t("lang_unsup"), `${i18n.t("unsup_lang_er")}`, [{ text: i18n.t("ok") }])
  }
  const FlagSelector: React.FC<{ country: string }> = ({ country }) => {
    switch (country) {
      case "usa":
        return (
          <Image source={require("../assets/icons/flags/usa.png")} style={{ width: 30, height: 30, marginRight: 5 }} />
        )
      case "uk":
        return (
          <Image source={require("../assets/icons/flags/uk.png")} style={{ width: 30, height: 30, marginRight: 5 }} />
        )
      case "ca":
        return (
          <Image
            source={require("../assets/icons/flags/canada.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      case "fr":
        return (
          <Image
            source={require("../assets/icons/flags/france.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      case "ko":
        return (
          <Image
            source={require("../assets/icons/flags/korea.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      case "es":
        return (
          <Image
            source={require("../assets/icons/flags/spain.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      case "de":
        return (
          <Image
            source={require("../assets/icons/flags/germany.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      case "it":
        return (
          <Image
            source={require("../assets/icons/flags/italy.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      case "pt":
        return (
          <Image
            source={require("../assets/icons/flags/portugal.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      case "id":
        return (
          <Image
            source={require("../assets/icons/flags/indonesia.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      case "cn":
        return (
          <Image
            source={require("../assets/icons/flags/china.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      case "jp":
        return (
          <Image
            source={require("../assets/icons/flags/japan.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      case "ru":
        return (
          <Image
            source={require("../assets/icons/flags/russia.png")}
            style={{ width: 30, height: 30, marginRight: 5 }}
          />
        )
      default:
        return <> </>
    }
  }

  return (
    <ScrollView style={{ backgroundColor: bgColor(gc.state.env.darkmode!) }}>
      <View
        style={{
          alignItems: "center",
          flex: 1,
          marginBottom: bottom_tab_nav_Height + mc.bottomInset + mc.banner_ad_height,
        }}
      >
        <View
          style={{
            width: gc.state.env.screenWidth - 40,
            alignSelf: "center",
            height: "auto",
            padding: 5,
            borderRadius: 10,
            backgroundColor: containerColor_bis(gc.state.env.darkmode!),
            marginVertical: 5,
          }}
        >
          <View
            style={{
              borderBottomWidth: 2,
              borderTopWidth: 2,
              height: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: textColor(gc.state.env.darkmode!), fontWeight: "bold" }}>{i18n.t("langs_sup")}</Text>
          </View>
          {supported_lang.map((i) => (
            <TouchableOpacity
              key={i.country}
              style={{
                flexDirection: "row",
                width: "100%",
                height: 40,
                borderBottomWidth: 1,
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => setLanguage(i.code)}
            >
              <Text style={{ color: textColor(gc.state.env.darkmode!) }}>
                {i.langname} {i.region}
              </Text>
              <FlagSelector country={i.country} />
            </TouchableOpacity>
          ))}
          <View
            style={{
              borderBottomWidth: 2,
              borderTopWidth: 1,
              height: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: textColor(gc.state.env.darkmode!), fontWeight: "bold" }}>
              {i18n.t("langs_unsup")}
            </Text>
          </View>
          {unsupported_lang.map((i) => (
            <TouchableOpacity
              key={i.country}
              style={{
                flexDirection: "row",
                width: "100%",
                height: 40,
                borderBottomWidth: 1,
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => unsupported()}
            >
              <Text style={{ color: textColor(gc.state.env.darkmode!) }}>
                {i.langname} {i.region}
              </Text>
              <FlagSelector country={i.country} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default LanguageChanger
