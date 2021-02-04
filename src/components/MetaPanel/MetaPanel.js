import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Accordion, Header, Icon, Segment, Image, List } from 'semantic-ui-react';

function MetaPanel() {
    const [activeIndex, setAcctiveIndex] = useState(0)

    const channel = useSelector(state=> state.channel);
    const { isPrivateChannel, currentChannel, userPosts } = channel;

    const history = useHistory()
    const goBack = () => history.push('/messages');

    const setActiveIndex = (event, titleProps) =>{
        const {index} = titleProps
        const newIndex = activeIndex === index ? -1 : index;
        setAcctiveIndex(newIndex)
    }
    const displayTopPosters= (posts) =>{
        return Object.entries(posts).sort((a,b) =>(
            b[1].count - a[1].count
        )).map(([key, value], i)=>(
            <List.Item key={i} >
                <Image avatar src={value.avatar} />
                <List.Content>
                    <List.Header as="a" >
                        {key}
                    </List.Header>
                    <List.Description>
                        {value.count} {value.count > 1 ? "posts" : "post"}
                    </List.Description>
                </List.Content>
            </List.Item>
        )
        ).slice(0,5)
    }
    if(isPrivateChannel) return null
    return (
        <div>
            {window.screen.width < 991 && (
                <Segment clearing>
                <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }} >
                    <span>
                        #{currentChannel && currentChannel.name}
                    </span>
                </Header>
                {window.screen.width < 991 && (
                        <Header floated="right" >
                            <Icon 
                            name="arrow left"
                            onClick={goBack}
                            />
                        </Header>
                    )}
            </Segment> 
            )}
            <Segment loading={!currentChannel} >
                <Header as="h3" attached="top" >
                    About # {currentChannel && currentChannel.name}
                </Header>
                <Accordion styled attached="true" >
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={setActiveIndex}
                    >
                        <Icon name="dropdown" />
                        <Icon name="info" />
                        Channel Details
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0} >
                        {currentChannel && currentChannel.details}
                    </Accordion.Content>

                    <Accordion.Title
                        active={activeIndex === 1}
                        index={1}
                        onClick={setActiveIndex}
                    >
                        <Icon name="dropdown" />
                        <Icon name="user circle" />
                        Top Posters
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 1} >
                        <List>
                            {userPosts && displayTopPosters(userPosts)}
                        </List>
                    </Accordion.Content>

                    <Accordion.Title
                        active={activeIndex === 2}
                        index={2}
                        onClick={setActiveIndex}
                    >
                        <Icon name="dropdown" />
                        <Icon name="pencil alternate" />
                        Created By
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 2} >
                        <Header as="h3" >
                            <Image circular src={(currentChannel && currentChannel.createdBy) && currentChannel.createdBy.avatar} />
                            {(currentChannel && currentChannel.createdBy) && `  ${currentChannel.createdBy.name}`}
                        </Header>
                    </Accordion.Content>
                </Accordion>
            </Segment>
        </div>
        
    )
}

export default MetaPanel
