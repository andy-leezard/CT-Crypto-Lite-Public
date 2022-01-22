import React, { useEffect, useRef, useContext } from "react"
import * as Notifications from "expo-notifications"
import { GlobalContext } from "../ContextManager"
import { registerForPushNotificationsAsync } from "../lib/FuncLib"
import { auth } from "../../firebase"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    //allowAnnouncements: true,
  }),
})

const NotificationManager = () => {
  const gc = useContext(GlobalContext)
  const notificationListener = useRef()
  const responseListener = useRef()

  useEffect(() => {
    registerForPushNotificationsAsync(auth.currentUser.email).then((notification) => {
      if (typeof notification.token === "string") {
        gc.dispatch({
          type: "setNotifToken",
          payload: {
            tokenID: notification.token,
            subscribed: notification.subscribed,
          },
        })
      }
    })
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log(notification)
    })
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response)
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  return <></>
}

export default NotificationManager
