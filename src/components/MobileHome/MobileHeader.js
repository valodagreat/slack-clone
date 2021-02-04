import React from 'react'
import { Header, Image } from 'semantic-ui-react'

function MobileHeader() {
    return (
        <Header as='h2' textAlign='center' style={{ background: "#611f69", padding: "1rem", color: "white" }} >
            <Image circular src='http://assets.stickpng.com/images/5cb480cd5f1b6d3fbadece79.png' /> Slack
            <Header.Subheader style={{ color: "white",paddingTop: "1rem" }}>
            Val Inc.
            </Header.Subheader>
        </Header>
    )
}

export default MobileHeader
