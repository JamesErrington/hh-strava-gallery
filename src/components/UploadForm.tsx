import React, { useReducer, useEffect, useCallback, useMemo } from "react"
import type { FunctionComponent } from "react"
import { Container, Form, Segment, Header, Message, Label } from 'semantic-ui-react'

import { useFirebase } from "../hooks"

type State = {
  title: string
  artist: string
  url: string
  password: string
  submitting: boolean
  success: boolean
  error?: any
  urlError: boolean
  passwordError: boolean
}

const initialState: State = {
  title: "",
  artist: "",
  url: "",
  password: "",
  submitting: false,
  success: false,
  error: undefined,
  urlError: false,
  passwordError: false
}

type Action =
  { type: "SET_TITLE", payload: string } |
  { type: "SET_ARTIST", payload: string } |
  { type: "SET_URL", payload: string } |
  { type: "SET_PASSWORD", payload: string } |
  { type: "SUBMITTING_START" } |
  { type: "SUBMITTING_SUCCESS" } |
  { type: "SUBMITTING_ERROR", payload: any }

function uploadReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TITLE": {
      return { ...state, title: action.payload, success: false }
    }
    case "SET_ARTIST": {
      return { ...state, artist: action.payload, success: false }
    }
    case "SET_URL": {
      return { ...state, url: action.payload, success: false, urlError: false }
    }
    case "SET_PASSWORD": {
      return { ...state, password: action.payload, success: false, passwordError: false }
    }
    case "SUBMITTING_START": {
      return { ...state, submitting: true, success: false, error: undefined }
    }
    case "SUBMITTING_SUCCESS": {
      return { ...initialState, success: true }
    }
    case "SUBMITTING_ERROR": {
      const errorCode = action.payload.code
      const urlError = errorCode === "invalid-argument" || errorCode === "already-exists"
      const passwordError = errorCode === "permission-denied"
      return { ...initialState, success: false, error: action.payload, urlError, passwordError }
    }
    default: {
      throw new Error(`Unhandled action type '${(action as any).type}'`)
    }
  }
}

const placeholders = [
  { title: "The Mona Lisa", artist: "Leonardo da Vinci" },
  { title: "The Scream", artist: "Edvard Munch" },
  { title: "Sunflowers", artist: "Vincent van Gogh" },
  { title: "Guernica", artist: "Pablo Picasso" },
  { title: "Creation of Adam", artist: "Michelangelo" },
]

type MessageProps = {
  errorCode: undefined | "permission-denied" | "invalid-argument" | "already-exists" | string
}

const UploadFormMessage: FunctionComponent<MessageProps> = ({ errorCode }) => {
  return (
    <>
      <Message success className="upload-form-message">
        <Message.Header>Success!</Message.Header>
        <Message.Content>
          <p>Your activity has successfully been uploaded to the gallery and will appear once it has been processed.</p>
        </Message.Content>
      </Message>
      <Message error className="upload-form-message">
        <Message.Header>Uh oh!</Message.Header>
        <Message.Content>
          {errorCode === "permission-denied" && (
            <p>It looks like your password is incorrect.</p>
          )}
          {errorCode === "invalid-argument" && (
            <p>It looks like your Strava URL is incorrect.</p>
          )}
          {errorCode === "already-exists" && (
            <>
              <p>It looks like this Strava activity has already been submitted to the gallery.</p>
              <p>If you can't find it on the main page it is probably waiting for manual review and will be live soon.</p>
            </>
          )}
          {(errorCode === undefined || ["permission-denied", "invalid-argument", "already-exists"].includes(errorCode) === false) && (
            <>
              <p>Sorry, but it seems something went wrong with your upload.</p>
              <p>Remember that you can only upload Strava activities that are public.</p>
            </>
          )}
        </Message.Content>
      </Message>
    </>
  )
}

export const UploadForm: FunctionComponent = () => {
  const firebase = useFirebase()
  const [{ title, artist, url, password, submitting, success, error, urlError, passwordError }, dispatch] = useReducer(uploadReducer, initialState)

  const isTitleValid = title.length > 0
  const isArtistValid = artist.length > 0
  const isURLValid = /^(https:\/\/)?www\.strava\.com\/activities\/[0-9]+$/.test(url)
  const isPasswordValid = password.length > 0
  const isButtonDisabled = !(isTitleValid && isArtistValid && isURLValid && isPasswordValid)

  const placeholder = useMemo(() => placeholders[Math.floor(Math.random() * placeholders.length)], [success])

  useEffect(() => {
    // @ts-ignore
    window.recaptchaVerifier = firebase.invisibleRecaptcha("upload-button", handleSubmit)
  }, [])

  const handleSubmit = useCallback(() => {
    dispatch({ type: "SUBMITTING_START" })
    firebase.uploadActivity(password, { title, artist, url })
      .then(() => dispatch({ type: "SUBMITTING_SUCCESS" }))
      .catch(error => dispatch({ type: "SUBMITTING_ERROR", payload: error }))
  }, [title, artist, url, password])

  return (
    <Container className="upload-form-container" textAlign="left">
      <Segment className="upload-form-text">
        <Header>Add a new activity</Header>
        <p>You can use this form to add a Strava activity to the gallery.</p>
        <p>Once submitted, all activities must be processed by the server - this means that your image will not appear immediately.</p>
      </Segment>
      <Segment>
        <Form className="upload-form" loading={submitting} success={success} error={error ? true : false}>
          <UploadFormMessage errorCode={error?.code} />
          <Form.Group widths="equal">
            <Form.Input label="Title:" type="text" placeholder={placeholder.title} value={title} onChange={event => dispatch({ type: "SET_TITLE", payload: event.target.value })} />
            <Form.Input label="Artist Name:" type="text" placeholder={placeholder.artist} value={artist} onChange={event => dispatch({ type: "SET_ARTIST", payload: event.target.value })} />
          </Form.Group>
          <Form.Field error={urlError}>
            <label>Strava Activity Link:</label>
            <input type="text" value={url} onChange={event => dispatch({ type: "SET_URL", payload: event.target.value })} />
            {isURLValid === false && (<Label pointing>e.g. https://www.strava.com/activities/3553306454</Label>)}
          </Form.Field>
          <Form.Input label="Passcode" type="text" value={password} onChange={event => dispatch({ type: "SET_PASSWORD", payload: event.target.value })} error={passwordError} />
          <Form.Button id="upload-button" className="upload-form-button" color="blue" disabled={isButtonDisabled} onClick={handleSubmit}>Submit</Form.Button>
        </Form>
      </Segment>
    </Container>
  )
}
