import React, { useState, useEffect } from 'react'
import { Button, Dropdown, Grid, Header, Icon, Image, Input, Menu, Modal } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import AvatarEditor from 'react-avatar-editor'
import firebase from "../../firebase"
import { setUser } from '../../redux/User/userActions';

function UserPanel() {
    const [users, setUsers] = useState(null)
    const [modal, setModal] = useState(false);
    const [previewImage, setPreviewImage] = useState('')
    const [croppedImage, setCroppedImage] = useState('')
    const [uploadedCroppedImage, setUploadedCroppedImage] = useState('')
    const [blob, setBlob] = useState('');
    const [storageRef] = useState(firebase.storage().ref());
    const [userRef] = useState(firebase.auth().currentUser);
    const [usersRef] = useState(firebase.database().ref("users"));
    const [metadata] = useState({
        contentType: "image/jpeg"
    });

    const user = useSelector(state=> state.user);
    const { currentUser } = user
    const dispatch = useDispatch()

    useEffect(() =>{
        setUsers(currentUser)
    },[currentUser]);

    const closeModal = () => {
        setModal(false)
        setCroppedImage("");
        setPreviewImage("")
    }
    const openModal = () => {
        setModal(true)
    }

    const dropdownOptions = () =>[
        {
            key: "user",
            text: <span>Signed in as <strong>{users?.displayName}</strong></span>,
            disabled: true
        },
        {
            key: "avatar",
            text: <span onClick={openModal} >Change Avatar</span>
        },
        {
            key: "signout",
            text: <span onClick={handleSignOut} >Sign Out</span>
        }
    ]
    const handleSignOut = () => {
        firebase.auth().signOut().then(() => {
            
        })
    }
    let avatarEditor = ""
    const handleChange = event => {
        const fileI = event.target.files[0];
        const reader = new FileReader()
        if(fileI){
            reader.readAsDataURL(fileI)
            reader.addEventListener("load",()=>{
                setPreviewImage(reader.result)
            })
        }
    }
    const uploadCroppedImage = () =>{
        storageRef.child(`avatars/users/${currentUser.uid}`).put(blob, metadata).then((snap) =>{
            snap.ref.getDownloadURL().then((downloadURL) => setUploadedCroppedImage(downloadURL))
        })
    }
    const handleCropImage = () =>{
        if(avatarEditor){
            avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob)
                setCroppedImage(imageUrl)
                setBlob(blob)
            })
        }
    }
    useEffect(()=>{
        if(uploadedCroppedImage){
            userRef.updateProfile({
                photoURL: uploadedCroppedImage
            }).then(()=>{
                
            }).catch((err)=>{
                console.error(err);
            })
            usersRef.child(currentUser.uid).update({
                avatar: uploadedCroppedImage
            }).then(()=>{
                closeModal();
                dispatch(setUser(userRef))
                setUsers(userRef)
                setUploadedCroppedImage("")
            }).catch((err)=>{
                console.error(err);
            })
        }
    },[uploadedCroppedImage, userRef, usersRef, currentUser, dispatch])
    return window.screen.width > 991? (
        <Grid style={{ background: window.screen.width > 991 && "#611f69" }} >
            <Grid.Column>
                <Grid.Row style={{ padding: "1.2em", margin: 0 }} >
                    <Header inverted floated="left" as="h2" >
                        <Icon name="slack" />
                        <Header.Content>Slack</Header.Content>
                    </Header>
                    <Header style={{ padding: "0.25em" }} inverted as="h4" >
                    <Dropdown 
                        trigger={
                            <span>
                                <Image src={users?.photoURL} spaced="right" avatar />  {users?.displayName}
                            </span>
                        }
                        options={
                            dropdownOptions()
                        }
                    />
                </Header>
                </Grid.Row>
                <Modal basic open={modal} onClose={closeModal}>
                    <Modal.Header>Change Avatar</Modal.Header>
                    <Modal.Content>
                        <Input 
                        fluid
                        onChange={handleChange}
                        type="file"
                        label="new Avatar"
                        name="previewImage"
                        />
                        <Grid centered stackable columns={2} >
                            <Grid.Row centered >
                                <Grid.Column className="ui center aligned grid" >
                                    {previewImage && (
                                        <AvatarEditor 
                                        ref={node=>(avatarEditor = node)}
                                        image={previewImage}
                                        width={120}
                                        height={120}
                                        border={50}
                                        scale={1.2}
                                        />
                                    )}
                                </Grid.Column>
                                <Grid.Column>
                                    {croppedImage && (<Image 
                                    style={{ margin: '3.5em auto' }}
                                    width={100}
                                    height= {100}
                                    src={croppedImage}
                                    />)}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Modal.Content>
                    <Modal.Actions>
                    {croppedImage && <Button color="green" inverted onClick={uploadCroppedImage} >
                        <Icon name="save" /> Change Avatar
                    </Button>}
                    <Button color="green" inverted onClick={handleCropImage} >
                        <Icon name="image" /> Preview
                    </Button>
                    <Button color="red" inverted onClick={closeModal} >
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
                </Modal>
            </Grid.Column>
        </Grid>
    ): (
        <>
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="user" /> User Profile
                    </span>{` `}
                    
                </Menu.Item>
                <Menu.Item>
                    <span>
                        <Image src={users?.photoURL} spaced="right" avatar />Signed in as <strong>{users?.displayName}</strong>
                    </span>
                </Menu.Item>
                <Menu.Item>
                    <span onClick={openModal} >Change Avatar <Icon name="edit" /></span>
                </Menu.Item>
                <Menu.Item>
                    <span onClick={handleSignOut} >Sign Out</span>
                </Menu.Item>
            </Menu.Menu>
            <Modal basic open={modal} onClose={closeModal}>
                    <Modal.Header>Change Avatar</Modal.Header>
                    <Modal.Content>
                        <Input 
                        fluid
                        onChange={handleChange}
                        type="file"
                        label="new Avatar"
                        name="previewImage"
                        />
                        <Grid centered stackable columns={2} >
                            <Grid.Row centered >
                                <Grid.Column className="ui center aligned grid" >
                                    {previewImage && (
                                        <AvatarEditor 
                                        ref={node=>(avatarEditor = node)}
                                        image={previewImage}
                                        width={120}
                                        height={120}
                                        border={50}
                                        scale={1.2}
                                        />
                                    )}
                                </Grid.Column>
                                <Grid.Column>
                                    {croppedImage && (<Image 
                                    style={{ margin: '3.5em auto' }}
                                    width={100}
                                    height= {100}
                                    src={croppedImage}
                                    />)}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Modal.Content>
                    <Modal.Actions>
                    {croppedImage && <Button color="green" inverted onClick={uploadCroppedImage} >
                        <Icon name="save" /> Change Avatar
                    </Button>}
                    <Button color="green" inverted onClick={handleCropImage} >
                        <Icon name="image" /> Preview
                    </Button>
                    <Button color="red" inverted onClick={closeModal} >
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
                </Modal>
        </>
            
    )
}

export default UserPanel
