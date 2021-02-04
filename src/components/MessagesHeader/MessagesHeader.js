import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Header, Icon, Input, Segment } from 'semantic-ui-react'

function MessagesHeader({ channelName, numUniqueUsers, handleSearchChange, searchLoading, handleStar, isChannelStarred }) {
    const channel = useSelector(state=> state.channel);
    const { isPrivateChannel } = channel;

    const history = useHistory()
    const goBack = () => history.goBack();
    const goToAbout = () => history.push('/about-channel');
    return (
        <Segment clearing>
            {(window.screen.width < 991 && !isPrivateChannel) && (
                    <Header floated="right" >
                        <Icon 
                        name="info circle"
                        onClick={goToAbout}
                        />
                    </Header>
                )}
            <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }} >
                <span>
                    {channelName}
                    {!isPrivateChannel && 
                    <Icon
                    onClick={handleStar} 
                    name={isChannelStarred ? "star" : "star outline"} 
                    color={isChannelStarred ? "yellow" : "black"} />}
                </span>
                <Header.Subheader>{!isPrivateChannel && numUniqueUsers}</Header.Subheader>
            </Header>
            <Header floated="right" >
                <Input 
                    onChange={handleSearchChange }
                    loading={searchLoading}
                    size="mini"
                    icon="search"
                    name="searchTerm"
                    placeholder="Search Messages"
                />
            </Header>
            {window.screen.width < 991 && (
                    <Header floated="left" >
                        <Icon 
                        name="arrow left"
                        onClick={goBack}
                        />
                    </Header>
                )}
        </Segment>
    )
}

export default MessagesHeader
