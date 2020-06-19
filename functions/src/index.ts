import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import puppeteer from "puppeteer"
import sharp from "sharp"
import { Storage } from "@google-cloud/storage"
import { PubSub } from "@google-cloud/pubsub"

import secret from "./secret.json"

admin.initializeApp();
const db = admin.firestore()
const storage = new Storage()
const bucket = storage.bucket("hh-strava-gallery.appspot.com")
const pubsubClient = new PubSub()

const device = {
  name: 'iPhone X',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
  viewport: {
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    isLandscape: false,
  },
}

async function getActivityImage(activityURL: string) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })

  const page = await browser.newPage()
  // @ts-ignore
  await page.emulate(device)
  await page.goto(activityURL)

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

  const resized = await sharp(image).resize(1000, 900).webp().toBuffer()

  return { image: resized, date: scrape.date }
}

export const handleStravaActivity = functions.region("europe-west2").pubsub.topic("activities").onPublish(async (message) => {
  const {id, title, artist, url} = message.json

  console.log(`Uploading activity ${id}...`)

  try {
    const { image, date } = await getActivityImage(url)
    console.log("Image scraped successfully")
    const filePath = `activity-images/${id}`
    const file = bucket.file(filePath)
    await file.save(image, {
      contentType: "image/webp",
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=31536000"
      }
    })
    console.log("Image uploaded successfully")

    await db.collection("activities").doc(id).set({
      id,
      title,
      artist,
      tags: [],
      activityURL: url,
      date
    })
    console.log("Firestore updated successfully")

    return { success: true }
  } catch (error) {
    console.error(error)
    throw new functions.https.HttpsError("internal", "")
  }
})

export const pushStravaActivity = functions.region("europe-west2").https.onCall(async (data, context) => {
  if (data.password !== secret.password) {
    console.log(`ERROR: Incorrect password ${data.password}`)
    throw new functions.https.HttpsError("permission-denied", "Password is incorrect")
  }

  if (/^(https:\/\/)?www\.strava\.com\/activities\/[0-9]+$/.test(data.url) === false) {
    console.log(`ERROR: Incorrect link ${data.url}`)
    throw new functions.https.HttpsError("invalid-argument", "Link provided is not a valid Strava activity")
  }

  const activityId = data.url.split("activities/")[1]
  const ref = await db.collection("activities").doc(activityId).get()
  if (ref.exists) {
    console.log(`ERROR: Activity ${activityId} already exists`)
    throw new functions.https.HttpsError("already-exists", "The provided activity already exists in the gallery")
  }

  await pubsubClient.topic("activities").publishJSON({ id: activityId, title: data.title, artist: data.artist, url: data.url })

  return { success: true }
})