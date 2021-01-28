import React, { useState, useEffect } from 'react';
import firebase from "../../firebase";
import { useSelector, useDispatch } from 'react-redux';
import { Button, Form, Icon, Input, Menu, Message, Modal } from 'semantic-ui-react';
import { setCurrentChannel, setPrivateChannel } from '../../redux/Channels/channelActions';

function ChannelsNews() {
    const [channels, setChannels ] = useState([]);
    const [channel, setChannel ] = useState(null);
    const [notifications, setNotifications ] = useState([]);
    const [messagesRef] = useState(firebase.database().ref("messages"));
    const [modal, setModal] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false)
    const [channelDetails, setChannelDetails] = useState("");
    const [channelRef] = useState(firebase.database().ref("channels"));
    const [firstLoad, setFirstLoad] = useState(true);
    const [activeChannel, setActiveChannel] = useState("");
    

    const dispatch = useDispatch()

    /*useEffect(() => {
        let loadedChannels = [];
        channelRef.on("child_added", (snap) =>{
            loadedChannels.push(snap.val());
            setChannels(loadedChannels);
        })
    },[channelRef])*/
    useEffect(() => {
        const handleNotifications = (channelId, currentChannelId, notifications, snap) =>{
            let lastTotal = 0
            console.log(notifications.findIndex(notification=> notification.id === channelId))
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
            setNotifications(notifications)
        };

        const addNotificationListener = (channelId) => {
            messagesRef.child(channelId).on("value",snap =>{
                if(channel){
                    handleNotifications(channelId, channel.id, notifications, snap)
                }
            })
        }
        channelRef.on("child_added",(snap)=>{
            addNotificationListener(snap.key)
        })
        return ()=>{
            channelRef.off()
            messagesRef.off()
        }
    },[channelRef,messagesRef, channel, notifications]);

    useEffect(() => {

        channelRef.on("value", (snap) =>{
            if(snap.val()){
                setChannels(Object.values(snap.val()));
                const firstChannel = channels[0]
                if(firstLoad && channels.length>0){
                    dispatch(setCurrentChannel(firstChannel))
                    setActiveChannel(firstChannel.id);
                    setFirstLoad(false)
                }
                
            }else{
                setChannels([])
            }
            
        })
        return () => {
            channelRef.off()
        }
    }, [channelRef,channels,dispatch,firstLoad, channel, messagesRef, notifications]);
    
    const user = useSelector(state=> state.user);
    const { currentUser } = user

    const closeModal = () => {
        setModal(false)
    }
    const openModal = () => {
        setModal(true)
    }
    const addChannel = () => {
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
            closeModal();
            setChannelName("");
            setChannelDetails("");
            setLoading(false)
        }).catch((err)=>{
            let errors =[]
            setErrors(errors.concat(err));
            setLoading(false);
        })
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if(isFormValid(channelName, channelDetails)){
            setLoading(true)
            setErrors([])
            addChannel();
        }
    }
    const displayErrors = errors => errors.map((error)=> <p key={error.message}>{error.message}</p>)

    const isFormValid = (channelName, channelDetails) => {
        if(channelName && channelDetails){
            return true
        }else{
            let errors = [];
            let error;
            error = {message: "Fill in all fields"};

            setErrors(errors.concat(error));

            return false
        }
    };
    const displayChannels = (channels) => {
        return (
            channels?.map((channel)=>(
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
    /*const setActiveChannelFunction = (channel) => {
        setActiveChannel(channel.id)
    }*/

    const changeChannel = (channel) => {
        setActiveChannel(channel.id)
        dispatch(setCurrentChannel(channel))
        dispatch(setPrivateChannel(false));
        setChannel(channel)
    }

    return (
        <>
            <Menu.Menu className="menu" >
                <Menu.Item>
                    <span>
                        <Icon name='exchange' /> CHANNELS
                    </span>{" "}
                    ({channels.length}) <Icon style={{ cursor: "pointer" }} name="add" onClick={openModal} />
                </Menu.Item>
                {displayChannels(channels)}
            </Menu.Menu>

            <Modal basic open={modal} onClose={closeModal} >
                <Modal.Header>Add a Channel</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={handleSubmit} >
                        <Form.Field>
                            <Input 
                                fluid
                                label="Name of Channel"
                                name="channelName"
                                value={channelName}
                                onChange={(e)=> setChannelName(e.target.value)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Input 
                                fluid
                                label="About the Channel"
                                name="channelDetails"
                                value={channelDetails}
                                onChange={(e)=> setChannelDetails(e.target.value)}
                            />
                        </Form.Field>
                    </Form>
                    {errors.length > 0 && (
                    <Message error>
                        {displayErrors(errors)}
                    </Message>
                )}
                </Modal.Content>
                <Modal.Actions>
                    <Button className={ loading? "loading":"" } disabled={loading} inverted color="green" onClick={handleSubmit} >
                        <Icon name="checkmark" /> Add
                    </Button>
                    <Button className={ loading? "loading":"" } disabled={loading} inverted color="red" onClick={closeModal} >
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        </>
    )
}

export default ChannelsNews
