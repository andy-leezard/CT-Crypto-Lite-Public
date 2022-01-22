import React, { useEffect, useContext, useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native"
import { GlobalContext } from "../../ContextManager"
import * as StyleLib from "../../lib/StyleLib"
import { LineChart } from "react-native-chart-kit"
import Loading from "../Loading"
import { clamp } from "../../lib/JSFuncLib"

const screenWidth =
  Platform.OS === "android"
    ? Dimensions.get("window").width * 0.95
    : Dimensions.get("window").width
const width = screenWidth - 20

const LineChartComponent = ({
  str_legend,
  sparkline,
  callback_IntervalFilter,
  callback_percentage,
  data_interval,
  intervalListTab,
  decimalAnchor,
  overrideDecimal,
}) => {
  const gc = useContext(GlobalContext)
  const [data, setData] = useState(null)

  //differs from the library
  const determineDecimals = (i) => {
    if (i <= 10) {
      if (i <= 0.000001) {
        return 11
      } else if (i <= 0.00001) {
        return 9
      } else if (i <= 0.001) {
        return 8
      } else if (i <= 0.01) {
        return 7
      } else if (i <= 0.1) {
        return 6
      } else if (i <= 1) {
        return 5
      } else {
        return 4
      }
    } else if (i >= 1000) {
      return 0
    } else {
      return 2
    }
  }

  useEffect(() => {
    let mounted = true
    if (sparkline && sparkline.length && mounted) {
      let sparklineDataArray = sparkline ? [...sparkline] : [1, 1]
      let dynamicChange =
        sparklineDataArray[sparklineDataArray.length - 1] /
          sparklineDataArray[0] -
        1
      let nb_decimal = Boolean(overrideDecimal || overrideDecimal === 0)
        ? overrideDecimal
        : determineDecimals(decimalAnchor)
      let rgbColor = StyleLib.buyColor_rgb(gc.state.env.darkmode)
      let hexColor = StyleLib.buyColor(gc.state.env.darkmode)
      let _percentage = (Math.round(dynamicChange * 10000) / 100).toString()
      if (dynamicChange < 0) {
        rgbColor = StyleLib.sellColor_rgb(gc.state.env.darkmode)
        hexColor = StyleLib.sellColor(gc.state.env.darkmode)
        _percentage = _percentage + "%"
      } else {
        _percentage = "+" + _percentage + "%"
      }
      setData({
        sparklineDataArray: sparklineDataArray,
        nb_decimal: nb_decimal,
        rgbColor: rgbColor,
        hexColor: hexColor,
        _percentage: _percentage,
      })
      if (callback_percentage) {
        callback_percentage({ percentage: _percentage, color: hexColor })
      }
    }
    return () => {
      mounted = false
    }
  }, [sparkline])

  return (
    <>
      <View style={{ alignItems: "center", minHeight: 150 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: StyleLib.containerColor_ter(gc.state.env.darkmode),
            borderRadius: 5,
            width: (clamp(width, 350, 300) / 5) * intervalListTab.length,
            height: 25,
          }}
        >
          {intervalListTab.map((e, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.interval_btnTab,
                data_interval === e && {
                  backgroundColor: StyleLib.unitContainerColor(
                    gc.state.env.darkmode
                  ),
                },
              ]}
              onPress={() => {
                setData(null)
                callback_IntervalFilter(e)
              }}
            >
              <Text
                style={[
                  styles.interval_text,
                  data_interval === e && {
                    color: StyleLib.unitTextColor(gc.state.env.darkmode),
                  },
                ]}
              >
                {e}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View
          style={{
            marginTop: 6,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: StyleLib.containerRadiusColor_bis(
              gc.state.env.darkmode
            ),
            width: width,
            minHeight: 125,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {Boolean(data) && sparkline && (
            <LineChart
              data={{
                datasets: [{ data: data.sparklineDataArray }],
                legend: [str_legend],
              }}
              chartConfig={{
                backgroundColor: "white",
                backgroundGradientFromOpacity: gc.state.env.darkmode ? 0.5 : 0,
                backgroundGradientTo: "white",
                backgroundGradientToOpacity: 0,
                decimalPlaces: data.nb_decimal,
                color: () => data.rgbColor,
                labelColor: () => data.rgbColor,
                style: { paddingTop: 10 },
              }}
              width={width - 20}
              height={100}
              yAxisLabel="$"
              withShadow={true}
              withVerticalLabels={false}
              withDots={data.sparklineDataArray.length <= 16}
              withHorizontalLines={true}
              withVerticalLines={false}
              yLabelsOffset={5}
              bezier
              style={{ borderRadius: 10 }}
            />
          )}
          {(!Boolean(data) || !sparkline) && <Loading width={40} height={40} />}
        </View>
      </View>
    </>
  )
}

export default LineChartComponent

const styles = StyleSheet.create({
  interval_btnTab: {
    borderRadius: 5,
    paddingHorizontal: 8,
    width: clamp(width, 350, 300) / 5,
    height: 25,
    justifyContent: "center",
  },
  interval_text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
})
