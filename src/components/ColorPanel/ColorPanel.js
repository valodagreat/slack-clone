import React, { useState, useEffect } from 'react'
import { Button, Divider, Icon, Label, Menu, Modal, Segment, Sidebar } from 'semantic-ui-react';
import firebase from "../../firebase";
import { useSelector, useDispatch } from 'react-redux';
import { SliderPicker } from 'react-color';
import { setColors } from '../../redux/User/userActions';

function ColorPanel() {
    const [modal, setModal] = useState(false);
    const [primary, setPrimary] = useState("");
    const [secondary, setSecondary] = useState("");
    const [usersRef] = useState(firebase.database().ref("users"));
    const [userColors, setUserColors] = useState("");
    const user = useSelector(state=> state.user);
    const { currentUser } = user;
    const dispatch = useDispatch()

    useEffect(() => {
        const addListener = (userId) => {
            let userColors = []
            usersRef.child(`${userId}/colors`).on("child_added", snap=>{
                userColors.unshift(snap.val());
                setUserColors(userColors)
            })
        }
        if(currentUser){
            addListener(currentUser.uid)
        }
        return () => {
            usersRef.child(`${currentUser.uid}/colors`).off()
        }
    },[currentUser, usersRef])
    const closeModal = () => {
        setModal(false)
    }
    const openModal = () => {
        setModal(true)
    }
    
    const handlePrimary = color => setPrimary(color.hex);
    const handleSecondary = color => setSecondary(color.hex);

    const handleSaveColor = () => {
        if(primary && secondary){
            saveColors(primary, secondary)
        }
    }
    const saveColors = (primary, secondary) => {
        usersRef.child(`${currentUser.uid}/colors`).push().update({
            primary,
            secondary
        }).then(() => closeModal()).catch(err => console.log(err))
    }
    const displayUserColors = (colors) => (
        colors && colors.map((color, i) =>(
            <React.Fragment key={i} >
                <Divider />
                <div className="color__container" onClick={()=> dispatch(setColors(color.primary, color.secondary))} >
                    <div className="color__square" style={{ background: color.primary }} >
                        <div className="color__overlay" style={{ background: color.secondary }}>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        ))
    )
    return (
        <Sidebar
            as={Menu}
            icon="labeled"
            inverted
            vertical
            visible
            width="very thin"
        >
            <Divider />
            <Button icon="add" size="small" color="blue" onClick={openModal} />
            {displayUserColors(userColors)}

            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Choose App Colors</Modal.Header>
                <Modal.Content>

                    <Segment>
                        <Label content="Primary Color" />
                        <SliderPicker color={primary} onChange={handlePrimary} />
                    </Segment>
                    
                    <Segment>
                        <Label content="Secondary Color" />
                        <SliderPicker color={secondary} onChange={handleSecondary} />
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="green" inverted onClick={handleSaveColor} >
                        <Icon name="checkmark" /> Save Colors
                    </Button>
                    <Button color="red" inverted onClick={closeModal} >
                        <Icon name="remove" /> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        </Sidebar>
    )
}

export default ColorPanel
