import React, { useState, useEffect}from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Icon, Menu } from 'semantic-ui-react';
import firebase from "../../firebase"
import { setCurrentChannel, setPrivateChannel } from '../../redux/Channels/channelActions';

function DirectMessages() {
    const user = useSelector(state=> state.user);
    const { currentUser } = user;
    const [users, setUsers] = useState([]);
    const [activeChannel, setActiveChannel] = useState("")
    const [usersRef] = useState(firebase.database().ref("users"));
    const [connectedRef] = useState(firebase.database().ref(".info/connected"));
    const [presenceRef] = useState(firebase.database().ref("presence"));
    
    const dispatch = useDispatch()

    useEffect(() => {
        const addStatusToUser = (userId, connected=true) => {
            const updatedUsers = users.reduce((acc, user) =>{
                if(user.uid === userId){
                    user["status"] = `${connected ? 'online' : 'offline'}`
                }
                return acc.concat(user)
            },[])
            setUsers(updatedUsers)
        }

        const addListensers = currentUserUid => {
            let loadedUsers = [];

            usersRef.on("value", (snap) =>{
                if(snap.val()){
                    loadedUsers = Object.entries(snap.val()).filter(user=>(
                        currentUserUid !== user[0]
                    )).map(user => {
                        return (
                            {...user[1], uid: user[0], status: "offline"}
                        )
                    });
                    setUsers(loadedUsers)
                }
                
            });

            connectedRef.on("value", (snap)=>{
                if(snap.val() === true){
                    const ref = presenceRef.child(currentUserUid)
                    ref.set(true);
                    ref.onDisconnect().remove((err)=>{
                        if(err !== null){
                            console.log(err)
                        }
                    })
                }
            });

            presenceRef.on("child_added", (snap)=>{
                if(currentUserUid !== snap.key){
                    addStatusToUser(snap.key)
                }
            });

            presenceRef.on("child_removed", (snap)=>{
                if(currentUserUid !== snap.key){
                    addStatusToUser(snap.key, false)
                }
            })
        }
        if(currentUser){
            addListensers(currentUser.uid)
        }
        return ()=> {
            usersRef.off()
            connectedRef.off()
            presenceRef.off()
            setActiveChannel("")
        }
    },[currentUser, users, usersRef, connectedRef, presenceRef]);

    const changeChannel = user =>{
        const channelId = getChannelId(user.uid);
        const channelData = {
            id: channelId,
            name: user.name
        }
        dispatch(setCurrentChannel(channelData));
        dispatch(setPrivateChannel(true))
        setActiveChannel(user.uid)
    }

    const getChannelId = userId =>{
        const currentUserId = currentUser.uid
        return userId < currentUserId ? `${userId}/${currentUserId}` : `${currentUserId}/${userId}`
    }

    /*const setActiveChannelId = (userId) => {
        setActiveChannel(userId)
    }*/

    const isUserOnline = (user) => user.status === "online"

    return (
        <Menu.Menu className="menu">
            <Menu.Item>
                <span>
                    <Icon name="mail" /> DIRECT MESSAGES
                </span>{` `}
                ({users?.length})
            </Menu.Item>
            {users?.map(user =>(
                <Menu.Item
                    key={user.uid}
                    active={user.uid === activeChannel}
                    onClick={()=> changeChannel(user)}
                    style={{ opacity: 0.7, fontStyle: "italic" }}
                >
                    <Icon 
                        name="circle"
                        color={isUserOnline(user) ? "green" : "red"}
                    />
                    @{user.name}
                </Menu.Item>
            ))}
        </Menu.Menu>
    )
}

export default DirectMessages

/*if(currentUserUid !== snap.key){
                    let user = snap.val();
                    user["uid"] = snap.key
                    user["status"] = "offline"
                    loadedUsers.push(user)
                    setUsers(loadedUsers)
                }*/