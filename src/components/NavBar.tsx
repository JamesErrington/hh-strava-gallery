import React from "react"
import type { FunctionComponent } from "react"
import { Link } from "react-router-dom"
import { Button, Responsive, Menu, Image, Header } from "semantic-ui-react"

import logo from "../img/hh-logo-240.png"

export const NavBar: FunctionComponent = () => {
  return (
    <>
      <Responsive className="navbar" maxWidth={1080} as="nav">
        <MobileNavBar />
      </Responsive>
      <Responsive className="navbar" minWidth={1081} as="nav">
        <DesktopNavBar />
      </Responsive>
    </>
  )
}

const DesktopNavBar: FunctionComponent = () => {
  return (
    <Menu className="navbar-menu">
      <Menu.Item position="left">
        <Link to="/">
          <Image className="navbar-logo" src={logo} alt="Hertfordshire Orienteering Club" />
        </Link>
      </Menu.Item>
      <Menu.Item className="navbar-header">
        <Header>Hertfordshire Orienteering Club Strava Gallery</Header>
      </Menu.Item>
      <Menu.Item position="right">
        <Link to="/upload">
          <Button as="a" color="red">
            Add Activity
        </Button>
        </Link>
      </Menu.Item>
    </Menu>
  )
}

const MobileNavBar: FunctionComponent = () => {
  return (
    <Menu className="navbar-menu">
      <Menu.Item className="navbar-header">
        <Header>Hertfordshire Orienteering Club Strava Gallery</Header>
      </Menu.Item>
    </Menu>
  )
}
