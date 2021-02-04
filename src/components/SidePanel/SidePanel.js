import React from 'react'
import { Menu } from 'semantic-ui-react'
import Channels from '../Channels/Channels'
import DirectMessages from '../DirectMessages/DirectMessages'
import UserPanel from '../UserPanel/UserPanel';
import { useSelector } from 'react-redux';
import Starred from '../Starred/Starred';

function SidePanel() {
    const user = useSelector(state=> state.user);
    const { currentUser } = user
    const channel = useSelector(state=> state.channel);
    const { currentChannel } = channel;
    return (
        <Menu
            size="large"
            inverted
            fixed="left"
            vertical
            style={{ background: "#611f69", fontSize: "1.2rem" }}
        >
            <UserPanel />
            <Starred />
            <Channels currentUser={currentUser}  />
            <DirectMessages currentUser={currentUser} currentChannel={currentChannel} />
        </Menu>
    )
}

export default SidePanel
