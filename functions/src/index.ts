import * as sharp from "sharp"
import * as short from "short-uuid"
import * as puppeteer from "puppeteer"
import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { Storage } from "@google-cloud/storage"
import * as devices from "puppeteer/DeviceDescriptors"

admin.initializeApp();
const db = admin.firestore()
const storage = new Storage()
const bucket = storage.bucket("hh-strava-gallery.appspot.com")

async function getActivityImage() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })

  const page = await browser.newPage()
  // @ts-ignore
  await page.emulate(devices.devicesMap["iPhone X"])
  await page.goto('https://www.strava.com/activities/3553306454')

  await page.waitForSelector("#start-marker")
  const scrape = await page.evaluate(() => {
    // @ts-ignore
    const date = parseInt((new Date(document.querySelector("time").innerHTML).getTime() / 1000).toFixed(0))
    // @ts-ignore
    document.querySelector(".mapboxgl-control-container").style.display = "none"
    // @ts-ignore
    document.querySelector("#start-marker").style.display = "none"
    // @ts-ignore
    document.querySelector("#end-marker").style.display = "none"
    // @ts-ignore
    const rect = document.querySelector(".mapboxgl-canvas").getBoundingClientRect()
    return {
      left: rect.x, top: rect.y, width: rect.width, height: rect.height, date
    }
  })
  const image = await page.screenshot({
    type: "png",
    encoding: "binary",
    clip: { x: scrape.left, y: scrape.top, width: scrape.width, height: scrape.height }
  })

  await browser.close()

  const resized = await sharp(image).resize(1000, 900).png().toBuffer()

  return { image: resized, date: scrape.date }
}

export const addStravaActivity = functions.https.onRequest(async (data, context) => {
  const activityId = short.generate()
  const { image, date } = await getActivityImage()
  const filePath = `activity-images/${activityId}`
  await bucket.file(filePath).save(image, {
    contentType: "image/png",
    resumable: false
  })

  await db.collection("activities").doc(activityId).set({
    id: activityId,
    title: "Test Activity",
    artist: ["James Errington"],
    tags: ["Art"],
    activityURL: "https://www.example.com",
    date
  })

  context.status(200).send({ success: true })
})