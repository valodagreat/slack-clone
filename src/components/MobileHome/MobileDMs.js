import React, { useState } from 'react'
import { Icon, Menu } from 'semantic-ui-react'
import MobileHeader from './MobileHeader';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { DMs } from './DMs';

function MobileDMs() {
    const [activeItem, setActiveItem]= useState('comments');
    const history = useHistory()

    const user = useSelector(state=> state.user);
    const { currentUser } = user

    const handleItemClick = (e, { name }) => setActiveItem(name)
    const handleItemClick2 = (e, { name }) => {
        setActiveItem(name)
        history.push('/direct-messages')
    }
    const handleItemClick1 = (e, { name }) => {
        setActiveItem(name)
        history.push('/')
    }
    const handleItemClick4 = (e, { name }) => {
        setActiveItem(name)
        history.push('/info')
    }

    const channel = useSelector(state=> state.channel);
    const { currentChannel } = channel;
    return (
        <>
            <MobileHeader /> 
            <Menu fluid vertical size="massive" style={{minHeight: 500}}  >
                <DMs currentUser={currentUser && currentUser} currentChannel={currentChannel && currentChannel} />
            </Menu>
            <Menu fluid widths={4} borderless size='small' icon='labeled' className='bottom fixed' >
                <Menu.Item
                    name='home'
                    active={activeItem === 'home'}
                    onClick={handleItemClick1}
                >
                    <Icon name='home' />
                    Home
                </Menu.Item>

                <Menu.Item
                    name='comments'
                    active={activeItem === 'comments'}
                    onClick={handleItemClick2}
                >
                    <Icon name='comments' />
                    DMs
                </Menu.Item>

                <Menu.Item
                    name='at'
                    active={activeItem === 'at'}
                    onClick={handleItemClick}
                >
                    <Icon name='at' />
                    Mentions
                </Menu.Item>

                <Menu.Item
                    name='info circle'
                    active={activeItem === 'info circle'}
                    onClick={handleItemClick4}
                >
                    <Icon name='info circle' />
                    You
                </Menu.Item>
            </Menu>
        </>
    )
}

export default MobileDMs
