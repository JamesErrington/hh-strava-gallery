import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"
import "firebase/functions"
import "firebase/storage"

type ActivityDefinition = {
  title: string
  artist: string
  url: string
}

function getWeekNumber(date: Date) {
  const d = new Date(date.getTime())
  return +(new Date(d.setDate(d.getDate() - d.getDay() + 1)).getTime() / 1000).toFixed(0)
}

function processActivities(activities: any[]) {
  activities = activities.map(act => ({ ...act, date: new Date(act.date * 1000) }))
    .reduce((acc, elem) => {
      const week = getWeekNumber(elem.date)
      if (acc[week]) {
        return { ...acc, [week]: [...acc[week], elem] }
      }
      return { ...acc, [week]: [elem] }
    }, {})
  return activities
}

class Firebase {
  db: firebase.firestore.Firestore
  func: firebase.functions.Functions
  store: firebase.storage.Storage

  constructor() {
    this.db = firebase.firestore()
    this.func = firebase.app().functions("europe-west2")
    this.store = firebase.storage()

    if (process.env.NODE_ENV === "development") {
      this.func.useFunctionsEmulator("http://localhost:5001")
    }
  }

  getActivitiesListener = (callback: any) => this.db.collection("activities").onSnapshot(snapshot => callback(processActivities(snapshot.docs.map(doc => doc.data()))))

  getActivityImage = (id: string) => this.store.ref(`activity-images/${id}`).getDownloadURL()

  uploadActivity = (password: string, data: ActivityDefinition) => this.func.httpsCallable("pushStravaActivity")({ ...data, password })

  invisibleRecaptcha = (id: string, callback: Function) => new firebase.auth.RecaptchaVerifier(id, {
    size: "invisible",
    callback
  })
}

export default Firebase