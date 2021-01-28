import React from 'react';
import { useSelector } from 'react-redux';
import { Comment, Image } from 'semantic-ui-react';
import moment from 'moment';

function MapMessages({ message, User }) {
    
    const user = useSelector(state=> state.user);
    const { currentUser } = user;
    
    const isOwnMessage =( message, user ) => {
        return message.user.id === user.uid ? "message__self": ""
    }
    const isImage = (message) => {
        return message.hasOwnProperty( "image") && !message.hasOwnProperty("content")
    }
    const timeFromNow = (timestamp) => moment(timestamp).fromNow();
    return (
        <Comment>
            <Comment.Avatar src={message.user.avatar} />
            <Comment.Content className={isOwnMessage(message, User)} >
                <Comment.Author as="a" >{message.user.name === currentUser.displayName ? "You" : message.user.name}</Comment.Author>
                <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
                {isImage(message) ? <Image src={message.image} className="message__image" /> :
                    <Comment.Text>{message?.content}</Comment.Text>
                }
            </Comment.Content>
        </Comment>
    )
}

export default MapMessages
