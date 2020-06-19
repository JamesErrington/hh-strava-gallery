import React from "react"
import type { FunctionComponent } from "react"
import { Segment, List, Icon } from "semantic-ui-react"

export const Footer: FunctionComponent = () => {
  return (
    <Segment className="footer" as="footer" inverted>
      <List inverted>
        <List.Item>
          <List.Content><Icon name="copyright outline" />2020 James Errington</List.Content>
        </List.Item>
        <List.Item as="a" href="https://www.herts-orienteering.club/" target="_blank" rel="noopener noreferrer">
          <List.Icon name="linkify" />
          <List.Content>Hertfordshire Orienteering Club</List.Content>
        </List.Item>
        <List.Item as="a" href="mailto:jmerrington07@gmail.com" target="_blank" rel="noopener noreferrer">
          <List.Content><List.Icon name="mail" style={{color: "white"}} /> Contact me</List.Content>
        </List.Item>
      </List>
    </Segment>
  )
}