import React from 'react'
import { Grid } from 'semantic-ui-react'
import ColorPanel from '../ColorPanel/ColorPanel'
import Messages from '../Messages/Messages'
import MetaPanel from '../MetaPanel/MetaPanel'
import SidePanel from '../SidePanel/SidePanel'

function Home() {
    return (
        <Grid columns="equal" className="app" style={{background: "#eee"}} >
            <ColorPanel />
            <SidePanel />
            <Grid.Column style={{ marginLeft: "320px" }} >
                <Messages />
            </Grid.Column>
            <Grid.Column width={4} >
                <MetaPanel />
            </Grid.Column>
        </Grid>
    )
}

export default Home
