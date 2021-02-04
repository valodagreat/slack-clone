import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Icon, Menu } from 'semantic-ui-react';
import firebase from "../../firebase";
import { setCurrentChannel, setPrivateChannel } from '../../redux/Channels/channelActions';
import DMwrap from './DMwrap';

export class DMs extends Component {
    state = {
        user: this.props.currentUser,
        channel: this.props.currentChannel,
        users: [],
        activeChannel:"",
        usersRef: firebase.database().ref("users"),
        connectedRef: firebase.database().ref(".info/connected"),
        presenceRef: firebase.database().ref("presence"),
        typingRef: firebase.database().ref("typing")
    }
    componentWillUnmount(){
        const { usersRef, connectedRef, presenceRef} = this.state
        this.setState({ activeChannel: "" })
        usersRef.off()
        connectedRef.off()
        presenceRef.off()
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
            const { typingRef, channel } = this.state
            if(snap.val() === true){
                const ref = presenceRef.child(currentUserUid)
                ref.set(true);
                ref.onDisconnect().remove((err)=>{
                    if(err !== null){
                        console.log(err)
                    }
                })
                if(channel){
                    typingRef.child(channel.id).child(currentUserUid).onDisconnect().remove((err)=>{
                        if(err !== null){
                            console.log(err)
                        }
                    })
                }
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


    /*const setActiveChannelId = (userId) => {
        setActiveChannel(userId)
    }*/

    isUserOnline = (user) => user.status === "online"

    render() {
        const { users } = this.state
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail" /> DIRECT MESSAGES
                    </span>{` `}
                    ({users?.length})
                </Menu.Item>
                {users?.map(user =>(
                    <DMwrap users={user} key={user.uid} />
                ))}
            </Menu.Menu>
            )
    }
}

export default withRouter(connect(null, { setCurrentChannel, setPrivateChannel } )(DMs))
