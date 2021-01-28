import React, { useState } from 'react';
import { Button, Icon, Input, Message, Modal } from 'semantic-ui-react';
import mime from "mime-types"
import ProgressBar from '../Messages/ProgressBar';

function FileModal({ modal, closeModal, uploadFile, uploadState, percentUploaded }) {
    const [file, setFile] = useState(null);
    const [authorized,] = useState(["image/jpeg", "image/png"]);
    const [errors, setErrors] = useState([]);

    const addFile = e => {
        const fileI = e.target.files[0]
        if(fileI){
            setFile(fileI)
        }
    }
    const displayErrors = errors => errors.map((error)=> <p key={error.message}>{error.message}</p>);

    const isAuthorized = fileName => authorized.includes(mime.lookup(fileName))

    const sendFile = () => {
        if(file !== null){
            if(isAuthorized(file.name)){
                setErrors([])
                const metaData = { contentType: mime.lookup(file.name) }
                uploadFile(file, metaData)
                clearFile();
            }else{
                setErrors(errors.concat({ message: "Invalid file type" }));
            }
        }else{
            setErrors(errors.concat({ message: "Please add a file" }))
        }
    }
    const clearFile = () => setFile(null)
    return (
        <Modal basic open={modal} onClose={closeModal} >
            <Modal.Header>Select an Image File</Modal.Header>
            <Modal.Content>
                <Input 
                    fluid
                    label="Files types: jpg,png"
                    name="file"
                    type="file"
                    onChange={addFile}
                />
                {
                    errors.length > 0 && (
                        <Message error>
                            {displayErrors(errors)}
                        </Message>)
                }
                <ProgressBar 
                    uploadState={uploadState}
                    percentUploaded={percentUploaded}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    color="green"
                    inverted
                    onClick={sendFile}
                    disabled={percentUploaded > 0}
                >
                    <Icon name="checkmark" /> Send
                </Button>
                <Button
                    color="red"
                    inverted
                    onClick={closeModal}
                >
                    <Icon name="remove" /> Cancel
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

export default FileModal
