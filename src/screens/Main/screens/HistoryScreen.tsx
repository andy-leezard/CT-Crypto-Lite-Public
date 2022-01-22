import React, { useEffect, useState, useLayoutEffect, useContext } from "react"
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
} from "react-native"
import { db } from "../../../../firebase"
import { Alert } from "react-native"
import firebase from "firebase/app"
import "firebase/firestore"

import i18n from "i18n-js"
import axios from "axios"

import {
  GlobalContext,
  GlobalContextInterfaceAsReducer,
  MainContext,
  MainContextInterface,
  PortfolioContext,
} from "../../../ContextManager"
import * as StyleLib from "../../../lib/StyleLib"
import { dynamicRound, numberWithCommas } from "../../../lib/FuncLib"
import { removeFromArray } from "../../../lib/JSFuncLib"
import LineChartComponent from "../../../components/trading/LineChartComponent"
import { TotalPortfolio } from "../../../lib/Types"

const screenWidth = Dimensions.get("window").width
const width = screenWidth - 20

const Intervals = {
  WEEK: "7D",
  MONTH: "30D",
  QUARTER: "90D",
  SEMESTER: "180D",
  ALL: "ALL",
}

const limiter = [
  Intervals.WEEK,
  Intervals.MONTH,
  Intervals.QUARTER,
  Intervals.SEMESTER,
  Intervals.ALL,
]

interface Props {
  route: any
  navigation: any
}

interface ChartCallbackElements {
  percentage: string
  color: string
}

const locale = i18n.currentLocale()

const HistoryScreen: React.FC<Props> = ({ route, navigation }) => {
  const gc = useContext(GlobalContext) as GlobalContextInterfaceAsReducer
  const mc = useContext(MainContext) as MainContextInterface
  const pc = useContext(PortfolioContext) as { portfolio: TotalPortfolio }
  const [history, setHistory] = useState<any[]>([])
  const [editStatus, setEditStatus] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>([])

  const [intervalListTab, set_intervalListTab] = useState([Intervals.WEEK])
  const [raw_pnl, setRaw_PNL] = useState<number[]>([])
  const [pnl_datainterval, set_pnl_datainterval] = useState<any>(Intervals.WEEK)
  const [scope, setScope] = useState<number>(7)
  const [processing, setProcessing] = useState<boolean>(false)
  const [dynamicPercentage, setDynamicPercentage] =
    useState<ChartCallbackElements | null>(null)

  const renderFreeIfZero = (i: any): any => {
    return i > 0 ? i : ""
  }
  const toggleEditStatus = () => {
    setEditStatus(!editStatus)
  }

  const addItem = (id: any): void => {
    let arr = [...selected]
    if (selected.includes(id)) {
      arr = removeFromArray(arr, id)
      setSelected(arr)
    } else {
      arr.push(id)
      setSelected(arr)
    }
  }

  const _parseType = (t: string): string => {
    switch (t.toLowerCase()) {
      case "earned":
        return i18n.t("earned")
      case "sold":
        return i18n.t("sold")
      case "bought":
        return i18n.t("bought")
      case "spent":
        return i18n.t("spent")
      case "received":
        return i18n.t("received")
      case "adblock":
        return i18n.t("adblock")
      case "sent":
        return i18n.t("wired")
      default:
        return t
    }
  }

  useEffect(() => {
    const unsubscribe_history = db
      .collection("users")
      .doc(gc.state.auth.userEmail!)
      .collection("history")
      .orderBy("orderNum", "desc")
      .onSnapshot(
        (querySnapshot) => {
          const arr = querySnapshot.docs.map((order) => ({
            id: order.id,
            type: order.data().type,
            orderNum: order.data().orderNum,
            target: order.data().target,
            quantity: order.data().quantity,
            price: order.data().price,
            fiat: order.data().fiat,
            imgsrc: order.data().imgsrc,
            beneficiary: order.data().beneficiary ?? "",
            sender: order.data().sender ?? "",
          }))
          setHistory(arr)
        },
        (err) => {
          setHistory([])
        }
      )
    return () => {
      unsubscribe_history()
    }
  }, [])

  useEffect(() => {
    const unsubscribe_worth = db
      .collection("users")
      .doc(gc.state.auth.userEmail!)
      .collection("dynamicPNL")
      .onSnapshot(
        (querySnapshot) => {
          let arr = querySnapshot.docs.map(
            (doc) => doc.data().total_appreciation as number
          )
          let listTab = [Intervals.ALL]
          if (arr.length >= 180) {
            listTab.unshift(Intervals.SEMESTER)
          }
          if (arr.length >= 90) {
            listTab.unshift(Intervals.QUARTER)
          }
          if (arr.length >= 30) {
            listTab.unshift(Intervals.MONTH)
          }
          if (arr.length >= 7) {
            listTab.unshift(Intervals.WEEK)
          }
          set_intervalListTab(listTab)
          if (scope > 0) {
            arr = arr.slice(-scope)
          }
          while (arr.length > 36) {
            if (arr.length > 128) {
              for (let i = 0; i < arr.length - 6; i++) {
                arr.splice(i + 1, 3)
              }
            } else if (arr.length > 48) {
              for (let i = 0; i < arr.length - 4; i++) {
                arr.splice(i + 1, 2)
              }
            } else {
              for (let i = 0; i < arr.length - 2; i++) {
                if (arr.length > 36) {
                  arr.splice(i + 1, 1)
                }
              }
            }
          }
          if (pnl_datainterval === Intervals.ALL) {
            arr.unshift(mc.user.totalbuyin_const)
          }
          arr.push(pc.portfolio.totalAppreciation)
          setRaw_PNL(arr)
        },
        (err) => {
          setRaw_PNL([])
        }
      )
    return () => {
      unsubscribe_worth()
    }
  }, [scope])

  useEffect(() => {
    if (history.length > 100) {
      const function_address = "https://api----redacted----"
      axios.post(function_address, { userEmail: gc.state.auth.userEmail })
    }
  }, [history])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 18 }}
          onPress={() =>
            selected.length > 0 ? deleteSelected() : toggleEditStatus()
          }
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: StyleLib.textColor(gc.state.env.darkmode!),
            }}
          >
            {editStatus ? actionText() : i18n.t("edit")}
          </Text>
        </TouchableOpacity>
      ),
    })
  }, [selected.length, editStatus])

  const parseIntervalLegend = () => {
    switch (pnl_datainterval) {
      case Intervals.ALL:
        return `${i18n.t("tot_value")} ${i18n.t("since_pre")} ${
          Boolean(typeof mc.user.pnldate === "string")
            ? mc.user.pnldate
            : new Date(mc.user.pnldate).toLocaleDateString(locale)
        } ${i18n.t("since_suf")}`
      case Intervals.WEEK:
        return `${i18n.t("tot_value")} ${i18n.t("since_w")}`
      case Intervals.MONTH:
        return `${i18n.t("tot_value")} ${i18n.t("since_m")}`
      case Intervals.QUARTER:
        return `${i18n.t("tot_value")} ${i18n.t("since_3m")}`
      case Intervals.SEMESTER:
        return `${i18n.t("tot_value")} ${i18n.t("since_6m")}`
      default:
        return "since " + pnl_datainterval
    }
  }

  const Item: React.FC<any> = ({ i }) => {
    const _selected = selected.includes(i.id)
    const time = new Date(i.orderNum)
    return (
      <TouchableOpacity
        onPress={() => (editStatus ? addItem(i.id) : alert_delete(i))}
        style={[
          {
            flexDirection: "row",
            minHeight: 50,
            padding: 5,
            margin: 2,
            alignItems: "center",
            borderRadius: 5,
          },
          i.type === "Sold" ||
          i.type === "Spent" ||
          i.type === "Wired" ||
          i.type === "adblock"
            ? { backgroundColor: StyleLib.sellColor(gc.state.env.darkmode!) }
            : { backgroundColor: StyleLib.buyColor(gc.state.env.darkmode!) },
        ]}
      >
        {editStatus && _selected && (
          <Image
            source={require("../../../assets/icons/1x/dot.png")}
            style={{ width: 29, height: 29, marginLeft: 2, marginRight: 5 }}
          />
        )}
        {editStatus && !_selected && (
          <Image
            source={require("../../../assets/icons/1x/dot_2.png")}
            style={{ width: 29, height: 29, marginLeft: 2, marginRight: 5 }}
          />
        )}
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 2,
          }}
        >
          {i.target === "VUSD" ? (
            <Image
              source={require("../../../assets/icons/1x/usd_custom.png")}
              style={{ width: 29, height: 29 }}
            />
          ) : (
            <Image
              source={{ uri: i.imgsrc }}
              style={{ width: 29, height: 29 }}
            />
          )}
        </View>
        <View style={{ marginLeft: 10, width: "94.5%", marginRight: 5 }}>
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
            {_parseType(i.type)} {i.quantity} {i.target}{" "}
            {i.fiat > 0 ? "for $" : ""}
            {i.fiat > 0
              ? numberWithCommas(dynamicRound(i.fiat, 2))
              : renderFreeIfZero(i.fiat)}
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: "#FFFFFF" }}>{`${time.toLocaleDateString(
              locale
            )} ${time.toLocaleTimeString(locale)}`}</Text>
            {(!editStatus || gc.state.env.isTablet) && i.target !== "VUSD" && (
              <Text
                style={[
                  { color: "#FFFFFF" },
                  editStatus && { marginRight: 39 },
                  !gc.state.env.isTablet && !editStatus && { marginRight: 25 },
                ]}
              >
                1{i.target} = ${numberWithCommas(dynamicRound(i.price, 2))}
              </Text>
            )}
            {i.beneficiary ? (
              <Text
                style={[
                  { color: "#FFFFFF" },
                  editStatus && { marginRight: 39 },
                  !gc.state.env.isTablet && !editStatus && { marginRight: 25 },
                ]}
              >
                {i18n.t("beneficiary")}: {i.beneficiary}
              </Text>
            ) : i.sender ? (
              <Text
                style={[
                  { color: "#FFFFFF" },
                  editStatus && { marginRight: 39 },
                  !gc.state.env.isTablet && !editStatus && { marginRight: 25 },
                ]}
              >
                {i18n.t("sender")}: {i.sender}
              </Text>
            ) : (
              <></>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const alert_delete = (metadata: any) => {
    Alert.alert(i18n.t("warning"), i18n.t("delete_history_msg"), [
      {
        text: i18n.t("s_cancel"),
        style: "cancel",
      },
      { text: i18n.t("yes"), onPress: () => deleteSingle(metadata) },
    ])
  }
  const deleteSelected = () => {
    return new Promise((res) => {
      // don't run if there aren't any ids or a path for the collection
      if (!selected || !selected.length) return res([])

      const collectionPath = db
        .collection("users")
        .doc(gc.state.auth.userEmail!)
        .collection("history")
      let batches = []

      while (selected.length) {
        // firestore limits batches to 10
        const batch = selected.splice(0, 10)

        // add the batch request to to a queue
        batches.push(
          new Promise((response) => {
            collectionPath
              .where(firebase.firestore.FieldPath.documentId(), "in", [
                ...batch,
              ])
              .get()
              .then((querySnapshot) => {
                var batch = db.batch()
                querySnapshot.forEach(function (doc) {
                  // For each doc, add a delete operation to the batch
                  batch.delete(doc.ref)
                })
                batch.commit()
                response("batch completed")
              })
          })
        )
      }
      // after all of the data is fetched, return it
      Promise.all(batches).then(() => {
        res("Successfully deleted all")
        setEditStatus(false)
        setSelected([])
      })
    })
  }

  const deleteSingle = (metadata: any): void => {
    db.collection("users")
      .doc(gc.state.auth.userEmail!)
      .collection("history")
      .doc(metadata.id)
      .delete()
      .catch((err) => {
        console.log(metadata)
      })
  }
  const actionText = (): string => {
    return selected.length > 0 ? i18n.t("del_selected") : i18n.t("done")
  }
  const setIntervalFilter = (i: string) => {
    if (processing) {
      return
    }
    switch (i) {
      case Intervals.WEEK:
        setScope(7)
        break
      case Intervals.MONTH:
        setScope(30)
        break
      case Intervals.QUARTER:
        setScope(90)
        break
      case Intervals.SEMESTER:
        setScope(180)
        break
      case Intervals.ALL:
        setScope(0)
        break
    }
    set_pnl_datainterval(i)
  }

  return (
    <View
      style={{
        backgroundColor: StyleLib.bgColor(gc.state.env.darkmode!),
        flex: 1,
        marginBottom: mc.tab_bar_height + mc.bottomInset + mc.banner_ad_height,
      }}
    >
      <View style={{ height: 10 }} />
      <LineChartComponent
        str_legend={parseIntervalLegend()}
        sparkline={raw_pnl}
        callback_IntervalFilter={(e: string) => setIntervalFilter(e)}
        callback_percentage={(e: ChartCallbackElements) => {
          //setDynamicPercentage(e)
        }}
        data_interval={pnl_datainterval}
        intervalListTab={intervalListTab}
        decimalAnchor={mc.user.seed}
        overrideDecimal={0}
      />
      <View
        style={{
          flex: 1,
          width: width,
          alignSelf: "center",
          borderWidth: 2,
          borderRadius: 8,
          borderColor: StyleLib.containerRadiusColor_bis(
            gc.state.env.darkmode!
          ),
          backgroundColor: StyleLib.containerColor_bis(gc.state.env.darkmode!),
          marginVertical: 10,
        }}
      >
        <FlatList
          style={[
            { borderRadius: 6 },
            Platform.OS !== "ios" && {
              paddingHorizontal: 4,
              paddingVertical: 4,
            },
          ]}
          data={history}
          renderItem={({ item }) => {
            return <Item i={item} />
          }}
          keyExtractor={(item) => item.id}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
        />
      </View>
    </View>
  )
}

export default HistoryScreen
