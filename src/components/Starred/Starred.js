import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firebase from "../../firebase";
import { Icon, Menu } from 'semantic-ui-react';
import { setCurrentChannel, setPrivateChannel } from '../../redux/Channels/channelActions';

function Starred() {
    const [starredChannels, setStarredChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState("");
    const [usersRef] = useState(firebase.database().ref("users"));
    
    const dispatch = useDispatch()
    const user = useSelector(state=> state.user);
    const { currentUser } = user;

    useEffect(()=>{

        const addListeners = userId =>{
            usersRef.child(userId).child('starred').on("value", snap=>{
                if(snap.val()){
                    let loadedStarred = Object.entries(snap.val()).map(star => {
                        return {
                            id: star[0],
                            ...star[1]
                        }
                    });
                    setStarredChannels(loadedStarred)
                }
            })
        }

        if(currentUser){
            addListeners(currentUser.uid)
        }
        return function cleanup() {
            if(currentUser){
                usersRef.child(currentUser.uid).child('starred').off();
            }
        };
    },[currentUser, usersRef]);

    const displayChannels = (starredChannels) => {
        return (
            starredChannels?.map((channel)=>(
                <Menu.Item
                    key={channel.id}
                    onClick={()=>changeChannel(channel)}
                    name={channel.name}
                    style={{ opacity: 0.7 }}
                    active={channel.id === activeChannel}
                >
                    # {channel.name}
                </Menu.Item>
            ))
        )
    }
    const changeChannel = (channel) => {
        setActiveChannel(channel.id)
        dispatch(setCurrentChannel(channel))
        dispatch(setPrivateChannel(false));
    }
    return (
        <Menu.Menu className="menu" >
            <Menu.Item>
                <span>
                    <Icon name='star' /> STARRED
                </span>{" "}
                ({starredChannels.length})
            </Menu.Item>
            {displayChannels(starredChannels)}
        </Menu.Menu>
    )
}

export default Starred
