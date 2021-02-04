import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Segment, Comment, } from 'semantic-ui-react';
import firebase from "../../firebase";
import { setUserPosts } from '../../redux/Channels/channelActions';
import MessageForm from '../MessageForm/MessageForm';
import MessagesHeader from '../MessagesHeader/MessagesHeader';
import MapMessages from './MapMessages';
import Skeleton from './Skeleton';
import Typing from './Typing';

function Messages() {
    const [messagesRef] = useState(firebase.database().ref("messages"));
    const [privateMessagesRef] = useState(firebase.database().ref("privateMessages"));
    const [messages, setMessages] = useState([]);
    const [numUniqueUsers, setNumUniqueUsers] = useState("");
    const [nodeRef, setNodeRef] = useState("");
    const [messageLoading, setMessageLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [usersRef] = useState(firebase.database().ref("users"));
    const [typingRef] = useState(firebase.database().ref("typing"));
    const [isChannelStarred, setIsChannelStarred] = useState(false)
    const [firstLoad, setFirstLoad] = useState(true);
    const [typingUsers, setTypingUsers] = useState([]);

    const dispatch = useDispatch()
    const user = useSelector(state=> state.user);
    const { currentUser } = user;
    const channel = useSelector(state=> state.channel);
    const { currentChannel, isPrivateChannel } = channel;

    useEffect(() =>{
        setFirstLoad(true)
        setIsChannelStarred(false)
    },[currentChannel])

    useEffect(() => {
        
        // Count Users
        const countUniqueUsers = (loadedMessages) => {
            const uniqueUsers = loadedMessages?.reduce((acc, message) =>{
                if(!acc.includes(message.user.name)){
                    acc.push(message.user.name)
                }
                return acc
            },[])
            const users = loadedMessages.length > 0 ? uniqueUsers : undefined
            const numUniqueUsers = users === undefined ?`No Users` : users.length === 1 ? `${users.length} User` : `${users.length} Users`
            setNumUniqueUsers(numUniqueUsers)
        }
        //Get messagesRef
        const getMessagesRef = () => {
            return isPrivateChannel ? privateMessagesRef : messagesRef
        }

        const countUserPosts = (messages) =>{
            let userPosts = messages.reduce((acc, message)=>{
                if(message.user.name in acc){
                    acc[message.user.name].count += 1
                }else{
                    acc[message.user.name] ={
                        avatar: message.user.avatar,
                        count: 1
                    }
                }
                return acc
            },{})
            dispatch(setUserPosts(userPosts))
        }

        // Add messages Listener
        const addListensers = (channelId) =>{
            const ref = getMessagesRef();

            ref.child(channelId).on("value", (snap) =>{
                if(snap.val() === undefined || snap.val() === null){
                    setMessages([]);
                    setMessageLoading(false);
                }else{
                    setMessages(Object.values(snap.val()));
                    setMessageLoading(false);
                    
                }
                countUniqueUsers(snap.val()? Object.values(snap.val()) : [])
                countUserPosts(snap.val()? Object.values(snap.val()) : [])
            })
        }

        const addUsersStarListener = (channelId, userId) => {
            usersRef.child(userId).child('starred').once("value", (snap)=>{
                if(snap.val() !== null) {
                    const channelIds = Object.keys(snap.val());
                    const prevStarred = channelIds.includes(channelId)
                    setIsChannelStarred(prevStarred)
                }
            })
        }

        const addTypingListeners = channelId =>{
            let typingUsers = [];
            typingRef.child(channelId).on("value", snap=>{
                if(snap.val()){
                    typingUsers = Object.entries(snap.val()).filter((type)=> type[0] !== currentUser.uid).map(type =>{
                        return {
                            id: type[0],
                            name: type[1]
                        }
                    })
                    setTypingUsers(typingUsers)
                }else{
                    setTypingUsers([])
                }
            })
        }

        if(currentUser && currentChannel){
            addListensers(currentChannel.id)
            addTypingListeners(currentChannel.id)
            addUsersStarListener(currentChannel.id, currentUser.uid)
        }
    },[currentUser, currentChannel, messagesRef, isPrivateChannel, privateMessagesRef, usersRef, dispatch, typingRef, nodeRef]);

    // Search messages
    useEffect(() =>{

        const handleSearchMessages = () => {
            const channelMessages = [...messages]  
            const regex = new RegExp(searchTerm, "gi");
            const searchResults = channelMessages?.reduce((acc, message)=> {
                if((message.content && message.content.match(regex)) || message.user.name.match(regex) ){
                    acc.push(message)
                }
                return acc
            },[])
                setSearchResult(searchResults)
                setTimeout(()=>setSearchLoading(false), 1000);
            }

        if(searchTerm.trim()){
            handleSearchMessages()
        }
    },[messages, searchTerm]);


    useEffect(()=>{
        if(isChannelStarred && !firstLoad){
            usersRef.child(`${currentUser.uid}/starred`).update({
                [currentChannel.id]: {
                    name: currentChannel.name,
                    details: currentChannel.details,
                    createdBy: {
                        name: currentChannel.createdBy.name,
                        avatar: currentChannel.createdBy.avatar
                    }
                }
            })
            setFirstLoad(true)
        }else{
            if(currentUser && currentChannel && !firstLoad){
                        usersRef.child(`${currentUser.uid}/starred`).child(currentChannel.id).remove((err)=>{
                            if(err) console.log(err)
                        })
                    
            }
            }
    },[currentUser, currentChannel, isChannelStarred, usersRef, firstLoad])
    

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        setSearchLoading(true)
    }
    const displayMessages = (messages) =>(
        messages?.map((message)=> <MapMessages message={message} key={message.timestamp} User={currentUser} />)
    )
    const displayChannel = (channel) => {
        return channel ? `${isPrivateChannel ? `@` : `#`}${channel.name}` : ``
    }
    const handleStar = () => {
        setIsChannelStarred(isChannelStarred => !isChannelStarred)
        setFirstLoad(false)
    }
    const displayTypingUsers = usersTyping => {
        return usersTyping.length > 0 && usersTyping.map(user=>(
            <div style={{ display: "flex", alignItems: "center", marginBottom:"0.2em"}} key={user.id} >
                <span className="user__typing">{user.name} is typing</span> <Typing />
            </div>
        ))
    }
    useEffect(()=>{
        const scrollToBottom = () => {
            nodeRef.scrollIntoView({ behavior: "smooth" })
        }
        if(nodeRef){
            scrollToBottom();
        }
    },[nodeRef, messages])
    return (
        <>
            <MessagesHeader 
                channelName ={displayChannel(currentChannel)}
                numUniqueUsers={numUniqueUsers}
                handleSearchChange={handleSearchChange}
                searchLoading={searchLoading}
                handleStar={handleStar}
                isChannelStarred={isChannelStarred}
            />
            <Segment>
                <Comment.Group className="messages">
                    {messageLoading && (
                        <>
                            {[...Array(10)].map((_,i)=>(
                                <Skeleton key={i} />
                            ))}
                        </>
                    )}
                    {searchTerm ? displayMessages(searchResult) : displayMessages(messages)}
                    {displayTypingUsers(typingUsers)}
                    <div ref={node => setNodeRef(node)} ></div>
                </Comment.Group>
            </Segment>
            <MessageForm />
        </>
    )
}

export default Messages
