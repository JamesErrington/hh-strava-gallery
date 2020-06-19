import React from "react"
import type { FunctionComponent } from "react"
import { Divider, Grid } from "semantic-ui-react"

import { ActivityModal } from "./ActivityModal"

type Props = {
  activities: any[]
}

export const ActivityGallery: FunctionComponent<Props> = ({ activities }) => {
  const keys = Object.keys(activities).reverse()
  return (
    <div className="activity-gallery-container">
      {keys.map((key: any) => {
        const d = new Date(+key * 1000)
        const end = new Date(d.setDate(d.getDate() - d.getDay() + 7))
        return (
        <>
          <Divider horizontal>{new Date(+key * 1000).toLocaleDateString()} - {end.toLocaleDateString()}</Divider>
          <div className="activity-gallery-grid">
            {activities[key].map((activity: any) => <Grid.Column><ActivityModal key={activity.id} {...activity} /></Grid.Column>)}
          </div>
        </>
        )}
      )}
    </div>
  )
}