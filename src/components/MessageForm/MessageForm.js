import React, { useState, useEffect } from 'react';
import uuidv4 from "uuid/dist/v4"
import firebase from "../../firebase";
import { useSelector } from 'react-redux';
import { Button, Input, Message, Segment } from 'semantic-ui-react'
import FileModal from '../FileModal/FileModal';

function MessageForm() {
    const [messages, setMessages] = useState('');
    const [uploadState, setUploadState] = useState('');
    const [uploadTask, setUploadTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [errors, setErrors] = useState([]);
    const [percentUploaded, setPercentUploaded] = useState(0);
    const [messagesRef] = useState(firebase.database().ref("messages"));
    const [storageRef] = useState(firebase.storage().ref());
    const [privateMessagesRef] = useState(firebase.database().ref("privateMessages"));

    const user = useSelector(state=> state.user);
    const { currentUser } = user
    const channel = useSelector(state=> state.channel);
    const { currentChannel, isPrivateChannel } = channel
    
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
    },[uploadTask, errors, messagesRef, currentChannel, currentUser, messages, privateMessagesRef, isPrivateChannel])

    const getPath = () => {
        return isPrivateChannel ? `chat/private-${currentChannel.id}` : `chat/public`;
    }
    const uploadFile = (file, metaData) => {
        const filePath = `${getPath()}/${uuidv4()}.jpg`
        setUploadState("uploading");
        setUploadTask(storageRef.child(filePath).put(file, metaData))
    }

    const openModal = () => setModal(true);
    const closeModal = () => setModal(false);
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
            }).catch((err)=>{
                let errors =[];
                setErrors(errors.concat(err))
                setLoading(false)
            })
        }else{
            setErrors(errors.concat({ message: "Add a message" }))
        }
    }
    return (
        <Segment className="message__form" >
            <Input 
                fluid
                className={errors.some(error => error.message.toLowerCase().includes("message")) ? "error":""}
                name="message"
                value={messages}
                onChange={(e)=> setMessages(e.target.value)}
                style={{ marginBottom: "0.7em" }}
                label={<Button icon="add" />}
                placeholder="Write your message"
            />
            {errors.length > 0 && (
                    <Message error>
                        {displayErrors(errors)}
                    </Message>
                )}
            <Button.Group icon widths="2" >
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
