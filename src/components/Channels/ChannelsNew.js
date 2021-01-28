import React, { Component } from 'react';
import firebase from "../../firebase";
import { Button, Form, Icon, Input, Label, Menu, Message, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../redux/Channels/channelActions';

export class Channels extends Component {
    state ={
        channels : [],
        channel: null,
        notifications: [],
        messagesRef : firebase.database().ref("messages"),
        modal: false,
        channelName: "",
        errors : [],
        loading : false,
        channelDetails : "",
        channelRef : firebase.database().ref("channels"),
        firstLoad: true,
        activeChannel: "",
    }

    componentDidMount(){
        this.addListeners()
    };

    componentWillUnmount(){
        this.state.channelRef.off()
    }

    addListeners = () => {
        let loadedChannels = [];
        const { channelRef } = this.state
        channelRef.on("child_added",(snap)=>{
            loadedChannels.push(snap.val());
            this.setState({
                channels: loadedChannels
            },()=> this.setFirstChannel())
            this.addNotificationListener(snap.key)
        })
    }

    addNotificationListener = (channelId) => {
        const { messagesRef, channel, notifications } = this.state
        messagesRef.child(channelId).on("value",snap =>{
            if(channel){
                this.handleNotifications(channelId, channel.id, notifications, snap)
            }
        })
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.channel !== this.state.channel){
            const { channelRef } = this.state
            channelRef.on("child_added",(snap)=>{
                this.addNotificationListener(snap.key)
            })
        }
    }

    handleNotifications = (channelId, currentChannelId, notifications, snap) =>{
        console.log("got here")
        let lastTotal = 0
        
        let index = notifications.findIndex(notification=> notification.id === channelId);
        if(index !== -1){
            if( channelId !== currentChannelId){
                lastTotal = notifications[index].total
                if(snap.numChildren() - lastTotal > 0){
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren();
        }else{
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            });
        }
        this.setState({notifications: notifications});
    };

    setFirstChannel = () => {
        const { firstLoad, channels } = this.state
            const firstChannel = channels[0]
            if(firstLoad && channels.length>0){
                this.props.setCurrentChannel(firstChannel)
                this.setState({
                    activeChannel: firstChannel.id,
                    firstLoad: false,
                    channel: firstChannel
                })
            }
    }
    handleChange = (event) => {
        const { name, value } = event.target
        this.setState({
            [name] : value
        })
    }
    handleSubmit = (e) => {
        const {channelName, channelDetails} = this.state;
        e.preventDefault();
        if(this.isFormValid(channelName, channelDetails)){
            this.setState({
                loading:true,
                errors: [],
            })
            this.addChannel();
        }
    }
    closeModal = () => {
        this.setState({
            modal: false,
        });
    }
    openModal = () => {
        this.setState({
            modal: true,
        })
    }
    addChannel = () => {
        const { currentUser } = this.props
        const { channelRef, channelName, channelDetails } = this.state
        const key = channelRef.push().key

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: currentUser.displayName,
                avatar: currentUser.photoURL
            }
        }
        channelRef.child(key).update(newChannel).then(()=>{
            this.closeModal();
            this.setState({
                channelName: "",
                channelDetails: "",
                loading: false
            })
        }).catch((err)=>{
            let errors =[]
            this.setState({
                errors: errors.concat(err),
                loading: false
            });
        })
    }
    displayErrors = errors => errors.map((error)=> <p key={error.message}>{error.message}</p>)

    isFormValid = (channelName, channelDetails) => {
        if(channelName && channelDetails){
            return true
        }else{
            let errors = [];
            let error;
            error = {message: "Fill in all fields"};

            this.setState({
                errors: errors.concat(error)
            })

            return false
        }
    };

    getNotificationCount = (channel) => {
        const { notifications } = this.state
        let count = 0
        notifications.forEach(notification =>{
            if(notification.id === channel.id){
                count = notification.count
            }
        })
        if(count > 0) return count
    }

    displayChannels = (channels) => {
        const { activeChannel } = this.state
        return (
            channels?.map((channel)=>(
                <Menu.Item
                    key={channel.id}
                    onClick={()=>this.changeChannel(channel)}
                    name={channel.name}
                    style={{ opacity: 0.7 }}
                    active={channel.id === activeChannel}
                >
                    {this.getNotificationCount(channel) && (
                        <Label color="red">{this.getNotificationCount(channel)}</Label>
                    )}
                    # {channel.name}
                </Menu.Item>
            ))
        )
    }
    changeChannel = (channel) => {
        this.setState({
            channel,
            activeChannel: channel.id
        })
        this.clearNotifications()
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false);

    }

    clearNotifications = () => {
        const { notifications, channel } = this.state
        let index = notifications.findIndex(notification=> notification.id === channel.id);
        if(index !== -1){
            let updatedNotifications = [...notifications]
            updatedNotifications[index].total = notifications[index].lastKnownTotal
            updatedNotifications[index].count = 0
            this.setState({notifications: updatedNotifications})
        }
    }
    /*setActiveChannelFunction = (channel) => {
        setActiveChannel(channel.id)
    }*/
    render() {
        const {channels, modal, errors, loading, channelName, channelDetails} = this.state
        return (
            <>
                <Menu.Menu className="menu" >
                <Menu.Item>
                    <span>
                        <Icon name='exchange' /> CHANNELS
                    </span>{" "}
                    ({channels.length}) <Icon style={{ cursor: "pointer" }} name="add" onClick={this.openModal} />
                </Menu.Item>
                {this.displayChannels(channels)}
            </Menu.Menu>

            <Modal basic open={modal} onClose={this.closeModal} >
                <Modal.Header>Add a Channel</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={this.handleSubmit} >
                        <Form.Field>
                            <Input 
                                fluid
                                label="Name of Channel"
                                name="channelName"
                                value={channelName}
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Input 
                                fluid
                                label="About the Channel"
                                name="channelDetails"
                                value={channelDetails}
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                    </Form>
                    {errors.length > 0 && (
                    <Message error>
                        {this.displayErrors(errors)}
                    </Message>
                )}
                </Modal.Content>
                <Modal.Actions>
                    <Button className={ loading? "loading":"" } disabled={loading} inverted color="green" onClick={this.handleSubmit} >
                        <Icon name="checkmark" /> Add
                    </Button>
                    <Button className={ loading? "loading":"" } disabled={loading} inverted color="red" onClick={this.closeModal} >
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
            </>
        )
    }
}

export default connect(null, { setCurrentChannel, setPrivateChannel } )(Channels)
