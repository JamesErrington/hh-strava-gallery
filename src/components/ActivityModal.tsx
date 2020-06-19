import React, { useState } from "react"
import type { FunctionComponent } from "react"
import { Card, Button, Image, Modal, Placeholder, Visibility, Icon } from "semantic-ui-react"

import { useFirebase } from "../hooks"

type Props = {
  id: string
  title: string
  artist: string
  date: Date
  activityURL: string
}

export const ActivityModal: FunctionComponent<Props> = (props) => {
  const { id, title, artist, date, activityURL } = props
  const [open, setOpen] = useState(false)
  const firebase = useFirebase()
  const [imageURL, setImageURL] = useState(null)

  const loadImage = () => { if (imageURL === null) firebase.getActivityImage(id).then(setImageURL) }

  return (
    <>
      <Modal className="activity-modal" open={open} size="small">
        <Image src={imageURL} alt={title} wrapped />
        <Modal.Content>
          <strong>{title}</strong> by {artist}<br />{date.toLocaleDateString()}
        </Modal.Content>
        <Modal.Actions>
          <Button color="orange" as="a" href={activityURL} target="_blank" rel="noopener noreferrer">
            <Icon name="strava" /> View on Strava
          </Button>
          <Button className="activity-modal-close-button" onClick={() => setOpen(false)}>Close</Button>
        </Modal.Actions>
      </Modal>
      <Visibility onTopVisible={loadImage} fireOnMount>
        <Card className="activity-card" onClick={() => setOpen(curr => !curr)}>
          {imageURL === null && (<Placeholder.Image className="activity-image-thumbnail" />)}
          {imageURL !== null && (<Image className="activity-image-thumbnail" src={imageURL} alt={title} wrapped />)}
          <Card.Description className="activity-card-content">
            <p><strong>{title}</strong></p>
            <p>{artist}</p>
          </Card.Description>
        </Card>
      </Visibility>
    </>
  )
}