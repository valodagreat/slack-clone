import React,{ useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Icon, Menu } from 'semantic-ui-react'
import { setCurrentChannel, setPrivateChannel } from '../../redux/Channels/channelActions';

function DMwrap({users}) {
    const [activeChannel, setActiveChannel] = useState('')
    const user = useSelector(state=> state.user);
    const { currentUser } = user;

    const dispatch = useDispatch();
    const history = useHistory()

    const isUserOnline = (user) => user.status === "online"

    const changeChannel = user =>{
        setActiveChannel(user.uid)
        const channelId = getChannelId(user.uid);
        const channelData = {
            id: channelId,
            name: user.name
        }
        dispatch(setCurrentChannel(channelData));
        dispatch(setPrivateChannel(true))
        history.push('/messages')
    }

    const getChannelId = userId =>{
        const currentUserId = currentUser.uid
        return userId < currentUserId ? `${userId}/${currentUserId}` : `${currentUserId}/${userId}`
    }
    return (
        <Menu.Item
            key={users.uid}
            active={users.uid === activeChannel}
            onClick={()=> changeChannel(users)}
            style={{ opacity: 0.7, fontStyle: "italic" }}
        >
            <Icon 
                name="circle"
                color={isUserOnline(users) ? "green" : "red"}
            />
            @{users.name}
        </Menu.Item>
    )
}

export default DMwrap
