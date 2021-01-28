import React from 'react'
import { Menu } from 'semantic-ui-react'
import Channels from '../Channels/Channels'
import DirectMessages from '../DirectMessages/DirectMessages'
import UserPanel from '../UserPanel/UserPanel';
import { useSelector } from 'react-redux';

function SidePanel() {
    const user = useSelector(state=> state.user);
    const { currentUser } = user
    return (
        <Menu
            size="large"
            inverted
            fixed="left"
            vertical
            style={{ background: "#611f69", fontSize: "1.2rem" }}
        >
            <UserPanel />
            <Channels currentUser={currentUser}  />
            <DirectMessages currentUser={currentUser} />
        </Menu>
    )
}

export default SidePanel
