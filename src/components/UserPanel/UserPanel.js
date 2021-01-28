import React, { useState, useEffect } from 'react'
import { Dropdown, Grid, Header, Icon, Image } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import firebase from "../../firebase"

function UserPanel() {
    const [users, setUsers] = useState(null)

    const user = useSelector(state=> state.user);
    const { currentUser } = user
    
    useEffect(() =>{
        setUsers(currentUser)
    },[currentUser])

    const dropdownOptions = () =>[
        {
            key: "user",
            text: <span>Signed in as <strong>{users?.displayName}</strong></span>,
            disabled: true
        },
        {
            key: "avatar",
            text: <span>Change Avatar</span>
        },
        {
            key: "signout",
            text: <span onClick={handleSignOut} >Sign Out</span>
        }
    ]
    const handleSignOut = () => {
        firebase.auth().signOut().then(() => {
            console.log("Sign Out");
        })
    }
    return (
        <Grid style={{ background: "#611f69" }} >
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
            </Grid.Column>
        </Grid>
    )
}

export default UserPanel
