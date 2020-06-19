import React, { useEffect, useState } from "react"
import { Route, Switch } from "react-router-dom"
import { Segment, Button, Icon } from "semantic-ui-react"

import { ActivityGallery } from "./components/ActivityGallery"
import { NavBar } from "./components/NavBar"
import { UploadForm } from "./components/UploadForm"
import { Footer } from "./components/Footer"
import { useFirebase } from "./hooks"
import "./App.scss";

function App() {
  const firebase = useFirebase()
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    const unmountListener = firebase.getActivitiesListener(setActivities)

    return unmountListener
  }, [])

  return (
    <div className="App">
      <main className="content-wrap">
        <NavBar />
        <Switch>
          <Route path="/upload">
            <UploadForm />
          </Route>
          <Route exact path="/">
            <Segment className="about-text">
              <p>A collection of Strava Art from members of Hertfordshire Orienteering Club</p>
              <Button color="orange" as="a" href="https://www.strava.com/clubs/hertsorienteering" target="_blank" rel="noopener noreferrer">
                <Icon name="strava" /> Strava Club
              </Button>
              <p className="about-email">Any issues? <a href="mailto:jmerrington07@gmail.com" target="_blank" rel="noopener noreferrer">Shoot me an email</a></p>
            </Segment>
            <ActivityGallery activities={activities} />
          </Route>
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default App;
