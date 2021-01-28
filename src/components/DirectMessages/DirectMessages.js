import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Menu } from 'semantic-ui-react';
import firebase from "../../firebase";
import { setCurrentChannel, setPrivateChannel } from '../../redux/Channels/channelActions';

export class DirectMessages extends Component {
    state = {
        user: this.props.currentUser,
        users: [],
        activeChannel:"",
        usersRef: firebase.database().ref("users"),
        connectedRef: firebase.database().ref(".info/connected"),
        presenceRef: firebase.database().ref("presence"),
    }

    componentDidMount(){
        if(this.state.user){
            this.addListensers(this.state.user.uid)
        }
    }

    addStatusToUser = (userId, connected=true) => {
        const { users } = this.state
        const updatedUsers = users.reduce((acc, user) =>{
            if(user.uid === userId){
                user["status"] = `${connected ? 'online' : 'offline'}`
            }
            return acc.concat(user)
        },[])
        this.setState({users: updatedUsers})
    }

    addListensers = currentUserUid => {
        const { usersRef, connectedRef, presenceRef } = this.state
        let loadedUsers = [];

        usersRef.on("child_added", (snap) =>{
            if(currentUserUid !== snap.key){
                let user = snap.val();
                user["uid"] = snap.key
                user["status"] = "offline"
                loadedUsers.push(user)
                this.setState({users: loadedUsers})
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
                this.addStatusToUser(snap.key)
            }
        });

        presenceRef.on("child_removed", (snap)=>{
            if(currentUserUid !== snap.key){
                this.addStatusToUser(snap.key, false)
            }
        })
    }

    changeChannel = user =>{
        const channelId = this.getChannelId(user.uid);
        const channelData = {
            id: channelId,
            name: user.name
        }
        this.props.setCurrentChannel(channelData);
        this.props.setPrivateChannel(true)
        this.setState({activeChannel: user.uid})
    }

    getChannelId = userId =>{
        const { currentUser } = this.props
        const currentUserId = currentUser.uid
        return userId < currentUserId ? `${userId}/${currentUserId}` : `${currentUserId}/${userId}`
    }

    /*const setActiveChannelId = (userId) => {
        setActiveChannel(userId)
    }*/

    isUserOnline = (user) => user.status === "online"

    render() {
        const { users, activeChannel } = this.state
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
                        onClick={()=> this.changeChannel(user)}
                        style={{ opacity: 0.7, fontStyle: "italic" }}
                    >
                        <Icon 
                            name="circle"
                            color={this.isUserOnline(user) ? "green" : "red"}
                        />
                        @{user.name}
                    </Menu.Item>
                ))}
            </Menu.Menu>
            )
    }
}

export default connect(null, { setCurrentChannel, setPrivateChannel } )(DirectMessages)
