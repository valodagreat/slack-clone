import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Segment, Comment, Loader } from 'semantic-ui-react';
import firebase from "../../firebase";
import MessageForm from '../MessageForm/MessageForm';
import MessagesHeader from '../MessagesHeader/MessagesHeader';
import MapMessages from './MapMessages';

function Messages() {
    const [messagesRef] = useState(firebase.database().ref("messages"));
    const [privateMessagesRef] = useState(firebase.database().ref("privateMessages"));
    const [messages, setMessages] = useState([]);
    const [numUniqueUsers, setNumUniqueUsers] = useState("");
    const [messageLoading, setMessageLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const user = useSelector(state=> state.user);
    const { currentUser } = user;
    const channel = useSelector(state=> state.channel);
    const { currentChannel, isPrivateChannel } = channel;

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
        // Add messages Listener
        if(currentUser && currentChannel){
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
                })
            }
            addListensers(currentChannel.id)
        }
    },[currentUser, currentChannel, messagesRef, isPrivateChannel, privateMessagesRef]);

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
    return (
        <>
            <MessagesHeader 
                channelName ={displayChannel(currentChannel)}
                numUniqueUsers={numUniqueUsers}
                handleSearchChange={handleSearchChange}
                searchLoading={searchLoading}
            />
            <Segment>
                <Comment.Group className="messages">
                    {searchTerm ? displayMessages(searchResult) : displayMessages(messages)}
                    {messageLoading && <Loader active />}
                </Comment.Group>
            </Segment>
            <MessageForm />
        </>
    )
}

export default Messages
