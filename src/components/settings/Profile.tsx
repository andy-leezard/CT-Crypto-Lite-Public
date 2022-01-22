import React, { useContext } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import {
  GlobalContext,
  MainContext,
  GlobalContextInterfaceAsReducer,
  MainContextInterface,
} from "../../ContextManager"
import {
  brandColor,
  containerColor_quater,
  textColor,
} from "../../lib/StyleLib"
import I18n from "i18n-js"
import {
  getBiggestCapsFromPortfolio,
  getCashRatioFromPortfolio,
  isNewbie,
} from "../../lib/FuncLib"
import PersonalBiggestCoins from "../social/PersonalBiggestCoins"

interface Props {
  openModal_profile: () => void
  openModal_status: () => void
  openModal_username: () => void
  minimum_information?: boolean
  override_imguri?: any
}

const locale = I18n.currentLocale()

const Profile: React.FC<Props> = ({
  openModal_profile,
  openModal_status,
  openModal_username,
  minimum_information,
  override_imguri,
}) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mainContext = useContext(MainContext) as MainContextInterface

  const minimizedItems = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 86,
      }}
    >
      <TouchableOpacity onPress={openModal_profile}>
        <Image
          source={
            override_imguri && typeof override_imguri === "string"
              ? { uri: override_imguri }
              : mainContext.user.custom_profile_image
              ? { uri: mainContext.user.custom_profile_image }
              : require("../../assets/icons/1x/defaultUserProfile_action.png")
          }
          style={{ width: 86, height: 86, borderRadius: 16 }}
        />
        <Image
          source={require("../../assets/icons/1x/triangle.png")}
          style={[
            styles.boxShadow_seamless,
            {
              shadowOffset: {
                width: 0,
                height: 2,
              },
              position: "absolute",
              width: 12,
              height: 12,
              right: -16,
              top: 60,
              tintColor: containerColor_quater(gc.state.env.darkmode!),
              transform: [{ rotate: "-90deg" }],
            },
          ]}
        />
      </TouchableOpacity>
      <View
        style={{
          height: 86,
          marginLeft: 16,
          flex: 1,
          justifyContent: "space-around",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            marginBottom: 5,
            color: textColor(gc.state.env.darkmode!),
          }}
          onPress={openModal_username}
        >
          {mainContext.user.username}
        </Text>
        <PersonalBiggestCoins
          bullishIndex={mainContext.user.bullish_index}
          newbie={isNewbie(mainContext.user.pnldate)}
          isHoarder={Boolean(
            getCashRatioFromPortfolio(
              mainContext.postdata,
              mainContext.coindata,
              mainContext.user.seed
            ) >= 0.66
          )}
          data={getBiggestCapsFromPortfolio(
            mainContext.postdata,
            mainContext.coindata,
            6
          )}
          size={{ width: 18, height: 18 }}
        />
        <TouchableOpacity
          onPress={openModal_status}
          style={[
            styles.boxShadow,
            {
              backgroundColor: containerColor_quater(gc.state.env.darkmode!),
              shadowOffset: {
                width: 4,
                height: 2,
              },
              marginTop: 5,
              borderRadius: 10,
              justifyContent: "center",
              height: "45%",
              alignItems: "center",
            },
          ]}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
              marginTop: 5,
              color: textColor(gc.state.env.darkmode!),
            }}
          >
            {Boolean(mainContext.user.status_msg)
              ? `" ${mainContext.user.status_msg} "`
              : `" Hi, I'm ${mainContext.user.username} "`}
          </Text>
          <Image
            source={require("../../assets/icons/1x/pencil.png")}
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              right: 15,
              bottom: 10,
              tintColor: containerColor_quater(!gc.state.env.darkmode!),
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  )

  const standardItems = (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ height: 101 }}>
          <Text
            style={{
              fontSize: 29,
              fontWeight: "bold",
              color: textColor(gc.state.env.darkmode!),
            }}
            onPress={openModal_username}
          >
            {I18n.t("hello")} {mainContext.user.username}
            {I18n.t("hello_suf")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: textColor(gc.state.env.darkmode!),
            }}
          >
            {" "}
            {gc.state.auth.userEmail}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: textColor(gc.state.env.darkmode!),
              marginBottom: 5,
            }}
          >
            {" "}
            {I18n.t("social.member_since")} :{" "}
            {Boolean(typeof mainContext.user.pnldate === "string")
              ? mainContext.user.pnldate
              : new Date(mainContext.user.pnldate).toLocaleDateString(locale)}
          </Text>
          <PersonalBiggestCoins
            bullishIndex={mainContext.user.bullish_index}
            newbie={isNewbie(mainContext.user.pnldate)}
            isHoarder={Boolean(
              getCashRatioFromPortfolio(
                mainContext.postdata,
                mainContext.coindata,
                mainContext.user.seed
              ) >= 0.66
            )}
            data={getBiggestCapsFromPortfolio(
              mainContext.postdata,
              mainContext.coindata,
              6
            )}
            size={{ width: 25, height: 25 }}
          />
        </View>
        <TouchableOpacity onPress={openModal_profile}>
          <Image
            source={
              override_imguri && typeof override_imguri === "string"
                ? { uri: override_imguri }
                : Boolean(mainContext.user.custom_profile_image)
                ? { uri: mainContext.user.custom_profile_image }
                : require("../../assets/icons/1x/defaultUserProfile_action.png")
            }
            style={{ width: 96, height: 96, borderRadius: 16 }}
          />
          <Image
            source={require("../../assets/icons/1x/triangle.png")}
            style={[
              styles.boxShadow_seamless,
              {
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                position: "absolute",
                width: 12,
                height: 12,
                left: 42,
                bottom: -15,
                tintColor: containerColor_quater(gc.state.env.darkmode!),
                shadowColor: "#000",
              },
            ]}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={openModal_status}
        style={[
          styles.boxShadow,
          {
            shadowOffset: {
              width: 0,
              height: 4,
            },
            backgroundColor: containerColor_quater(gc.state.env.darkmode!),
            borderRadius: 10,
            paddingTop: 10,
            paddingBottom: 20,
            alignItems: "center",
            marginTop: 10,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "bold",
            marginTop: 5,
            color: textColor(gc.state.env.darkmode!),
          }}
        >
          {Boolean(mainContext.user.status_msg)
            ? `" ${mainContext.user.status_msg} "`
            : `" Hi, I'm ${mainContext.user.username} "`}
        </Text>
        <Image
          source={require("../../assets/icons/1x/pencil.png")}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            right: 15,
            bottom: 10,
            tintColor: containerColor_quater(!gc.state.env.darkmode!),
          }}
        />
      </TouchableOpacity>
    </>
  )

  return (
    <View
      style={{
        backgroundColor: brandColor(!gc.state.env.darkmode!),
        borderRadius: 20,
        marginHorizontal: 10,
        paddingHorizontal: 10,
        marginVertical: 10,
        paddingVertical: 10,
      }}
    >
      {Boolean(minimum_information) ? minimizedItems : standardItems}
    </View>
  )
}

const styles = StyleSheet.create({
  boxShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2.84,
  },
  boxShadow_seamless: {
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 1,
  },
})

export default Profile
