import React, { useState, useEffect } from "react"
import { Image, Text, View, TouchableOpacity, Platform } from "react-native"
import I18n from "i18n-js"
import { visitAppStore } from "../../lib/FuncLib"
import { bgColor, textColor } from "../../lib/StyleLib"

interface Props {
  darkmode: boolean
  maintenance?: boolean
  newVersionRequired?: boolean
  reloadable: boolean
  reload?: () => void
}

const LoadingScreen: React.FC<Props> = ({
  darkmode,
  maintenance,
  newVersionRequired,
  reloadable,
  reload,
}) => {
  const [displayMessage, setDP] = useState<boolean>(false)
  const [failed, setFailed] = useState<boolean>(false)
  const [_time, _setTime] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      !failed && displayMessage && count()
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [_time, displayMessage, failed])

  const count = () => {
    _time >= 5 ? fail() : _setTime(_time + 1)
  }

  const fail = () => {
    _setTime(0)
    setFailed(true)
  }

  const retry = () => {
    !displayMessage && setDP(true)
    failed && setFailed(false)
    reload && reload()
  }

  return (
    <View
      style={{
        backgroundColor: bgColor(darkmode),
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          disabled={!reloadable && !newVersionRequired}
          onPress={() => {
            if (reloadable) {
              retry()
            } else if (newVersionRequired) {
              visitAppStore()
            }
          }}
          style={{
            width: !maintenance && !newVersionRequired ? 80 : 40,
            height: !maintenance && !newVersionRequired ? 80 : 40,
            borderRadius: 10,
            backgroundColor: newVersionRequired ? "#FFFFFF" : "rgba(0,0,0,0)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../assets/icon_rounded.png")}
            style={{
              width: !maintenance && !newVersionRequired ? 80 : 36,
              height: !maintenance && !newVersionRequired ? 80 : 36,
              borderRadius: 8,
            }}
          />
        </TouchableOpacity>
        {newVersionRequired && (
          <>
            <View style={{ width: 20 }} />
            <TouchableOpacity
              onPress={() => visitAppStore()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {Platform.OS === "ios" && (
                <Image
                  source={require("../../assets/icons/1x/appstore.png")}
                  style={{ width: 36, height: 36, borderRadius: 8 }}
                />
              )}
              {Platform.OS === "android" && (
                <Image
                  source={require("../../assets/icons/1x/playstore2.png")}
                  style={{ width: 36, height: 36, borderRadius: 8 }}
                />
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
      <View
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          width: 300,
        }}
      >
        {maintenance && !displayMessage ? (
          <Text
            style={{
              color: textColor(darkmode),
              fontSize: 16,
              fontWeight: "600",
              marginTop: 20,
              alignSelf: "center",
              textAlign: "center",
            }}
          >
            {I18n.t("msg_maintenance")}
          </Text>
        ) : (
          newVersionRequired && (
            <Text
              style={{
                color: textColor(darkmode),
                fontSize: 16,
                fontWeight: "600",
                marginTop: 20,
                alignSelf: "center",
                textAlign: "center",
              }}
            >
              {I18n.t("msg_new_version")}
            </Text>
          )
        )}
        {reloadable && displayMessage && !failed && (
          <Text
            style={{
              color: textColor(darkmode),
              fontSize: 16,
              fontWeight: "600",
              marginTop: 20,
              alignSelf: "center",
              textAlign: "center",
            }}
          >
            {I18n.t("msg_504")}
          </Text>
        )}
        {reloadable && displayMessage && failed && (
          <Text
            style={{
              color: textColor(darkmode),
              fontSize: 16,
              fontWeight: "600",
              marginTop: 20,
              alignSelf: "center",
              textAlign: "center",
            }}
          >
            {I18n.t("msg_504_timeout")}
          </Text>
        )}
      </View>
    </View>
  )
}

export default LoadingScreen
