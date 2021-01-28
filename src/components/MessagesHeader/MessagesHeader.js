import React from 'react';
import { useSelector } from 'react-redux';
import { Header, Icon, Input, Segment } from 'semantic-ui-react'

function MessagesHeader({ channelName, numUniqueUsers, handleSearchChange, searchLoading }) {
    const channel = useSelector(state=> state.channel);
    const { isPrivateChannel } = channel;
    return (
        <Segment clearing>
            <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }} >
                <span>
                    {channelName}
                    {!isPrivateChannel && <Icon name={"star outline"} color="black" />}
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
        </Segment>
    )
}

export default MessagesHeader
