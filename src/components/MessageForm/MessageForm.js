import React, { useState, useEffect } from 'react';
import uuidv4 from "uuid/dist/v4"
import firebase from "../../firebase";
import { useSelector } from 'react-redux';
import { Button, Input, Message, Segment } from 'semantic-ui-react';
import 'emoji-mart/css/emoji-mart.css'
import { Picker, emojiIndex } from 'emoji-mart'
import FileModal from '../FileModal/FileModal';

function MessageForm() {
    const [messages, setMessages] = useState('');
    const [nodeRef, setNodeRef] = useState('');
    const [uploadState, setUploadState] = useState('');
    const [uploadTask, setUploadTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [emojiPicker, setEmojiPicker] = useState(false);
    const [errors, setErrors] = useState([]);
    const [percentUploaded, setPercentUploaded] = useState(0);
    const [messagesRef] = useState(firebase.database().ref("messages"));
    const [typingRef] = useState(firebase.database().ref("typing"));
    const [storageRef] = useState(firebase.storage().ref());
    const [privateMessagesRef] = useState(firebase.database().ref("privateMessages"));

    const user = useSelector(state=> state.user);
    const { currentUser } = user
    const channel = useSelector(state=> state.channel);
    const { currentChannel, isPrivateChannel } = channel

    useEffect(()=>{
        if(currentChannel){
            setMessages('')
        }
    },[currentChannel])
    
    useEffect(() => {
        const getMessagesRef = () => {
            return isPrivateChannel ? privateMessagesRef : messagesRef
        }
        const pathToUpload = currentChannel ? currentChannel.id : null;
        const ref = getMessagesRef();

        const createMessage = (fileUrl = null)=>{
            const message ={
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                user:{
                    id: currentUser.uid,
                    name: currentUser.displayName,
                    avatar: currentUser.photoURL
                },
            }
            if(fileUrl !== null){
                message["image"] = fileUrl
            }else{
                message["content"] = messages
            }
            return message
        }

        const sendFileMessage = (fileUrl, ref, pathToUpload) =>{
            ref.child(pathToUpload).push().set(createMessage(fileUrl)).then(()=>{
                setUploadState("done")
                setUploadTask(null)
                closeModal()
            }).catch((err) =>{
                setErrors(errors.concat(err))
            })
        }

        if(uploadTask !== null){
            uploadTask.on("state_changed", (snap) =>{
                const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                setPercentUploaded(percentUploaded)
            },(err)=>{
                setErrors(errors.concat(err));
                setUploadState("error");
                setUploadTask(null)
            },()=>{
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL)=>{
                    sendFileMessage(downloadURL, ref, pathToUpload)
                    setPercentUploaded(0)
                    setUploadState("")
                }).catch((err)=>{
                    setErrors(errors.concat(err));
                    setUploadState("error");
                    setUploadTask(null)
                })
            })
        }
        const closeModal = () =>{
            setModal(false);
        }
        return function cleanup() {
            if(uploadTask !== null){
                uploadTask.cancel()
                setUploadTask(null)
            };
        };
    },[uploadTask, errors, messagesRef, currentChannel, currentUser, messages, privateMessagesRef, isPrivateChannel])

    const getPath = () => {
        return isPrivateChannel ? `chat/private/${currentChannel.id}` : `chat/public`;
    }
    const uploadFile = (file, metaData) => {
        const filePath = `${getPath()}/${uuidv4()}.jpg`
        setUploadState("uploading");
        setUploadTask(storageRef.child(filePath).put(file, metaData))
    }

    const openModal = () => setModal(true);
    const closeModal = () =>{
        if(uploadTask !== null){
            uploadTask.cancel()
            setUploadTask(null)
        }
        setModal(false);
    }
    const createMessage = ()=>{
        const message ={
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user:{
                id: currentUser.uid,
                name: currentUser.displayName,
                avatar: currentUser.photoURL
            },
            content: messages
        }
        return message
    }
    const displayErrors = errors => errors.map((error)=> <p key={error.message}>{error.message}</p>)

    //Get messagesRef
    const getMessagesRef = () => {
        return isPrivateChannel ? privateMessagesRef : messagesRef
    }
    const sendMessage = e => {
        e.preventDefault();
        const ref = getMessagesRef()
        if(messages){
            setLoading(true);
            setErrors([])
            ref.child(currentChannel.id).push().set(createMessage()).then(() =>{
                setLoading(false);
                setMessages("")
                typingRef.child(currentChannel.id).child(currentUser.uid).remove()
            }).catch((err)=>{
                let errors =[];
                setErrors(errors.concat(err))
                setLoading(false)
            })
        }else{
            setErrors(errors.concat({ message: "Add a message" }))
        }
    }
    const handleKeyDown = (event) => {
        if(event.ctrlKey && event.keyCode === 13){
            sendMessage()
        }
        if(messages.length > 0){
            typingRef.child(currentChannel.id).child(currentUser.uid).set(currentUser.displayName)
        }else{
            typingRef.child(currentChannel.id).child(currentUser.uid).remove()
        }
    }
    const handleTogglePicker = () =>{
        setEmojiPicker(picker => !picker)
    }
    const colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if (typeof emoji !== "undefined") {
                let unicode;
                if(typeof Object.values(emoji)[0] === 'object' && Object.values(emoji)[0] !== null){
                    unicode = Object.values(emoji)[0].native
                }else{
                    unicode = emoji.native;
                }
                if (typeof unicode !== "undefined") {
                return unicode;
                }
            }
            x = ":" + x + ":";
            return x;
            });
        };
    const handleAddEmoji = (emoji) =>{
        const oldMessage = messages
        const newMessage = colonToUnicode(` ${oldMessage} ${emoji.colons} `)
        setMessages(newMessage)
        setTimeout(()=> nodeRef.focus(), 0);
    }
    return (
        <Segment className="message__form" >
            {emojiPicker && (
                <Picker 
                    set="apple"
                    className="emojipicker"
                    onSelect={handleAddEmoji}
                    title="Pick your emoji"
                    emoji="point_up"
                />
            )}
            <Input 
                fluid
                className={errors.some(error => error.message.toLowerCase().includes("message")) ? "error":""}
                name="message"
                ref={node => setNodeRef(node)}
                value={messages}
                onKeyDown={handleKeyDown}
                onChange={(e)=> setMessages(e.target.value)}
                style={{ marginBottom: "0.7em" }}
                label={<Button icon="smile outline" onClick={handleTogglePicker} />}
                placeholder="Write your message"
            />
            {errors.length > 0 && (
                    <Message error>
                        {displayErrors(errors)}
                    </Message>
                )}
            <Button.Group icon widths={window.screen.width > 991 ? "2" : "4"} >
                <Button 
                    disabled={loading}
                    onClick={sendMessage}
                    color="orange"
                    content="Add Reply"
                    labelPosition="left"
                    icon="edit"
                />
                <Button 
                    disabled={loading}
                    onClick={openModal}
                    color="teal"
                    content="Upload Media"
                    labelPosition="right"
                    icon="cloud upload"
                />
            </Button.Group>
            <FileModal 
                modal={modal}
                closeModal={closeModal}
                uploadFile={uploadFile}
                uploadState={uploadState}
                percentUploaded={percentUploaded}
            />
        </Segment>
    )
}

export default MessageForm
