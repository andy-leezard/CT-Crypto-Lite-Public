import React, { useMemo, useRef } from "react"
import { Text, TouchableOpacity } from "react-native"
import I18n from "i18n-js"
import { GlobalContextInterface } from "../../ContextManager"
import { intervalContainerColor, textColor } from "../../lib/StyleLib"
import ReactNativePickerModule from "react-native-picker-module"

interface Props {
  datainterval: string
  globalContext: GlobalContextInterface
  callBack: (i: string) => void
}

const PickeriOS: React.FC<Props> = ({ datainterval, globalContext, callBack }) => {
  const pickerRef = useRef<ReactNativePickerModule>(null)
  const _options_ios = useMemo(() => {
    return [
      I18n.t("inthepast_h"),
      I18n.t("inthepast_d"),
      I18n.t("inthepast_w"),
      I18n.t("inthepast_2w"),
      I18n.t("inthepast_m"),
      I18n.t("inthepast_200"),
      I18n.t("inthepast_y"),
    ]
  }, [globalContext])

  return (
    <>
      <Text
        style={{ color: textColor(globalContext.env.darkmode!), fontWeight: "600", fontSize: 16, textAlign: "left" }}
      >
        {I18n.t("inthepast")}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: intervalContainerColor(globalContext.env.darkmode!),
          borderRadius: 3,
          paddingHorizontal: 5,
          marginLeft: 5,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => pickerRef.current!.show()}
      >
        <Text style={{ color: "#000000", fontWeight: "bold", fontSize: 15, textAlign: "left" }}>{datainterval}</Text>
      </TouchableOpacity>
      <ReactNativePickerModule
        items={_options_ios}
        pickerRef={pickerRef}
        title={I18n.t("timeframe_widget_ios")}
        onValueChange={callBack}
        value={datainterval}
        titleStyle={{ color: "white" }}
        itemStyle={{ color: "white" }}
        selectedColor="#FFCC00"
        confirmButtonEnabledTextStyle={{ color: "white" }}
        confirmButtonDisabledTextStyle={{ color: "grey" }}
        cancelButtonTextStyle={{ color: "white" }}
        confirmButtonStyle={{
          backgroundColor: "rgba(0,0,0,1)",
        }}
        cancelButtonStyle={{
          backgroundColor: "rgba(0,0,0,1)",
        }}
        contentContainerStyle={{
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
    </>
  )
}

export default PickeriOS
