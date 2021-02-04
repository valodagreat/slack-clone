import React, { useState } from 'react'
import { useHistory } from 'react-router-dom';
import { Icon, Menu } from 'semantic-ui-react';
import UserPanel from '../UserPanel/UserPanel';
import MobileHeader from './MobileHeader';
//import { useSelector } from 'react-redux';

function MobileUserInfo() {
    const [activeItem, setActiveItem]= useState('info circle');
    const history = useHistory()

    //const user = useSelector(state=> state.user);
    //const { currentUser } = user

    const handleItemClick = (e, { name }) => setActiveItem(name)
    const handleItemClick2 = (e, { name }) => {
        setActiveItem(name)
        history.push('/direct-messages')
    }
    const handleItemClick1 = (e, { name }) => {
        setActiveItem(name)
        history.push('/')
    }
    return (
        <>
            <MobileHeader />
            <Menu fluid vertical size="massive" style={{minHeight: 500}}  >
                <UserPanel />
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
                    onClick={handleItemClick}
                >
                    <Icon name='info circle' />
                    You
                </Menu.Item>
            </Menu> 
        </>
    )
}

export default MobileUserInfo
